const PETFINDER_NAME_PRESENTATION_OVERRIDES: Readonly<Record<string, {
  sourceName: string;
  displayName: string;
}>> = {
  f477f306f: {
    sourceName: '"Pumpkin" - Applehead Chihuahua',
    displayName: "Pumpkin",
  },
  "719917454": {
    sourceName: "'Mango' Small Apple Head Chihuahua",
    displayName: "Mango",
  },
  caa16cc3c: {
    sourceName: "Adult Smooth Coat Chihuahua Female",
    displayName: "Sin nombre",
  },
  "43b277272": {
    sourceName: "Chibi ã¡ã³",
    displayName: "Chibi ちび",
  },
};

const MALE_PRESENTATION_NAMES = [
  "Max", "Rocky", "Toby", "Bruno", "Leo", "Simba", "Milo", "Duke", "Thor", "Bobby",
  "Rex", "Oliver", "Benji", "Teo", "Nico", "Lucky", "Tango", "Chester", "Balu", "Kiko",
] as const;

const FEMALE_PRESENTATION_NAMES = [
  "Luna", "Nala", "Kira", "Maya", "Lola", "Duna", "Mia", "Noa", "Gala", "Lia",
  "Nina", "Alma", "Sasha", "Kiara", "Vega", "Leia", "Roma", "Olivia", "Mila", "Cora",
] as const;

const GENERIC_PROFILE_LABEL = /\b(?:adult|puppy|dog|female|male|mixed|breed|coat|small|medium|large|poodle|chihuahua|beagle|month|months|year|years)\b/i;
const PROMOTIONAL_PROFILE_LABEL = /(?:\b(?:pls|please|plz)\b.*\b(?:home|adopt|adoption|family)\b|\b(?:take me home|adopt me|need(?:s)? (?:a )?home|looking for (?:a )?home|find me (?:a )?home|give me (?:a )?home|forever home|new home|save me|rescue me)\b)/i;

function sentenceCase(value: string) {
  const lower = value.toLocaleLowerCase("es-ES");
  return lower.charAt(0).toLocaleUpperCase("es-ES") + lower.slice(1);
}

function cleanHistoricalName(value: string) {
  let cleaned = value;

  // Keep a quoted leading name and discard explanatory text that follows it.
  const quotedName = cleaned.match(/^["'“‘]([^"'”’]+)["'”’]/u);
  if (quotedName?.[1]) cleaned = quotedName[1];

  // Remove historical identifiers and explanatory annotations.
  cleaned = cleaned
    .replace(/\s*\[[^\]]*\]\s*/g, " ")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\b(?=[A-Za-z0-9-]*\d)[A-Za-z0-9-]+\b/g, " ")
    .replace(/[^\p{L}\p{M}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s'"-]+|[\s'"-]+$/g, "")
    .trim();

  return cleaned;
}

function stablePresentationName(petId: string, sex?: string) {
  const names = sex === "Hembra" ? FEMALE_PRESENTATION_NAMES : MALE_PRESENTATION_NAMES;
  let hash = 0;
  for (const character of petId) {
    hash = ((hash * 31) + character.charCodeAt(0)) >>> 0;
  }
  return names[hash % names.length];
}

function comparableLabel(value: string | null | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function presentPetfinderName(
  sourceName: string | null | undefined,
  petId?: string,
) {
  const normalizedSourceName = sourceName?.trim() ?? "";
  if (!normalizedSourceName || normalizedSourceName.toLocaleLowerCase("es-ES") === "sin nombre") {
    return "Sin nombre";
  }

  const override = petId
    ? PETFINDER_NAME_PRESENTATION_OVERRIDES[petId]
    : undefined;
  if (override?.sourceName === normalizedSourceName) {
    return override.displayName;
  }

  // Decorative hearts in this historical label arrived mojibaked in the source.
  if (/\bLily\b/i.test(normalizedSourceName) && /[â¥]/.test(normalizedSourceName)) {
    return "Lily";
  }

  const cleaned = cleanHistoricalName(normalizedSourceName);
  if (!cleaned) return "Sin nombre";

  return sentenceCase(cleaned);
}

export function presentPetfinderVisibleName(
  sourceName: string | null | undefined,
  petId: string,
  sex?: string,
  breedLabels: readonly (string | null | undefined)[] = [],
) {
  const normalizedSourceName = sourceName?.trim() ?? "";
  const presented = presentPetfinderName(sourceName, petId);
  const looksLikeGenericLabel = GENERIC_PROFILE_LABEL.test(normalizedSourceName);
  const looksLikePromotionalLabel = PROMOTIONAL_PROFILE_LABEL.test(normalizedSourceName);
  const sourceComparable = comparableLabel(normalizedSourceName);
  const presentedComparable = comparableLabel(presented);
  const looksLikeBreedLabel = breedLabels.some((breed) => {
    const breedComparable = comparableLabel(breed);
    return Boolean(breedComparable)
      && (sourceComparable === breedComparable || presentedComparable === breedComparable);
  });

  if (
    presented !== "Sin nombre"
    && !looksLikeGenericLabel
    && !looksLikePromotionalLabel
    && !looksLikeBreedLabel
  ) {
    return presented;
  }

  return stablePresentationName(petId, sex);
}
