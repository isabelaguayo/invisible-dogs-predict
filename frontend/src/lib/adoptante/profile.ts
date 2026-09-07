// This module is server-only: it reads the prepared PetFinder profile artifact
// directly and only reaches into search.ts (and its DINOv2 float32 matrices)
// when a breed-reference context actually needs a similarity value.
import "node:fs";

import profiles from "../../../server-data/adoptante/petfinderProfiles.v1.json" with { type: "json" };
import type { AdopterProfile, AdopterSearchState } from "../../types/adopterSearch.ts";
import type { AdopterDogResult } from "../../types/adopterResult.ts";
import { matchesAdopterPreferences } from "./filters.ts";
import {
  type AdopterPreferenceSummaryItem,
  createAdopterDogResult,
  createAdopterPreferenceSummary,
} from "./presentation.ts";
import { resolveAdopterNeutralState, resolveAdopterVisualState } from "./results.ts";
import { AdopterSearchValidationError, searchAdopterByBreed } from "./search.ts";

const adopterProfiles = profiles as AdopterProfile[];
const profileByPetId = new Map(adopterProfiles.map((profile) => [profile.petId, profile]));

/**
 * Search context for the profile the user actually opened. "characteristics"
 * and "breed" only appear when the profile genuinely belongs to that search;
 * a valid-looking query that the profile does not satisfy becomes
 * "inconsistent" instead of a fabricated match.
 */
export type AdopterProfileContext =
  | { kind: "none" }
  | { kind: "inconsistent" }
  | { kind: "characteristics"; preferences: AdopterPreferenceSummaryItem[] }
  | {
      kind: "breed";
      referenceName: string;
      similarity: number;
      similarityPercent: number;
      rank: number;
      candidateCount: number;
    };

export type AdopterProfileView =
  | { status: "not-found" }
  | { status: "found"; dog: AdopterDogResult; context: AdopterProfileContext };

type ResolveAdopterProfileOptions = {
  invalidReferenceQuery?: boolean;
};

/**
 * Resolves a single historical PetFinder profile plus, when the incoming
 * query legitimately identifies one, the search context it was opened from.
 * Similarity is always recomputed here via search.ts rather than trusted
 * from the caller, so it can never drift from what resultados showed.
 */
export function resolveAdopterProfileView(
  petId: string,
  state: AdopterSearchState,
  options: ResolveAdopterProfileOptions = {},
): AdopterProfileView {
  const rawProfile = profileByPetId.get(petId);
  if (!rawProfile) return { status: "not-found" };

  const context = resolveProfileContext(rawProfile, state, options.invalidReferenceQuery ?? false);
  const similarity = context.kind === "breed" ? context.similarity : undefined;
  const rank = context.kind === "breed" ? context.rank : undefined;

  return {
    status: "found",
    dog: createAdopterDogResult(rawProfile, similarity, rank),
    context,
  };
}

function resolveProfileContext(
  profile: AdopterProfile,
  state: AdopterSearchState,
  invalidReferenceQuery: boolean,
): AdopterProfileContext {
  if (invalidReferenceQuery) return { kind: "none" };
  if (state.searchMode === "photo" || state.referenceType === "photo") return { kind: "none" };
  if (state.searchMode === "characteristics" && state.referenceType !== undefined) {
    return { kind: "none" };
  }
  if (
    state.searchMode === "breed"
    && (state.referenceType !== "breed" || state.prototypeLabel === undefined)
  ) {
    return { kind: "none" };
  }
  if (
    (state.referenceType === "breed" && state.prototypeLabel === undefined)
    || (state.referenceType !== "breed" && state.prototypeLabel !== undefined)
  ) {
    return { kind: "none" };
  }

  if (state.referenceType === undefined) {
    const neutralState = resolveAdopterNeutralState(state);
    const hasSearchSignal = state.searchMode === "characteristics"
      || Object.keys(neutralState).length > 0;
    if (!hasSearchSignal) return { kind: "none" };
    if (!matchesAdopterPreferences(profile, neutralState)) return { kind: "inconsistent" };
    return { kind: "characteristics", preferences: createAdopterPreferenceSummary(neutralState) };
  }

  const visualState = resolveAdopterVisualState(state);
  let response;
  try {
    response = searchAdopterByBreed(visualState);
  } catch (error) {
    if (error instanceof AdopterSearchValidationError) return { kind: "none" };
    throw error;
  }

  const match = response.results.find((result) => result.petId === profile.petId);
  if (!match) return { kind: "inconsistent" };

  return {
    kind: "breed",
    referenceName: response.prototypeName,
    similarity: match.similarity,
    similarityPercent: Math.round(match.similarity * 100),
    rank: match.rank,
    candidateCount: response.candidateCount,
  };
}
