import { getVisualReferenceBreed, petfinderBreedOptions } from "../../data/adoptante/catalogs.ts";
import {
  ADOPTER_SEARCH_CONTRACT_VERSION,
  type AdopterAge,
  type AdopterBinaryStatus,
  type AdopterCoat,
  type AdopterColor,
  type AdopterHealth,
  type AdopterSearchMode,
  type AdopterSearchState,
  type AdopterSex,
  type AdopterSize,
} from "../../types/adopterSearch.ts";

type SearchParamsReader = Pick<URLSearchParams, "get">;
export type SearchParamsRecord = Record<string, string | string[] | undefined>;
export type AdopterReferenceQueryStatus = "none" | "breed" | "photo" | "invalid";

const AGE_FROM_QUERY: Record<string, AdopterAge> = {
  cachorro: "Cachorro",
  joven: "Joven",
  adulto: "Adulto",
  senior: "Senior",
};
const SEX_FROM_QUERY: Record<string, AdopterSex> = {
  hembra: "Hembra",
  macho: "Macho",
};
const SIZE_FROM_QUERY: Record<string, AdopterSize> = {
  pequeno: "Pequeño",
  mediano: "Mediano",
  grande: "Grande",
  "extra-grande": "Extra grande",
};
const COAT_FROM_QUERY: Record<string, AdopterCoat> = {
  corto: "Corto",
  medio: "Medio",
  largo: "Largo",
};
const HEALTH_FROM_QUERY: Record<string, AdopterHealth> = {
  saludable: "Saludable",
  "lesion-leve": "Lesión leve",
  "lesion-grave": "Lesión grave",
};
const STATUS_FROM_QUERY: Record<string, AdopterBinaryStatus> = {
  si: "Sí",
  no: "No",
  "no-consta": "No consta",
};
const COLOR_FROM_QUERY: Record<string, AdopterColor> = {
  black: "Black",
  brown: "Brown",
  cream: "Cream",
  golden: "Golden",
  gray: "Gray",
  white: "White",
  yellow: "Yellow",
};
const MODE_FROM_QUERY: Record<string, AdopterSearchMode> = {
  characteristics: "characteristics",
  breed: "breed",
  photo: "photo",
};

const AGE_TO_QUERY = reverse(AGE_FROM_QUERY);
const SEX_TO_QUERY = reverse(SEX_FROM_QUERY);
const SIZE_TO_QUERY = reverse(SIZE_FROM_QUERY);
const COAT_TO_QUERY = reverse(COAT_FROM_QUERY);
const HEALTH_TO_QUERY = reverse(HEALTH_FROM_QUERY);
const STATUS_TO_QUERY = reverse(STATUS_FROM_QUERY);
const COLOR_TO_QUERY = reverse(COLOR_FROM_QUERY);
const PETFINDER_BREEDS = new Set(petfinderBreedOptions);
const PETFINDER_BREED_ALIASES = new Map([
  ["German Shepherd", "German Shepherd Dog"],
]);
const PHOTO_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

function reverse<T extends string>(values: Record<string, T>): Record<T, string> {
  return Object.fromEntries(
    Object.entries(values).map(([queryValue, domainValue]) => [domainValue, queryValue]),
  ) as Record<T, string>;
}

function allowed<T>(value: string | null, values: Record<string, T>) {
  return value ? values[value] : undefined;
}

function validatedBreed(value: string | null) {
  if (!value) return undefined;
  const canonical = PETFINDER_BREED_ALIASES.get(value) ?? value;
  return PETFINDER_BREEDS.has(canonical) ? canonical : undefined;
}

export function parseAdopterSearchState(params: SearchParamsReader): AdopterSearchState {
  const version = params.get("v");
  if (version && version !== String(ADOPTER_SEARCH_CONTRACT_VERSION)) return {};

  const state: AdopterSearchState = {
    searchMode: allowed(params.get("mode"), MODE_FROM_QUERY),
    age: allowed(params.get("age"), AGE_FROM_QUERY),
    sex: allowed(params.get("sex"), SEX_FROM_QUERY),
    size: allowed(params.get("size"), SIZE_FROM_QUERY),
    coat: allowed(params.get("coat"), COAT_FROM_QUERY),
    health: allowed(params.get("health"), HEALTH_FROM_QUERY),
    sterilized: allowed(params.get("sterilized"), STATUS_FROM_QUERY),
    vaccinated: allowed(params.get("vaccinated"), STATUS_FROM_QUERY),
    dewormed: allowed(params.get("dewormed"), STATUS_FROM_QUERY),
    breed: validatedBreed(params.get("breed")),
    color: allowed(params.get("color"), COLOR_FROM_QUERY),
  };

  const reference = params.get("reference");
  if (reference === "breed") {
    const rawLabel = params.get("prototype");
    const label = rawLabel !== null && /^\d+$/.test(rawLabel) ? Number(rawLabel) : NaN;
    if (Number.isInteger(label) && getVisualReferenceBreed(label)) {
      state.referenceType = "breed";
      state.prototypeLabel = label;
    }
  } else if (reference === "photo") {
    state.referenceType = "photo";
    const photoToken = params.get("photoToken");
    if (photoToken && PHOTO_TOKEN_PATTERN.test(photoToken)) state.photoToken = photoToken;
  }

  return withoutUndefined(state);
}

