import type {
  AdopterBinaryStatus,
  AdopterCoat,
  AdopterColor,
  AdopterHealth,
  AdopterProfile,
  AdopterSex,
  AdopterSize,
} from "./adopterSearch.ts";

export type AdopterSearchResult = {
  petId: string;
  similarity: number;
  rank: number;
  profileIndex: number;
  sourceEmbeddingIndex: number;
};

export type AdopterBreedSearchResponse = {
  mode: "similarity";
  referenceType: "breed";
  prototypeLabel: number;
  prototypeName: string;
  candidateCount: number;
  results: AdopterSearchResult[];
};

export type AdopterCompatibleSearchResponse = {
  mode: "compatible";
  candidateCount: number;
  profiles: AdopterProfile[];
};

export type AdopterSearchOptions = {
  limit?: number;
};

/**
 * Serializable UI projection for a result card. Permanent profile data and
 * fields belonging to the current search are deliberately grouped separately
 * so similarity can never become profile state. They only exist when a visual
 * reference has actually been used.
 */
export type AdopterDogResult = {
  profile: {
    petId: string;
    sourceName: string;
    displayName: string;
    primaryImageFile: string;
    photoUrl?: string;
    objectPosition: string;
    ageMonths: number;
    ageLabel: string;
    sex: AdopterSex;
    size: AdopterSize;
    coat: AdopterCoat;
    primaryBreed: string | null;
    secondaryBreed: string | null;
    breedLabel: string;
    colors: AdopterColor[];
    colorLabel: string;
    health: AdopterHealth;
    sterilized: AdopterBinaryStatus;
    vaccinated: AdopterBinaryStatus;
    dewormed: AdopterBinaryStatus;
    riskLevel: "Bajo" | "Medio" | "Alto";
    riskProbability: number;
    completenessIndex: number;
    completenessPercent: number;
    completenessLevel: "Baja" | "Media" | "Alta";
  };
  search: {
    similarity?: number;
    similarityPercent?: number;
    rank?: number;
  };
};
