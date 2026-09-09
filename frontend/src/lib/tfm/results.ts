// Compact projection of existing GitHub outputs. Metrics are never re-fitted or
// scored here; the adapter records the exact commit and source checksums.
import "node:fs";
import sources from "../../../server-data/tfm/tfmSources.v1.json" with { type: "json" };

export const tfmResults = sources;
export const austinTestCount = sources.austin.bands.reduce(
  (total, band) => total + Number(band.n_perros), 0,
);
export const austinTopTen = sources.austin.topK.find(
  (row) => row.segmento_priorizado === "Top 10%",
)!;

export function formatTfmMetric(value: string | number, digits = 4): string {
  return Number(value).toLocaleString("es-ES", {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
}

export function getAdditionalPetfinderPhoto(petId: string): string | undefined {
  const photos: Readonly<Record<string, { url: string }>> = sources.additionalPhotos;
  return photos[petId]?.url;
}
