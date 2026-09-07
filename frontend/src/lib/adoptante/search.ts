import { readFileSync } from "node:fs";
import { endianness } from "node:os";
import path from "node:path";

import {
  adopterPetfinderEmbeddingManifest,
  adopterProfiles,
  adopterTsinghuaPrototypeManifest,
} from "./artifacts.ts";
import { filterAdopterProfiles } from "./filters.ts";
import type { AdopterSearchState } from "../../types/adopterSearch.ts";
import type {
  AdopterBreedSearchResponse,
  AdopterSearchOptions,
  AdopterSearchResult,
} from "../../types/adopterResult.ts";

const FLOAT32_BYTES = 4;
const SERVER_DATA_DIRECTORY = path.join(process.cwd(), "server-data", "adoptante");

type SearchArtifacts = {
  petfinderEmbeddings: Float32Array;
  prototypes: Float32Array;
  profileRowByPetId: Map<string, number>;
  prototypeByLabel: Map<number, { row: number; displayName: string }>;
};

let cachedArtifacts: SearchArtifacts | undefined;
let artifactLoadCount = 0;

export class AdopterSearchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdopterSearchValidationError";
  }
}

/**
 * Runs the Phase B breed search entirely on the server. Structured PetFinder
 * filters are always applied before visual similarity is calculated.
 */
export function searchAdopterByBreed(
  state: AdopterSearchState,
  options: AdopterSearchOptions = {},
): AdopterBreedSearchResponse {
  if (state.referenceType !== "breed") {
    throw new AdopterSearchValidationError("referenceType must be breed");
  }
  if (!Number.isInteger(state.prototypeLabel)) {
    throw new AdopterSearchValidationError("prototypeLabel must be an integer");
  }

  const artifacts = loadSearchArtifacts();
  const prototype = artifacts.prototypeByLabel.get(state.prototypeLabel!);
  if (!prototype) {
    throw new AdopterSearchValidationError("prototypeLabel is not present in the manifest");
  }

  const candidates = filterAdopterProfiles(adopterProfiles, state);
  const candidateCount = candidates.length;
  if (candidateCount === 0) {
    return {
      mode: "similarity",
      referenceType: "breed",
      prototypeLabel: state.prototypeLabel!,
      prototypeName: prototype.displayName,
      candidateCount: 0,
      results: [],
    };
  }

  const dimension = adopterPetfinderEmbeddingManifest.dimension;
  const prototypeOffset = prototype.row * dimension;
  const ranked: Array<Omit<AdopterSearchResult, "rank">> = candidates.map((profile) => {
    const profileIndex = artifacts.profileRowByPetId.get(profile.petId);
    if (profileIndex === undefined) {
      throw new Error(`Profile ${profile.petId} has no embedding row`);
    }

    const embeddingOffset = profileIndex * dimension;
    let similarity = 0;
    for (let column = 0; column < dimension; column += 1) {
      similarity += (
        artifacts.petfinderEmbeddings[embeddingOffset + column]
        * artifacts.prototypes[prototypeOffset + column]
      );
    }

    return {
      petId: profile.petId,
      similarity,
      profileIndex,
      sourceEmbeddingIndex: profile.embeddingIndex,
    };
  });

  ranked.sort((left, right) => {
    const similarityOrder = right.similarity - left.similarity;
    if (similarityOrder !== 0) return similarityOrder;
    if (left.petId < right.petId) return -1;
    if (left.petId > right.petId) return 1;
    return 0;
  });

  const limit = normalizeLimit(options.limit, candidateCount);
  const results = ranked.slice(0, limit).map((result, index) => ({
    ...result,
    rank: index + 1,
  }));

  return {
    mode: "similarity",
    referenceType: "breed",
    prototypeLabel: state.prototypeLabel!,
    prototypeName: prototype.displayName,
    candidateCount,
    results,
  };
}

export function getAdopterSearchDiagnostics() {
  return {
    loaded: cachedArtifacts !== undefined,
    artifactLoadCount,
    petfinderFloatCount: cachedArtifacts?.petfinderEmbeddings.length ?? 0,
    prototypeFloatCount: cachedArtifacts?.prototypes.length ?? 0,
    binaryPayloadBytes: (
      adopterPetfinderEmbeddingManifest.byteLength
      + adopterTsinghuaPrototypeManifest.byteLength
    ),
  };
}

export function preloadAdopterSearchArtifacts() {
  loadSearchArtifacts();
  return getAdopterSearchDiagnostics();
}

function loadSearchArtifacts(): SearchArtifacts {
  if (cachedArtifacts) return cachedArtifacts;
  if (endianness() !== "LE") {
    throw new Error("Adoptante float32 artifacts require a little-endian runtime");
  }

  const petfinderEmbeddings = loadFloat32Matrix(
    adopterPetfinderEmbeddingManifest.file,
    adopterPetfinderEmbeddingManifest.rows,
    adopterPetfinderEmbeddingManifest.dimension,
    adopterPetfinderEmbeddingManifest.byteLength,
  );
  const prototypes = loadFloat32Matrix(
    adopterTsinghuaPrototypeManifest.file,
    adopterTsinghuaPrototypeManifest.rows,
    adopterTsinghuaPrototypeManifest.dimension,
    adopterTsinghuaPrototypeManifest.byteLength,
  );

  if (adopterProfiles.length !== adopterPetfinderEmbeddingManifest.rows) {
    throw new Error("Profile and PetFinder embedding row counts differ");
  }

  const profileRowByPetId = new Map(
    adopterProfiles.map((profile, row) => [profile.petId, row]),
  );
  if (profileRowByPetId.size !== adopterProfiles.length) {
    throw new Error("PetID values must be unique in the Adoptante profile artifact");
  }

  const prototypeByLabel = new Map(
    adopterTsinghuaPrototypeManifest.prototypes.map((prototype) => [
      prototype.label,
      { row: prototype.row, displayName: prototype.displayName },
    ]),
  );
  if (prototypeByLabel.size !== adopterTsinghuaPrototypeManifest.rows) {
    throw new Error("Prototype labels must be unique in the Tsinghua manifest");
  }

  cachedArtifacts = {
    petfinderEmbeddings,
    prototypes,
    profileRowByPetId,
    prototypeByLabel,
  };
  artifactLoadCount += 1;
  return cachedArtifacts;
}

function loadFloat32Matrix(
  filename: string,
  rows: number,
  dimension: number,
  expectedByteLength: number,
) {
  const bytes = readFileSync(path.join(SERVER_DATA_DIRECTORY, filename));
  const calculatedByteLength = rows * dimension * FLOAT32_BYTES;
  if (bytes.byteLength !== expectedByteLength || bytes.byteLength !== calculatedByteLength) {
    throw new Error(`Invalid byte length for ${filename}`);
  }

  if (bytes.byteOffset % FLOAT32_BYTES !== 0) {
    throw new Error(`Unaligned float32 data for ${filename}`);
  }
  return new Float32Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength / FLOAT32_BYTES,
  );
}

function normalizeLimit(limit: number | undefined, candidateCount: number) {
  if (limit === undefined) return candidateCount;
  if (!Number.isInteger(limit) || limit < 0) {
    throw new AdopterSearchValidationError("limit must be a non-negative integer");
  }
  return Math.min(limit, candidateCount);
}
