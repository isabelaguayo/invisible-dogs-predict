// Method C (search by photograph): compares a runtime DINOv2 query embedding
// (from an uploaded photo, via the local Python inference service) against
// the 6,474 prepared PetFinder embeddings. This module is deliberately
// separate from search.ts (Tsinghua breed-reference search, Method B,
// validated and frozen) so Method C can never regress Method B by sharing
// mutable module state or being edited in the same file. The float32-loading
// helper below is intentionally a small, independent duplicate of the one in
// search.ts rather than an export extracted from it, to avoid refactoring
// that already-validated file.
import { readFileSync } from "node:fs";
import { endianness } from "node:os";
import path from "node:path";

import { adopterPetfinderEmbeddingManifest, adopterProfiles } from "./artifacts.ts";
import type { AdopterSearchResult } from "../../types/adopterResult.ts";

const FLOAT32_BYTES = 4;
const SERVER_DATA_DIRECTORY = path.join(process.cwd(), "server-data", "adoptante");
const EMBEDDING_DIMENSION = 384;
const TOP_RESULTS = 12;
const NORM_TOLERANCE = 0.01;

export class PhotoSearchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoSearchValidationError";
  }
}

export type PhotoSearchResponse = {
  mode: "similarity";
  referenceType: "photo";
  candidateCount: number;
  results: AdopterSearchResult[];
};

let cachedPetfinderEmbeddings: Float32Array | undefined;

/**
 * Ranks the 6,474 PetFinder profiles against a query embedding produced at
 * runtime from a user photo. Structured filters, risk, completeness, and the
 * Tsinghua catalog never take part here — only the 384-dim dot product.
 */
export function searchAdopterByPhotoEmbedding(embedding: ArrayLike<number>): PhotoSearchResponse {
  validateQueryEmbedding(embedding);
  const petfinderEmbeddings = loadPetfinderEmbeddings();
  const dimension = adopterPetfinderEmbeddingManifest.dimension;
  const candidateCount = adopterProfiles.length;

  const ranked: Array<Omit<AdopterSearchResult, "rank">> = adopterProfiles.map((profile, profileIndex) => {
    const offset = profileIndex * dimension;
    let similarity = 0;
    for (let column = 0; column < dimension; column += 1) {
      similarity += petfinderEmbeddings[offset + column] * embedding[column];
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

  const results = ranked.slice(0, Math.min(TOP_RESULTS, candidateCount)).map((result, index) => ({
    ...result,
    rank: index + 1,
  }));

  return {
    mode: "similarity",
    referenceType: "photo",
    candidateCount,
    results,
  };
}

function validateQueryEmbedding(embedding: ArrayLike<number>): void {
  if (!embedding || typeof embedding.length !== "number") {
    throw new PhotoSearchValidationError("embedding must be an array-like of numbers");
  }
  if (embedding.length !== EMBEDDING_DIMENSION) {
    throw new PhotoSearchValidationError(
      `embedding must have dimension ${EMBEDDING_DIMENSION}, received ${embedding.length}`,
    );
  }

  let sumOfSquares = 0;
  for (let index = 0; index < embedding.length; index += 1) {
    const value = embedding[index];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new PhotoSearchValidationError("embedding must contain only finite numbers");
    }
    sumOfSquares += value * value;
  }

  const norm = Math.sqrt(sumOfSquares);
  if (Math.abs(norm - 1) > NORM_TOLERANCE) {
    throw new PhotoSearchValidationError(
      `embedding must be L2-normalized (norm ~1), received norm ${norm}`,
    );
  }
}

function loadPetfinderEmbeddings(): Float32Array {
  if (cachedPetfinderEmbeddings) return cachedPetfinderEmbeddings;
  if (endianness() !== "LE") {
    throw new Error("Adoptante float32 artifacts require a little-endian runtime");
  }

  const bytes = readFileSync(
    path.join(SERVER_DATA_DIRECTORY, adopterPetfinderEmbeddingManifest.file),
  );
  const expectedByteLength = adopterPetfinderEmbeddingManifest.byteLength;
  const calculatedByteLength = (
    adopterPetfinderEmbeddingManifest.rows
    * adopterPetfinderEmbeddingManifest.dimension
    * FLOAT32_BYTES
  );
  if (bytes.byteLength !== expectedByteLength || bytes.byteLength !== calculatedByteLength) {
    throw new Error(`Invalid byte length for ${adopterPetfinderEmbeddingManifest.file}`);
  }
  if (bytes.byteOffset % FLOAT32_BYTES !== 0) {
    throw new Error(`Unaligned float32 data for ${adopterPetfinderEmbeddingManifest.file}`);
  }

  cachedPetfinderEmbeddings = new Float32Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength / FLOAT32_BYTES,
  );
  return cachedPetfinderEmbeddings;
}
