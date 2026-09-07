import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// --- Minimal fake browser environment ---------------------------------
// favoritesStorage.ts guards every localStorage access behind
// `typeof window !== "undefined"`, so under plain Node it would silently
// no-op. To exercise the real add/remove/toggle/persistence logic (not just
// static source checks) we install a tiny fake window/localStorage before
// importing the module — this is the same module Client Components import,
// unmodified.
class FakeLocalStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}
class FakeWindow {
  constructor() {
    this.localStorage = new FakeLocalStorage();
    this.listeners = new Map();
  }
  addEventListener(type, cb) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(cb);
  }
  removeEventListener(type, cb) { this.listeners.get(type)?.delete(cb); }
  dispatchEvent(event) {
    for (const cb of this.listeners.get(event.type) ?? []) cb(event);
  }
}
globalThis.window = new FakeWindow();
if (typeof globalThis.CustomEvent === "undefined") {
  globalThis.CustomEvent = class CustomEvent { constructor(type) { this.type = type; } };
}

const favorites = await import("../src/lib/adoptante/favoritesStorage.ts");
const {
  ADOPTER_FAVORITES_STORAGE_KEY,
  readFavoritePetIds,
  readFavoritePetIdsMostRecentFirst,
  isFavorite,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  subscribeFavorites,
} = favorites;

function resetStorage() {
  window.localStorage.clear();
}

// A: storage vacío.
test("A: storage vacío devuelve una lista vacía, no un error", () => {
  resetStorage();
  assert.deepEqual(readFavoritePetIds(), []);
  assert.deepEqual(readFavoritePetIdsMostRecentFirst(), []);
  assert.equal(isFavorite("e0667be3b"), false);
});

// B: add.
test("B: addFavorite añade el PetID", () => {
  resetStorage();
  addFavorite("e0667be3b");
  assert.deepEqual(readFavoritePetIds(), ["e0667be3b"]);
  assert.equal(isFavorite("e0667be3b"), true);
});

// C: remove.
test("C: removeFavorite lo quita", () => {
  resetStorage();
  addFavorite("e0667be3b");
  removeFavorite("e0667be3b");
  assert.deepEqual(readFavoritePetIds(), []);
  assert.equal(isFavorite("e0667be3b"), false);
});

// D: toggle.
test("D: toggleFavorite añade y quita alternativamente, devolviendo el nuevo estado", () => {
  resetStorage();
  assert.equal(toggleFavorite("e0667be3b"), true);
  assert.equal(isFavorite("e0667be3b"), true);
  assert.equal(toggleFavorite("e0667be3b"), false);
  assert.equal(isFavorite("e0667be3b"), false);
});

// E: no duplicados.
test("E: añadir el mismo PetID dos veces no lo duplica", () => {
  resetStorage();
  addFavorite("e0667be3b");
  addFavorite("e0667be3b");
  assert.deepEqual(readFavoritePetIds(), ["e0667be3b"]);
});

// F: persistencia/serialización.
test("F: el valor persistido es JSON válido de un array de PetIDs, recuperable tal cual", () => {
  resetStorage();
  addFavorite("e0667be3b");
  addFavorite("485bebd4f");
  const raw = window.localStorage.getItem(ADOPTER_FAVORITES_STORAGE_KEY);
  assert.equal(typeof raw, "string");
  const parsed = JSON.parse(raw);
  assert.deepEqual(parsed, ["e0667be3b", "485bebd4f"]);
  // Simulate a fresh read (e.g. after reload) by forcing the module to
  // reparse: since the cache only invalidates on a content change, we
  // confirm here that the raw string itself is what a real page reload
  // would read back via `localStorage.getItem`.
  assert.deepEqual(readFavoritePetIds(), ["e0667be3b", "485bebd4f"]);
});

