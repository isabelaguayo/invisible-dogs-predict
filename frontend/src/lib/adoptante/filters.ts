import { ADOPTER_AGE_RANGES } from "../../types/adopterSearch.ts";
import type { AdopterProfile, AdopterSearchState } from "../../types/adopterSearch.ts";

/**
 * Applies PetFinder preferences before any future visual-similarity step.
 * This is the web equivalent of aplicar_filtros_adoptante() in Notebook 08.
 */
export function filterAdopterProfiles(
  profiles: readonly AdopterProfile[],
  preferences: AdopterSearchState,
) {
  return profiles.filter((profile) => matchesAdopterPreferences(profile, preferences));
}

export function getCompatibleEmbeddingIndices(
  profiles: readonly AdopterProfile[],
  preferences: AdopterSearchState,
) {
  return filterAdopterProfiles(profiles, preferences).map(
    (profile) => profile.embeddingIndex,
  );
}

export function matchesAdopterPreferences(
  profile: AdopterProfile,
  preferences: AdopterSearchState,
) {
  if (preferences.age && !matchesAge(profile.ageMonths, preferences.age)) return false;
  if (preferences.sex && profile.sex !== preferences.sex) return false;
  if (preferences.size && profile.size !== preferences.size) return false;
  if (preferences.coat && profile.coat !== preferences.coat) return false;
  if (preferences.health && profile.health !== preferences.health) return false;
  if (preferences.sterilized && profile.sterilized !== preferences.sterilized) return false;
  if (preferences.vaccinated && profile.vaccinated !== preferences.vaccinated) return false;
  if (preferences.dewormed && profile.dewormed !== preferences.dewormed) return false;
  if (
    preferences.breed &&
    profile.primaryBreed !== preferences.breed &&
    profile.secondaryBreed !== preferences.breed
  ) return false;
  if (preferences.color && !profile.colors.includes(preferences.color)) return false;
  return true;
}

function matchesAge(ageMonths: number, age: NonNullable<AdopterSearchState["age"]>) {
  if (ageMonths === 0) return false;
  const range = ADOPTER_AGE_RANGES[age];
  return ageMonths >= range.minMonths && (
    range.maxMonths === null || ageMonths <= range.maxMonths
  );
}
