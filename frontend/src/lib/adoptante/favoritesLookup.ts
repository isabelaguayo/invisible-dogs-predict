// Server-only. Resolves a list of PetIDs to their permanent profile data for
// the /adoptante/favoritos page. Reuses the same prepared PetFinder artifact
// and presentation layer as every other Adoptante view — no embeddings, no
// Tsinghua prototypes, no DINOv2, no ranking. A favorite is never re-scored;
// it is just a direct profile lookup, exactly like opening a ficha by PetID.
import profiles from "../../../server-data/adoptante/petfinderProfiles.v1.json" with { type: "json" };
import type { AdopterProfile } from "../../types/adopterSearch.ts";
import type { AdopterDogResult } from "../../types/adopterResult.ts";
import { createAdopterDogResult } from "./presentation.ts";

const adopterProfiles = profiles as AdopterProfile[];
const profileByPetId = new Map(adopterProfiles.map((profile) => [profile.petId, profile]));

export const ADOPTER_PET_ID_PATTERN = /^[0-9a-f]{9}$/;
export const ADOPTER_FAVORITES_MAX_PET_IDS = 200;

/**
 * Validates, normalizes, and deduplicates a raw PetID list from the client —
 * never trusts localStorage content as-is. Non-string, malformed, or
 * duplicate entries are silently dropped rather than rejecting the whole
 * request; the count is capped so a corrupted/huge payload can't be used to
 * force an expensive lookup.
 */
export function sanitizeAdopterFavoritePetIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const petId = raw.trim().toLowerCase();
    if (!ADOPTER_PET_ID_PATTERN.test(petId)) continue;
    if (seen.has(petId)) continue;
    seen.add(petId);
    out.push(petId);
    if (out.length >= ADOPTER_FAVORITES_MAX_PET_IDS) break;
  }
  return out;
}

/** Looks up each sanitized PetID; unknown IDs are dropped, never fabricated. Order of the input is preserved. */
export function resolveAdopterFavoriteProfiles(petIds: readonly string[]): AdopterDogResult[] {
  const out: AdopterDogResult[] = [];
  for (const petId of petIds) {
    const profile = profileByPetId.get(petId);
    if (!profile) continue;
    out.push(createAdopterDogResult(profile));
  }
  return out;
}
