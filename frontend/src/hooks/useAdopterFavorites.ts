"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getFavoritesServerSnapshot,
  getFavoritesSnapshot,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/adoptante/favoritesStorage";

/** Most-recently-added-first PetID list, synced across components/tabs. SSR-safe (empty on the server). */
export function useAdopterFavoritePetIds(): string[] {
  return useSyncExternalStore(subscribeFavorites, getFavoritesSnapshot, getFavoritesServerSnapshot);
}

/** Favorite state + toggle for a single PetID. */
export function useAdopterFavorite(petId: string): { isFavorite: boolean; toggle: () => void } {
  const petIds = useAdopterFavoritePetIds();
  const toggle = useCallback(() => {
    toggleFavorite(petId);
  }, [petId]);
  return { isFavorite: petIds.includes(petId), toggle };
}
