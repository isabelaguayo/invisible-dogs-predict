// BFF for Method C (search by photograph). Runs only server-side: receives
// the uploaded photo from the browser, forwards it server-to-server to the
// local Python DINOv2 service, ranks the resulting embedding against the
// prepared PetFinder embeddings via photoSearch.ts, and returns only the
// UI-shaped Top 12 — never the embedding itself, never a filesystem path.
import { NextResponse, type NextRequest } from "next/server";
import { ADOPTER_PHOTO_ACCEPTED_TYPES, ADOPTER_PHOTO_MAX_BYTES } from "@/lib/adoptante/photoValidation";
import { createAdopterDogResultsFromRanked } from "@/lib/adoptante/presentation";
import { PhotoSearchValidationError, searchAdopterByPhotoEmbedding } from "@/lib/adoptante/photoSearch";
import type { AdopterDogResult } from "@/types/adopterResult";

export const runtime = "nodejs";

const DINOV2_SERVICE_URL = process.env.ADOPTER_DINOV2_SERVICE_URL ?? "http://127.0.0.1:8000";
const SERVICE_TIMEOUT_MS = 45_000;

export type AdopterPhotoSearchErrorCode =
  | "missing-file"
  | "invalid-type"
  | "too-large"
  | "empty-file"
  | "service-unavailable"
  | "timeout"
  | "invalid-image"
  | "inference-failed";

export type AdopterPhotoSearchResponse =
  | { status: "results" | "empty"; mode: "similarity"; candidateCount: number; dogs: AdopterDogResult[] }
  | { status: "error"; code: AdopterPhotoSearchErrorCode; message: string };

const ERROR_MESSAGES: Record<AdopterPhotoSearchErrorCode, string> = {
  "missing-file": "No hemos recibido ninguna fotografía.",
  "invalid-type": "Utiliza una imagen JPG, PNG o WEBP.",
  "too-large": "La fotografía supera el tamaño máximo de 10 MB.",
  "empty-file": "El archivo recibido está vacío.",
  "service-unavailable": "No hemos podido conectar con el servicio de análisis de imágenes. Comprueba que esté iniciado e inténtalo de nuevo.",
  "timeout": "El análisis de la fotografía está tardando demasiado. Inténtalo de nuevo.",
  "invalid-image": "No hemos podido analizar la imagen. Prueba con otra fotografía.",
  "inference-failed": "No hemos podido analizar la fotografía. Inténtalo de nuevo.",
};

function errorResponse(code: AdopterPhotoSearchErrorCode, status: number) {
  return NextResponse.json<AdopterPhotoSearchResponse>(
    { status: "error", code, message: ERROR_MESSAGES[code] },
    { status },
  );
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("missing-file", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return errorResponse("missing-file", 400);
  if (file.size === 0) return errorResponse("empty-file", 400);
  if (file.size > ADOPTER_PHOTO_MAX_BYTES) return errorResponse("too-large", 413);
  if (!ADOPTER_PHOTO_ACCEPTED_TYPES.includes(file.type as (typeof ADOPTER_PHOTO_ACCEPTED_TYPES)[number])) {
    return errorResponse("invalid-type", 415);
  }

  const serviceFormData = new FormData();
  serviceFormData.append("file", file, file.name);

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), SERVICE_TIMEOUT_MS);
  let embeddingResponse: Response;
  try {
    embeddingResponse = await fetch(`${DINOV2_SERVICE_URL}/embed`, {
      method: "POST",
      body: serviceFormData,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return errorResponse("timeout", 504);
    return errorResponse("service-unavailable", 503);
  } finally {
    clearTimeout(timeoutHandle);
  }

  if (!embeddingResponse.ok) {
    const code: AdopterPhotoSearchErrorCode = embeddingResponse.status === 422
      ? "invalid-image"
      : embeddingResponse.status === 413
        ? "too-large"
        : embeddingResponse.status === 415
          ? "invalid-type"
          : "inference-failed";
    return errorResponse(code, code === "inference-failed" ? 502 : embeddingResponse.status);
  }

  let embeddingPayload: { dimension?: unknown; embedding?: unknown };
  try {
    embeddingPayload = await embeddingResponse.json();
  } catch {
    return errorResponse("inference-failed", 502);
  }

  if (
    embeddingPayload.dimension !== 384
    || !Array.isArray(embeddingPayload.embedding)
    || embeddingPayload.embedding.length !== 384
  ) {
    return errorResponse("inference-failed", 502);
  }

  let searchResponse;
  try {
    searchResponse = searchAdopterByPhotoEmbedding(embeddingPayload.embedding as number[]);
  } catch (error) {
    if (error instanceof PhotoSearchValidationError) return errorResponse("inference-failed", 502);
    throw error;
  }

  const dogs = createAdopterDogResultsFromRanked(searchResponse.results);
  return NextResponse.json<AdopterPhotoSearchResponse>({
    status: dogs.length ? "results" : "empty",
    mode: "similarity",
    candidateCount: searchResponse.candidateCount,
    dogs,
  });
}
