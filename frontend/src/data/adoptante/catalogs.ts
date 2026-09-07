import petfinderBreedCatalog from "./generated/petfinderBreedCatalog.v1.json" with { type: "json" };
import tsinghuaBreedCatalog from "./generated/tsinghuaBreedCatalog.v1.json" with { type: "json" };

export type VisualReferenceBreed = {
  id: string;
  label: number;
  technicalName: string;
  displayName: string;
};

export const petfinderBreedOptions = Object.freeze(
  petfinderBreedCatalog.map((breed) => String(breed)),
);

export const visualReferenceBreeds: readonly VisualReferenceBreed[] = Object.freeze(
  tsinghuaBreedCatalog.map((breed) => ({
    id: String(breed.label),
    label: breed.label,
    technicalName: breed.technicalName,
    displayName: breed.displayName,
  })),
);

export const alphabeticalVisualReferenceBreeds: readonly VisualReferenceBreed[] = Object.freeze(
  [...visualReferenceBreeds].sort((left, right) => (
    left.displayName.localeCompare(right.displayName, "en", { sensitivity: "base" })
  )),
);

function normalizeVisualReferenceQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase();
}

export function filterVisualReferenceBreeds(query: string) {
  const normalizedQuery = normalizeVisualReferenceQuery(query);
  if (!normalizedQuery) return alphabeticalVisualReferenceBreeds;

  return alphabeticalVisualReferenceBreeds.filter((breed) => (
    normalizeVisualReferenceQuery(breed.displayName).includes(normalizedQuery)
  ));
}

const visualBreedByLabel = new Map(
  visualReferenceBreeds.map((breed) => [breed.label, breed]),
);

export function getVisualReferenceBreed(label: number) {
  return visualBreedByLabel.get(label);
}
