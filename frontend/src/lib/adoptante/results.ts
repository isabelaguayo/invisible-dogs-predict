import type { AdopterSearchState } from "../../types/adopterSearch.ts";
import type { AdopterDogResult } from "../../types/adopterResult.ts";
import {
  AdopterSearchValidationError,
  searchAdopterByBreed,
} from "./search.ts";
import { getFilteredAdopterResults } from "./compatibleResults.ts";
import { adopterCharacteristicsOnly } from "./query.ts";
import {
  createAdopterDogResults,
  createCompatibleAdopterDogResults,
} from "./presentation.ts";

const PHASE_C_RESULT_LIMIT = 12;

/** The neutral/compatible-mode candidate set: breed is dropped only under the explicit "characteristics" mode. */
export function resolveAdopterNeutralState(state: AdopterSearchState): AdopterSearchState {
  return state.searchMode === "characteristics" ? adopterCharacteristicsOnly(state) : state;
}

/** The breed-search candidate set: an explicit "breed" mode always searches the full catalog, ignoring other filters. */
export function resolveAdopterVisualState(state: AdopterSearchState): AdopterSearchState {
  return state.searchMode === "breed"
    ? {
        searchMode: state.searchMode,
        referenceType: state.referenceType,
        prototypeLabel: state.prototypeLabel,
      }
    : state;
}

export type AdopterResultsView =
  | { status: "invalid-reference" }
  | { status: "photo-pending" }
  | { status: "error" }
  | {
      status: "empty" | "results";
      mode: "similarity" | "compatible";
      referenceName?: string;
      candidateCount: number;
      dogs: AdopterDogResult[];
    };

type ResolveAdopterResultsOptions = {
  invalidReferenceQuery?: boolean;
};

/** Resolve either visual ranking or neutral compatible results server-side. */
export function resolveAdopterResults(
  state: AdopterSearchState,
  options: ResolveAdopterResultsOptions = {},
): AdopterResultsView {
  if (options.invalidReferenceQuery) return { status: "invalid-reference" };
  if (state.searchMode === "photo" || state.referenceType === "photo") {
    return { status: "photo-pending" };
  }
  if (state.searchMode === "characteristics" && state.referenceType !== undefined) {
    return { status: "invalid-reference" };
  }
  if (
    state.searchMode === "breed"
    && (state.referenceType !== "breed" || state.prototypeLabel === undefined)
  ) {
    return { status: "invalid-reference" };
  }
  if (
    (state.referenceType === "breed" && state.prototypeLabel === undefined)
    || (state.referenceType !== "breed" && state.prototypeLabel !== undefined)
  ) {
    return { status: "invalid-reference" };
  }

  try {
    if (state.referenceType === undefined) {
      const neutralState = resolveAdopterNeutralState(state);
      const response = getFilteredAdopterResults(neutralState, { limit: PHASE_C_RESULT_LIMIT });
      const dogs = createCompatibleAdopterDogResults(response);
      return {
        status: dogs.length ? "results" : "empty",
        mode: "compatible",
        candidateCount: response.candidateCount,
        dogs,
      };
    }

    const visualState = resolveAdopterVisualState(state);
    const response = searchAdopterByBreed(visualState, { limit: PHASE_C_RESULT_LIMIT });
    const dogs = createAdopterDogResults(response);
    return {
      status: dogs.length ? "results" : "empty",
      mode: "similarity",
      referenceName: response.prototypeName,
      candidateCount: response.candidateCount,
      dogs,
    };
  } catch (error) {
    if (error instanceof AdopterSearchValidationError) {
      return { status: "invalid-reference" };
    }
    return { status: "error" };
  }
}