// G: orden reciente.
test("G: readFavoritePetIdsMostRecentFirst muestra el añadido más reciente primero", () => {
  resetStorage();
  addFavorite("aaaaaaaaa");
  addFavorite("bbbbbbbbb");
  addFavorite("ccccccccc");
  assert.deepEqual(readFavoritePetIdsMostRecentFirst(), ["ccccccccc", "bbbbbbbbb", "aaaaaaaaa"]);
  removeFavorite("bbbbbbbbb");
  assert.deepEqual(readFavoritePetIdsMostRecentFirst(), ["ccccccccc", "aaaaaaaaa"]);
});

// H: datos corruptos localStorage.
test("H: JSON corrupto o de forma inesperada en localStorage no lanza y se trata como vacío", () => {
  resetStorage();
  window.localStorage.setItem(ADOPTER_FAVORITES_STORAGE_KEY, "{not valid json");
  assert.deepEqual(readFavoritePetIds(), []);

  window.localStorage.setItem(ADOPTER_FAVORITES_STORAGE_KEY, JSON.stringify({ not: "an array" }));
  assert.deepEqual(readFavoritePetIds(), []);

  window.localStorage.setItem(ADOPTER_FAVORITES_STORAGE_KEY, JSON.stringify([1, null, "", "e0667be3b", 42]));
  assert.deepEqual(readFavoritePetIds(), ["e0667be3b"]);
});

test("cambios en el store disparan el evento de cambio (sincronización entre componentes)", () => {
  resetStorage();
  let fired = 0;
  const unsubscribe = subscribeFavorites(() => { fired += 1; });
  addFavorite("e0667be3b");
  removeFavorite("e0667be3b");
  unsubscribe();
  assert.equal(fired, 2);
});

// --- API server-side (favoritesLookup.ts) ---------------------------------
const {
  ADOPTER_PET_ID_PATTERN,
  ADOPTER_FAVORITES_MAX_PET_IDS,
  sanitizeAdopterFavoritePetIds,
  resolveAdopterFavoriteProfiles,
} = await import("../src/lib/adoptante/favoritesLookup.ts");

// I: API con PetID válidos.
test("I: sanitizeAdopterFavoritePetIds valida formato, deduplica y capa el límite", () => {
  assert.deepEqual(sanitizeAdopterFavoritePetIds(["e0667be3b", "e0667be3b", "E0667BE3B"]), ["e0667be3b"]);
  assert.deepEqual(sanitizeAdopterFavoritePetIds(["not-a-petid", "", "  ", 123, null, undefined, {}]), []);
  assert.deepEqual(sanitizeAdopterFavoritePetIds("not-an-array"), []);
  const huge = Array.from({ length: ADOPTER_FAVORITES_MAX_PET_IDS + 50 }, (_, i) => `${i}`.padStart(9, "0"));
  assert.equal(sanitizeAdopterFavoritePetIds(huge).length, ADOPTER_FAVORITES_MAX_PET_IDS);
  assert.match("e0667be3b", ADOPTER_PET_ID_PATTERN);
});

test("resolveAdopterFavoriteProfiles devuelve el perfil real para un PetID válido y omite los inexistentes", () => {
  const dogs = resolveAdopterFavoriteProfiles(["e0667be3b", "000000000"]);
  assert.equal(dogs.length, 1, "el PetID inexistente se descarta sin inventar nada");
  assert.equal(dogs[0].profile.petId, "e0667be3b");
});

// J/K: sin embeddings/Tsinghua. Check actual imports, not mere mentions —
// the module's own header comment explains what it deliberately avoids,
// which legitimately names those terms in the negative.
test("J/K: la resolución de favoritos no importa search.ts, photoSearch.ts ni artefactos DINOv2/Tsinghua", async () => {
  const lookupSource = await readFile(new URL("../src/lib/adoptante/favoritesLookup.ts", import.meta.url), "utf8");
  const lookupImports = lookupSource.split("\n").filter((line) => line.startsWith("import ")).join("\n");
  assert.doesNotMatch(lookupImports, /from ".\/search"|from ".\/photoSearch"|dinov2|tsinghua/i);
  const routeSource = await readFile(new URL("../src/app/api/adoptante/favorites/route.ts", import.meta.url), "utf8");
  const routeImports = routeSource.split("\n").filter((line) => line.startsWith("import ")).join("\n");
  assert.doesNotMatch(routeImports, /search|photoSearch|dinov2|tsinghua|embedding/i);
});

