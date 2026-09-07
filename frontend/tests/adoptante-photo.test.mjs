import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const photoPage = await readFile(
  new URL("../src/app/adoptante/fotografia/page.tsx", import.meta.url),
  "utf8",
);

test("C1: la interfaz de fotografía conserva selección, preview, cambio y eliminación", () => {
  assert.match(photoPage, /type="file"/);
  assert.match(photoPage, /photo-preview/);
  assert.match(photoPage, /Cambiar fotografía/);
  assert.match(photoPage, /Eliminar/);
});

test("C2: la página cliente no importa motores server-only directamente ni datos ficticios", () => {
  const imports = photoPage.split("\n").filter((line) => line.startsWith("import ")).join("\n");
  // The client component must go through the BFF route, never import
  // server-only modules (search.ts, photoSearch.ts, artifacts.ts) directly —
  // those use node:fs and cannot run in the browser.
  assert.doesNotMatch(imports, /searchAdopterByBreed|from "@\/lib\/adoptante\/search"|from "@\/lib\/adoptante\/photoSearch"|from "@\/lib\/adoptante\/artifacts"/);
  assert.doesNotMatch(photoPage, /DEMO_DOGS/);
});

test("C3: el CTA ejecuta una búsqueda real vía POST al BFF, sin quedar deshabilitado de forma permanente", () => {
  assert.match(photoPage, /fetch\("\/api\/adoptante\/photo-search"/);
  assert.match(photoPage, /method: "POST"/);
  // The button must be conditionally disabled (no photo yet / already
  // loading), not hardcoded `disabled` with no condition.
  assert.doesNotMatch(photoPage, /className="results-button" type="button" disabled>/);
  assert.match(photoPage, /disabled=\{!photo \|\| searchStatus === "loading"\}/);
  assert.match(photoPage, /Buscar perfiles similares/);
  assert.match(photoPage, /Analizando la fotografía…/);
});

test("C4: los resultados reutilizan DogResultCard y muestran el aviso histórico", () => {
  assert.match(photoPage, /import \{ DogResultCard \} from "@\/components\/DogResultCard"/);
  assert.match(photoPage, /dogs\.map\(\(dog\) => \(/);
  assert.match(photoPage, /profileHref=\{`\/adoptante\/perro\/\$\{dog\.profile\.petId\}`\}/);
  assert.match(photoPage, /Referencia: fotografía proporcionada/);
  assert.doesNotMatch(photoPage, /Tsinghua/);
});
