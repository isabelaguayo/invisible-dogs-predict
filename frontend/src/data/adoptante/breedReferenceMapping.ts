import { getVisualReferenceBreed, type VisualReferenceBreed } from "./catalogs.ts";

/**
 * Closed PetFinder → Tsinghua mapping for exact, unambiguous breed names.
 *
 * This table is intentionally explicit. It must not be extended with fuzzy
 * matching, textual normalization, visually similar breeds or row positions.
 * A missing key means that no automatic visual reference may be selected.
 */
export const EXACT_BREED_REFERENCE_LABELS = Object.freeze({
  Affenpinscher: 7,
  "Afghan Hound": 63,
  "American Staffordshire Terrier": 51,
  "Australian Shepherd": 101,
  "Australian Terrier": 9,
  Basenji: 100,
  Beagle: 111,
  "Bedlington Terrier": 45,
  "Border Collie": 108,
  "Border Terrier": 19,
  Boxer: 72,
  Chihuahua: 123,
  "Chinese Crested Dog": 91,
  "Cocker Spaniel": 112,
  Collie: 76,
  "French Bulldog": 1,
  "Golden Retriever": 125,
  "Great Dane": 20,
  "Irish Setter": 24,
  "Irish Terrier": 26,
  "Irish Wolfhound": 67,
  "Labrador Retriever": 121,
  "Miniature Pinscher": 126,
  "Norfolk Terrier": 16,
  "Old English Sheepdog": 106,
  Papillon: 129,
  Pomeranian: 4,
  Pug: 128,
  "Rhodesian Ridgeback": 80,
  Rottweiler: 69,
  "Saint Bernard": 43,
  Samoyed: 58,
  "Shih Tzu": 122,
  "Siberian Husky": 2,
  "Silky Terrier": 83,
  "Standard Poodle": 116,
  Weimaraner: 94,
  Whippet: 89,
} as const);

export const EXACT_BREED_REFERENCE_COUNT = Object.keys(
  EXACT_BREED_REFERENCE_LABELS,
).length;

export function getExactBreedVisualReference(
  petfinderBreed: string | undefined,
): VisualReferenceBreed | undefined {
  if (!petfinderBreed) return undefined;
  const label = (EXACT_BREED_REFERENCE_LABELS as Readonly<Record<string, number>>)[
    petfinderBreed
  ];
  if (label === undefined) return undefined;

  const reference = getVisualReferenceBreed(label);
  return reference?.displayName === petfinderBreed ? reference : undefined;
}