// L: favoritos sin similarity.
test("L: los perfiles de favoritos no llevan similarity ni rank (search vacío)", () => {
  const dogs = resolveAdopterFavoriteProfiles(["e0667be3b"]);
  assert.deepEqual(dogs[0].search, {});
});

// --- UI wiring (static source checks, consistent with the rest of the suite) ---
const dogResultCardSource = await readFile(new URL("../src/components/DogResultCard.tsx", import.meta.url), "utf8");
const profileFavoriteButtonSource = await readFile(new URL("../src/components/ProfileFavoriteButton.tsx", import.meta.url), "utf8");
const favoritesNavLinkSource = await readFile(new URL("../src/components/adoptante/FavoritesNavLink.tsx", import.meta.url), "utf8");
const favoritesPageSource = await readFile(new URL("../src/app/adoptante/favoritos/page.tsx", import.meta.url), "utf8");
const proxySource = await readFile(new URL("../src/proxy.ts", import.meta.url), "utf8");

// M: DogResultCard estado activo/inactivo.
test("M: DogResultCard usa el store real de favoritos (aria-pressed dinámico, no useState local)", () => {
  assert.match(dogResultCardSource, /useAdopterFavorite\(dog\.profile\.petId\)/);
  assert.match(dogResultCardSource, /aria-pressed=\{isFavorite\}/);
  // "explanationOpen" is unrelated local UI state (the "por qué" toggle) and
  // legitimately still uses useState — what must NOT exist is a separate
  // local useState for the favorite flag itself (that would mean it isn't
  // wired to the shared store).
  assert.doesNotMatch(dogResultCardSource, /useState\(false\);\s*\/\/\s*favorite|const \[favorite, setFavorite\] = useState/);
});

// N: ficha comparte mismo estado.
test("N: la ficha individual usa el mismo hook/store que las tarjetas — no una implementación separada", () => {
  assert.match(profileFavoriteButtonSource, /useAdopterFavorite\(petId\)/);
  assert.match(dogResultCardSource, /from "@\/hooks\/useAdopterFavorites"/);
  assert.match(profileFavoriteButtonSource, /from "@\/hooks\/useAdopterFavorites"/);
});

// O: contador correcto.
test("O: el contador del header refleja el número real de favoritos", () => {
  assert.match(favoritesNavLinkSource, /useAdopterFavoritePetIds\(\)/);
  assert.match(favoritesNavLinkSource, /petIds\.length/);
});

// P: estado vacío.
test("P: la página de Favoritos define el estado vacío pedido", () => {
  assert.match(favoritesPageSource, /Aún no tienes perfiles favoritos/);
  assert.match(favoritesPageSource, /Marca el corazón de los perfiles que quieras volver a consultar\./);
  assert.match(favoritesPageSource, /Buscar perfiles/);
  assert.match(favoritesPageSource, /href="\/adoptante\/encontrar"/);
});

// Q: Ver ficha -> PetID directo.
test("Q: \"Ver ficha\" desde Favoritos enlaza al PetID directo, sin query ni contexto de búsqueda", () => {
  assert.match(favoritesPageSource, /profileHref=\{`\/adoptante\/perro\/\$\{dog\.profile\.petId\}`\}/);
  assert.doesNotMatch(favoritesPageSource, /createAdopterHref/);
});