export function parseAdopterSearchRecord(record: SearchParamsRecord) {
  const params = searchParamsFromRecord(record);
  return parseAdopterSearchState(params);
}

export function parseAdopterSearchRequest(record: SearchParamsRecord) {
  const params = searchParamsFromRecord(record);
  return {
    state: parseAdopterSearchState(params),
    referenceStatus: getAdopterReferenceQueryStatus(params),
  };
}

export function getAdopterReferenceQueryStatus(
  params: SearchParamsReader,
): AdopterReferenceQueryStatus {
  const reference = params.get("reference");
  const prototype = params.get("prototype");

  if (reference === null) return prototype === null ? "none" : "invalid";
  if (reference === "photo") return prototype === null ? "photo" : "invalid";
  if (reference !== "breed" || prototype === null || !/^\d+$/.test(prototype)) {
    return "invalid";
  }

  const label = Number(prototype);
  return Number.isInteger(label) && getVisualReferenceBreed(label) ? "breed" : "invalid";
}

export function serializeAdopterSearchState(state: AdopterSearchState) {
  const params = new URLSearchParams();
  params.set("v", String(ADOPTER_SEARCH_CONTRACT_VERSION));
  if (state.searchMode) params.set("mode", state.searchMode);
  setMapped(params, "age", state.age, AGE_TO_QUERY);
  setMapped(params, "sex", state.sex, SEX_TO_QUERY);
  setMapped(params, "size", state.size, SIZE_TO_QUERY);
  setMapped(params, "coat", state.coat, COAT_TO_QUERY);
  setMapped(params, "health", state.health, HEALTH_TO_QUERY);
  setMapped(params, "sterilized", state.sterilized, STATUS_TO_QUERY);
  setMapped(params, "vaccinated", state.vaccinated, STATUS_TO_QUERY);
  setMapped(params, "dewormed", state.dewormed, STATUS_TO_QUERY);
  const breed = state.breed ? validatedBreed(state.breed) : undefined;
  if (breed) params.set("breed", breed);
  setMapped(params, "color", state.color, COLOR_TO_QUERY);

  if (
    state.referenceType === "breed" &&
    state.prototypeLabel !== undefined &&
    getVisualReferenceBreed(state.prototypeLabel)
  ) {
    params.set("reference", "breed");
    params.set("prototype", String(state.prototypeLabel));
  } else if (state.referenceType === "photo") {
    params.set("reference", "photo");
    if (state.photoToken && PHOTO_TOKEN_PATTERN.test(state.photoToken)) {
      params.set("photoToken", state.photoToken);
    }
  }

  return params;
}

export function createAdopterHref(pathname: string, state: AdopterSearchState) {
  return `${pathname}?${serializeAdopterSearchState(state).toString()}`;
}

export function adopterPreferencesOnly(state: AdopterSearchState): AdopterSearchState {
  return withoutUndefined({
    age: state.age,
    sex: state.sex,
    size: state.size,
    coat: state.coat,
    health: state.health,
    sterilized: state.sterilized,
    vaccinated: state.vaccinated,
    dewormed: state.dewormed,
    breed: state.breed,
    color: state.color,
  });
}

export function adopterCharacteristicsOnly(state: AdopterSearchState): AdopterSearchState {
  const preferences = adopterPreferencesOnly(state);
  delete preferences.breed;
  return preferences;
}

function setMapped<T extends string>(
  params: URLSearchParams,
  key: string,
  value: T | undefined,
  values: Record<T, string>,
) {
  if (value && values[value]) params.set(key, values[value]);
}

function searchParamsFromRecord(record: SearchParamsRecord) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue !== undefined) params.set(key, firstValue);
  }
  return params;
}

function withoutUndefined(state: AdopterSearchState) {
  return Object.fromEntries(
    Object.entries(state).filter(([, value]) => value !== undefined),
  ) as AdopterSearchState;
}
