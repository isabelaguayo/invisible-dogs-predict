import photoCatalog from "../../data/adoptante/generated/adopterDemoPhotoCatalog.v1.json" with { type: "json" };
import type {
  AdopterColor,
  AdopterProfile,
  AdopterSearchState,
} from "../../types/adopterSearch.ts";
import type {
  AdopterBreedSearchResponse,
  AdopterCompatibleSearchResponse,
  AdopterDogResult,
  AdopterSearchResult,
} from "../../types/adopterResult.ts";
import { adopterProfiles } from "./artifacts.ts";
import { PROTECTORA_PETFINDER_PROFILES } from "../../data/protectoraPetfinderProfiles.ts";
import { presentPetfinderName } from "../presentation/petfinderName.ts";
import { getAdditionalPetfinderPhoto } from "../tfm/results.ts";

const COLOR_LABELS = {
  Black: "Negro",
  Brown: "Marrón",
  Cream: "Crema",
  Golden: "Dorado",
  Gray: "Gris",
  White: "Blanco",
  Yellow: "Amarillo",
} as const;

const BREED_PRESENTATION_LABELS: Readonly<Record<string, string>> = {
  "Mixed Breed": "Mestizo",
};

export const DEFAULT_ADOPTER_PHOTO_OBJECT_POSITION = "50% 50%";

export const ADOPTER_PHOTO_OBJECT_POSITION_OVERRIDES: Readonly<Record<string, string>> = {
  e0667be3b: "50% 35%",
  "1712ba40e": "50% 25%",
  "56b0b72b1": "50% 25%",
  "43b277272": "50% 25%",
  "36ab1bdc9": "50% 25%",
  "41e4cc1de": "50% 25%",
  "5d792dd24": "50% 30%",
  "060d1de98": "50% 35%",
  "0636650db": "50% 30%",
  "064217ca4": "50% 25%",
  "08f40f232": "50% 40%",
};

const PREFERENCE_LABELS: ReadonlyArray<{
  key: keyof AdopterSearchState;
  label: string;
}> = [
  { key: "age", label: "Edad" },
  { key: "sex", label: "Sexo" },
  { key: "size", label: "Tamaño" },
  { key: "coat", label: "Pelo" },
  { key: "health", label: "Salud" },
  { key: "sterilized", label: "Esterilización" },
  { key: "vaccinated", label: "Vacunación" },
  { key: "dewormed", label: "Desparasitación" },
  { key: "breed", label: "Raza PetFinder" },
  { key: "color", label: "Color" },
];

const photoByPetId = new Map(
  photoCatalog.photos.map((photo) => [photo.petId, photo.file]),
);
const protectoraPhotoByPetId = new Map(
  PROTECTORA_PETFINDER_PROFILES.map((profile) => [profile.id, profile.imagePath]),
);

export type AdopterPreferenceSummaryItem = {
  label: string;
  value: string;
};

export function createAdopterDogResults(
  response: AdopterBreedSearchResponse,
): AdopterDogResult[] {
  return createAdopterDogResultsFromRanked(response.results);
}

/**
 * Shared by any ranked-similarity source (Tsinghua breed search, photo
 * search): looks up each ranked result's permanent profile and attaches its
 * similarity/rank as current-search state, without caring how the ranking
 * was produced.
 */
export function createAdopterDogResultsFromRanked(
  results: readonly AdopterSearchResult[],
): AdopterDogResult[] {
  return results.map((result) => {
    const profile = adopterProfiles[result.profileIndex];
    if (!profile || profile.petId !== result.petId) {
      throw new Error(`Result/profile mismatch for ${result.petId}`);
    }
    return createAdopterDogResult(profile, result.similarity, result.rank);
  });
}

export function createCompatibleAdopterDogResults(
  response: AdopterCompatibleSearchResponse,
): AdopterDogResult[] {
  return response.profiles.map((profile) => createAdopterDogResult(profile));
}

export function createAdopterPreferenceSummary(
  state: AdopterSearchState,
): AdopterPreferenceSummaryItem[] {
  return PREFERENCE_LABELS.flatMap(({ key, label }) => {
    const value = state[key];
    if (value === undefined || typeof value === "number") return [];
    return [{
      label,
      value: key === "color" ? COLOR_LABELS[value as AdopterColor] : value,
    }];
  });
}

