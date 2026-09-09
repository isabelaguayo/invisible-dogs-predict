import "node:fs";
import descriptions from "../../../server-data/tfm/petfinderDescriptions.v1.json" with { type: "json" };

// Historical text stays server-side; search cards never serialize it.
export function getPetfinderHistoricalDescription(petId: string): string | undefined {
  const byPetId: Readonly<Record<string, string>> = descriptions;
  return byPetId[petId]?.trim() || undefined;
}
