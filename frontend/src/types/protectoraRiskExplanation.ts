export type ProtectoraRiskFactorDirection = "increase" | "decrease";

export type ProtectoraRiskFactor = {
  label: string;
  value: string | null;
  direction: ProtectoraRiskFactorDirection;
  sensitive: boolean;
  tooltip: string | null;
};

export type ProtectoraRiskExplanation = {
  petId: string;
  riskLevel: "Bajo" | "Medio" | "Alto";
  riskContext: string;
  increases: ProtectoraRiskFactor[];
  decreases: ProtectoraRiskFactor[];
};
