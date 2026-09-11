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
