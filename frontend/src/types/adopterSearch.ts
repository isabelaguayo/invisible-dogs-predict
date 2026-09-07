export const ADOPTER_SEARCH_CONTRACT_VERSION = 1 as const;
export const ADOPTER_RANKING_MODE = "similarity" as const;

export type AdopterAge = "Cachorro" | "Joven" | "Adulto" | "Senior";
export type AdopterSex = "Hembra" | "Macho";
export type AdopterSize = "Pequeño" | "Mediano" | "Grande" | "Extra grande";
export type AdopterCoat = "Corto" | "Medio" | "Largo";
export type AdopterHealth = "Saludable" | "Lesión leve" | "Lesión grave";
export type AdopterBinaryStatus = "Sí" | "No" | "No consta";
export type AdopterColor =
  | "Black"
  | "Brown"
  | "Cream"
  | "Golden"
  | "Gray"
  | "White"
  | "Yellow";
export type AdopterReferenceType = "breed" | "photo";
export type AdopterSearchMode = "characteristics" | "breed" | "photo";

/**
 * Canonical state for the Adoptante journey. An omitted filter means
 * “Indiferente”; that presentation value is never serialized in the URL.
 */
export type AdopterSearchState = {
  searchMode?: AdopterSearchMode;
  age?: AdopterAge;
  sex?: AdopterSex;
  size?: AdopterSize;
  coat?: AdopterCoat;
  health?: AdopterHealth;
  sterilized?: AdopterBinaryStatus;
  vaccinated?: AdopterBinaryStatus;
  dewormed?: AdopterBinaryStatus;
  breed?: string;
  color?: AdopterColor;
  referenceType?: AdopterReferenceType;
  prototypeLabel?: number;
  photoToken?: string;
};

export type AdopterFilterKey = Exclude<
  keyof AdopterSearchState,
  "searchMode" | "referenceType" | "prototypeLabel" | "photoToken"
>;

export type AdopterProfile = {
  petId: string;
  embeddingIndex: number;
  name: string;
  primaryImageFile: string;
  ageMonths: number;
  sex: AdopterSex;
  size: AdopterSize;
  coat: AdopterCoat;
  health: AdopterHealth;
  sterilized: AdopterBinaryStatus;
  vaccinated: AdopterBinaryStatus;
  dewormed: AdopterBinaryStatus;
  primaryBreed: string | null;
  secondaryBreed: string | null;
  colors: AdopterColor[];
  photoCount: number;
  videoCount: number;
  riskProbability: number;
  riskLevel: "Bajo" | "Medio" | "Alto";
  riskSource: string;
  completenessIndex: number;
  completenessLevel: "Baja" | "Media" | "Alta";
};

/**
 * Operational ranges for this MVP, not a universal veterinary
 * classification. Age=0 means undetermined and belongs to no category.
 */
export const ADOPTER_AGE_RANGES = {
  Cachorro: { minMonths: 1, maxMonths: 11 },
  Joven: { minMonths: 12, maxMonths: 35 },
  Adulto: { minMonths: 36, maxMonths: 95 },
  Senior: { minMonths: 96, maxMonths: null },
} as const satisfies Record<
  AdopterAge,
  { minMonths: number; maxMonths: number | null }
>;
