// Client-side favorites store. No account, no login, no backend persistence —
// only a PetID list in localStorage, scoped to this browser. Every function
// here is guarded against SSR (no window/localStorage access during server
// render) so it is safe to import from any component. Cross-component sync
// within a tab happens via a CustomEvent; cross-tab sync via the native
// `storage` event (both wired through subscribeFavorites, consumed by
// useAdopterFavorites via useSyncExternalStore).
export const ADOPTER_FAVORITES_STORAGE_KEY = "invisibledogs.adoptante.favorites.v1";
const CHANGE_EVENT = "invisibledogs:adoptante-favorites-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function parseStoredIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

// Cached so repeated reads (and useSyncExternalStore's snapshot comparisons)
// return the SAME array reference when the underlying storage hasn't
// changed — required to avoid an infinite re-render loop.
let cachedRaw: string | null | undefined;
let cachedIds: string[] = [];
let cachedIdsMostRecentFirst: string[] = [];

function refreshCache(): void {
  const raw = isBrowser() ? window.localStorage.getItem(ADOPTER_FAVORITES_STORAGE_KEY) : null;
  if (raw === cachedRaw) return;
  cachedRaw = raw;
  cachedIds = parseStoredIds(raw);
  cachedIdsMostRecentFirst = [...cachedIds].reverse();
}

function writeIds(ids: string[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(ADOPTER_FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Best-effort only: quota exceeded or storage disabled shouldn't crash the app.
  }
  cachedRaw = undefined; // force refreshCache() to recompute on next read
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** Oldest-added first (raw storage order). */
export function readFavoritePetIds(): string[] {
  refreshCache();
  return cachedIds;
}

/** Most-recently-added first — the order the Favoritos page should display. */
export function readFavoritePetIdsMostRecentFirst(): string[] {
  refreshCache();
  return cachedIdsMostRecentFirst;
}

export function isFavorite(petId: string): boolean {
  refreshCache();
  return cachedIds.includes(petId);
}

export function addFavorite(petId: string): void {
  refreshCache();
  if (cachedIds.includes(petId)) return;
  writeIds([...cachedIds, petId]);
}

export function removeFavorite(petId: string): void {
  refreshCache();
  const next = cachedIds.filter((id) => id !== petId);
  if (next.length === cachedIds.length) return;
  writeIds(next);
}

/** Toggles the PetID and returns the new state (true = now a favorite). */
export function toggleFavorite(petId: string): boolean {
  if (isFavorite(petId)) {
    removeFavorite(petId);
    return false;
  }
  addFavorite(petId);
  return true;
}

export function subscribeFavorites(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** For useSyncExternalStore's getSnapshot — stable reference when unchanged. */
export function getFavoritesSnapshot(): string[] {
  return readFavoritePetIdsMostRecentFirst();
}

/** For useSyncExternalStore's getServerSnapshot — neutral state during SSR. */
export function getFavoritesServerSnapshot(): string[] {
  return [];
}
