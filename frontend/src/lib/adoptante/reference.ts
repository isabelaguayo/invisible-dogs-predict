import { getExactBreedVisualReference } from "../../data/adoptante/breedReferenceMapping.ts";
import { getVisualReferenceBreed, type VisualReferenceBreed } from "../../data/adoptante/catalogs.ts";
import type { AdopterSearchState } from "../../types/adopterSearch.ts";
import { adopterPreferencesOnly } from "./query.ts";

export type InitialBreedReference =
  | {
      status: "selected";
      source: "explicit" | "suggested";
      reference: VisualReferenceBreed;
    }
  | {
      status: "unavailable";
      petfinderBreed: string;
    }
  | { status: "none" };

/** URL reference wins; the exact mapping is consulted only when it is absent. */
export function resolveInitialBreedReference(
  state: AdopterSearchState,
): InitialBreedReference {
  if (state.referenceType === "breed" && state.prototypeLabel !== undefined) {
    const explicitReference = getVisualReferenceBreed(state.prototypeLabel);
    if (explicitReference) {
      return {
        status: "selected",
        source: "explicit",
        reference: explicitReference,
      };
    }
  }

  if (!state.breed) return { status: "none" };
  const suggestedReference = getExactBreedVisualReference(state.breed);
  if (!suggestedReference) {
    return { status: "unavailable", petfinderBreed: state.breed };
  }
  return {
    status: "selected",
    source: "suggested",
    reference: suggestedReference,
  };
}

export function createBreedReferenceSearchState(
  state: AdopterSearchState,
  prototypeLabel: number,
): AdopterSearchState {
  if (!getVisualReferenceBreed(prototypeLabel)) {
    throw new Error(`Unknown Tsinghua prototype label: ${prototypeLabel}`);
  }
  return {
    ...adopterPreferencesOnly(state),
    referenceType: "breed",
    prototypeLabel,
  };
}

/** Preserve only a valid explicit breed reference while preferences change. */
export function withExplicitBreedReference(
  initialState: AdopterSearchState,
  preferences: AdopterSearchState,
): AdopterSearchState {
  if (
    initialState.referenceType === "breed"
    && initialState.prototypeLabel !== undefined
    && getVisualReferenceBreed(initialState.prototypeLabel)
  ) {
    return createBreedReferenceSearchState(
      preferences,
      initialState.prototypeLabel,
    );
  }
  return adopterPreferencesOnly(preferences);
}
