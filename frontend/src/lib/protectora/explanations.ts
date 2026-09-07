// Server-only resolver for the Protectora risk-factor explanations. Reads
// the curated, UI-ready contract (frontend/server-data/protectora) — never
// the full scientific artifact, which stays in the TFM project. Structured
// SHAP factors only; textual/SVM signals are deliberately not included in
// this contract, so they cannot leak into the UI even by accident.
import explanationsContract from "../../../server-data/protectora/petfinderProtectoraExplanations.v2.json" with { type: "json" };
import type { ProtectoraRiskExplanation, ProtectoraRiskFactor } from "@/types/protectoraRiskExplanation";

type RawFactor = {
  technicalFeature: string;
  label: string;
  value: string | null;
  direction: "increase" | "decrease";
  sensitive: boolean;
  tooltip: string | null;
};

type RawProfile = {
  petId: string;
  riskLevel: "Bajo" | "Medio" | "Alto";
  increases: RawFactor[];
  decreases: RawFactor[];
};

type RawContract = {
  version: string;
  riskLevelContext: Record<string, string>;
  profiles: Record<string, RawProfile>;
};

const contract = explanationsContract as RawContract;

function toFactor(raw: RawFactor): ProtectoraRiskFactor {
  return {
    label: raw.label,
    value: raw.value,
    direction: raw.direction,
    sensitive: raw.sensitive,
    tooltip: raw.tooltip,
  };
}

/** Resolves a PetID to its risk-factor explanation. Returns null for any PetID not covered by the curated artifact — never fabricates factors. */
export function getProtectoraRiskExplanation(petId: string): ProtectoraRiskExplanation | null {
  const raw = contract.profiles[petId];
  if (!raw) return null;

  return {
    petId: raw.petId,
    riskLevel: raw.riskLevel,
    riskContext: contract.riskLevelContext[raw.riskLevel] ?? "",
    increases: raw.increases.map(toFactor),
    decreases: raw.decreases.map(toFactor),
  };
}
