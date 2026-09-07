// This module is server-only: it reads the prepared PetFinder profile artifact
// but deliberately never imports or loads the DINOv2 float32 matrices.
import "node:fs";

import profiles from "../../../server-data/adoptante/petfinderProfiles.v1.json" with { type: "json" };
import type { AdopterCompatibleSearchResponse, AdopterSearchOptions } from "../../types/adopterResult.ts";
import type { AdopterProfile, AdopterSearchState } from "../../types/adopterSearch.ts";
import { filterAdopterProfiles } from "./filters.ts";

const adopterProfiles = profiles as AdopterProfile[];

/**
 * Returns structurally compatible PetFinder profiles without visual scoring.
 * PetID ascending is a neutral, deterministic presentation order; it is not a
 * predictive ranking and risk/completeness never participate in it.
 */
export function getFilteredAdopterResults(
  state: AdopterSearchState,
  options: AdopterSearchOptions = {},
): AdopterCompatibleSearchResponse {
  const candidates = filterAdopterProfiles(adopterProfiles, state)
    .slice()
    .sort((left, right) => {
      if (left.petId < right.petId) return -1;
      if (left.petId > right.petId) return 1;
      return 0;
    });
  const limit = normalizeLimit(options.limit, candidates.length);

  return {
    mode: "compatible",
    candidateCount: candidates.length,
    profiles: candidates.slice(0, limit),
  };
}

function normalizeLimit(limit: number | undefined, candidateCount: number) {
  if (limit === undefined) return candidateCount;
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error("limit must be a non-negative integer");
  }
  return Math.min(limit, candidateCount);
}
