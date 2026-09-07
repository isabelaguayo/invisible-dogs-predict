// Server-only resolver for /adoptante/favoritos. The browser only ever holds
// PetIDs (localStorage); this route turns them into full profile data using
// the same prepared PetFinder artifact and presentation layer as every other
// Adoptante view. No embeddings, no Tsinghua, no DINOv2, no ranking — a
// favorite is a direct profile lookup, never re-scored.
import { NextResponse, type NextRequest } from "next/server";
import {
  ADOPTER_FAVORITES_MAX_PET_IDS,
  resolveAdopterFavoriteProfiles,
  sanitizeAdopterFavoritePetIds,
} from "@/lib/adoptante/favoritesLookup";
import type { AdopterDogResult } from "@/types/adopterResult";

export const runtime = "nodejs";

export type AdopterFavoritesResponse =
  | { status: "ok"; dogs: AdopterDogResult[]; requested: number; found: number }
  | { status: "error"; message: string };

export async function POST(request: NextRequest) {
  let body: { petIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<AdopterFavoritesResponse>(
      { status: "error", message: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.petIds)) {
    return NextResponse.json<AdopterFavoritesResponse>(
      { status: "error", message: "petIds debe ser un array." },
      { status: 400 },
    );
  }

  const petIds = sanitizeAdopterFavoritePetIds(body.petIds);
  const dogs = resolveAdopterFavoriteProfiles(petIds);

  return NextResponse.json<AdopterFavoritesResponse>({
    status: "ok",
    dogs,
    requested: Math.min(body.petIds.length, ADOPTER_FAVORITES_MAX_PET_IDS),
    found: dogs.length,
  });
}