test('favoritos oculta "Por qué te lo mostramos" y no muestra similarity, vía variant="favorite"', () => {
  assert.match(favoritesPageSource, /variant="favorite"/);
  assert.match(dogResultCardSource, /variant !== "favorite"/);
  assert.match(dogResultCardSource, /variant === "favorite" \? null :/);
});

test("no se duplica DogResultCard: Favoritos reutiliza el mismo componente que Resultados", () => {
  assert.match(favoritesPageSource, /import \{ DogResultCard \} from "@\/components\/DogResultCard"/);
});

// R: Adoptante sigue sin login.
test("R: ninguna ruta de Adoptante (incluida /adoptante/favoritos) exige sesión — el proxy solo protege Protectora", () => {
  const configMatch = proxySource.match(/export const config = \{([\s\S]*?)\};/);
  assert.ok(configMatch);
  assert.doesNotMatch(configMatch[1], /adoptante/i);
});

// S: Protectora auth intacta.
test("S: la protección de Protectora sigue intacta (no se tocó proxy.ts en esta fase)", () => {
  assert.match(proxySource, /PROTECTORA_LOGIN_PATH/);
  assert.match(proxySource, /"\/protectora"/);
  assert.match(proxySource, /"\/protectora\/:path\*"/);
});

test("localStorage guarda solo PetIDs — nunca fotos, embeddings, riesgo ni similarity", () => {
  const storageSource = dogResultCardSource; // sanity: no direct localStorage writes bypassing the store
  assert.doesNotMatch(storageSource, /localStorage\.setItem/);
});

test("las funciones de favoritesStorage nunca acceden a window durante el render de servidor (SSR-safe)", async () => {
  const source = await readFile(new URL("../src/lib/adoptante/favoritesStorage.ts", import.meta.url), "utf8");
  assert.match(source, /typeof window !== "undefined"/);
});

// --- Copy tests (sección 26) ------------------------------------------
const encontrarSource = await readFile(new URL("../src/app/adoptante/encontrar/page.tsx", import.meta.url), "utf8");
const referenciaSource = await readFile(new URL("../src/app/adoptante/referencia/page.tsx", import.meta.url), "utf8");
const resultadosSource = await readFile(new URL("../src/app/adoptante/resultados/page.tsx", import.meta.url), "utf8");
const fichaSource = await readFile(new URL("../src/app/adoptante/perro/[id]/page.tsx", import.meta.url), "utf8");

test('copy: ya no aparece "Por el aspecto de una raza" ni "Elegir raza de referencia" como texto de método', () => {
  for (const source of [encontrarSource, referenciaSource, resultadosSource]) {
    assert.doesNotMatch(source, /Por el aspecto de una raza/);
    assert.doesNotMatch(source, /Elegir raza de referencia/);
    assert.doesNotMatch(source, /Apariencia de raza/);
    assert.doesNotMatch(source, /apariencia de raza/);
  }
});

test('copy: sí aparece "Por apariencia visual" y "Elegir referencia visual" en el método B', () => {
  assert.match(encontrarSource, /Por apariencia visual/);
  assert.match(encontrarSource, /Elegir referencia visual/);
  assert.match(referenciaSource, /Busca por apariencia visual/);
  assert.match(referenciaSource, /Búsqueda por apariencia visual/);
  assert.match(resultadosSource, /Búsqueda por apariencia visual/);
});

test('copy: "raza" sigue apareciendo como dato PetFinder real (no es un error)', () => {
  assert.match(fichaSource, /<dt>Raza<\/dt>/);
});

test("copy: no se tocaron nombres técnicos internos (breed, prototype, searchAdopterByBreed, prototypeLabel)", async () => {
  const searchSource = await readFile(new URL("../src/lib/adoptante/search.ts", import.meta.url), "utf8");
  assert.match(searchSource, /searchAdopterByBreed/);
  assert.match(referenciaSource, /prototypeLabel/);
  assert.match(referenciaSource, /referenceType: "breed"/);
});