export { presentPetfinderName };

export function createAdopterDogResult(
  profile: AdopterProfile,
  similarity?: number,
  rank?: number,
): AdopterDogResult {
  const hasVisualSimilarity = similarity !== undefined && rank !== undefined;
  const controlledPhoto = photoByPetId.get(profile.petId);
  const displayName = presentPetfinderName(profile.name, profile.petId);
  if (controlledPhoto && controlledPhoto !== profile.primaryImageFile) {
    throw new Error(`Photo catalog/profile mismatch for ${profile.petId}`);
  }

  return {
    profile: {
      petId: profile.petId,
      sourceName: profile.name,
      displayName,
      primaryImageFile: profile.primaryImageFile,
      photoUrl: controlledPhoto
        ? `/images/petfinder/adoptante/${controlledPhoto}`
        : protectoraPhotoByPetId.get(profile.petId) ?? getAdditionalPetfinderPhoto(profile.petId),
      objectPosition: ADOPTER_PHOTO_OBJECT_POSITION_OVERRIDES[profile.petId]
        ?? DEFAULT_ADOPTER_PHOTO_OBJECT_POSITION,
      ageMonths: profile.ageMonths,
      ageLabel: formatAge(profile.ageMonths),
      sex: profile.sex,
      size: profile.size,
      coat: profile.coat,
      primaryBreed: profile.primaryBreed,
      secondaryBreed: profile.secondaryBreed,
      breedLabel: formatBreed(profile),
      colors: profile.colors,
      colorLabel: profile.colors.length
        ? profile.colors.map((color) => COLOR_LABELS[color]).join(", ")
        : "No consta",
      health: profile.health,
      sterilized: profile.sterilized,
      vaccinated: profile.vaccinated,
      dewormed: profile.dewormed,
      riskLevel: profile.riskLevel,
      riskProbability: profile.riskProbability,
      completenessIndex: profile.completenessIndex,
      completenessPercent: Math.round(profile.completenessIndex * 100),
      completenessLevel: profile.completenessLevel,
    },
    search: !hasVisualSimilarity
      ? {}
      : {
          similarity,
          similarityPercent: Math.round(similarity * 100),
          rank,
        },
  };
}

function formatAge(months: number) {
  if (months === 0) return "Edad no determinada";
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const yearsLabel = `${years} ${years === 1 ? "año" : "años"}`;
  if (remainingMonths === 0) return yearsLabel;
  return `${yearsLabel} y ${remainingMonths} ${remainingMonths === 1 ? "mes" : "meses"}`;
}

/**
 * Deterministic Spanish summary built only from structured fields. Never
 * reads the historical `Description` text (not present in this artifact),
 * never invents personality or behavior, and is always labeled as a summary
 * rather than presented as the original PetFinder text.
 */
export function buildAdopterProfileSummary(
  profile: AdopterDogResult["profile"],
): string {
  const subject = profile.sex === "Macho" ? "un macho" : "una hembra";
  const ageClause = profile.ageMonths === 0
    ? "de edad no determinada"
    : `de ${profile.ageLabel}`;
  const breedClause = profile.breedLabel === "Raza no indicada"
    ? "no registra una raza específica"
    : `registra la raza ${profile.breedLabel}`;

  return `${profile.displayName} es ${subject}, ${ageClause}, tamaño ${profile.size.toLocaleLowerCase()} `
    + `y pelo ${profile.coat.toLocaleLowerCase()}. Su ficha ${breedClause} y consta como `
    + `${profile.health.toLocaleLowerCase()}.`;
}

function formatBreed(profile: AdopterProfile) {
  const breeds = [profile.primaryBreed, profile.secondaryBreed].filter(
    (breed): breed is string => Boolean(breed),
  );
  const presentedBreeds = breeds
    .map((breed) => BREED_PRESENTATION_LABELS[breed] ?? breed)
    .filter((breed, index, values) => values.indexOf(breed) === index);
  return presentedBreeds.length ? presentedBreeds.join(" / ") : "Raza no indicada";
}
