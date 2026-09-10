import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { adopterProfiles } from "../src/lib/adoptante/artifacts.ts";
import { getProtectoraPetfinderProfileById } from "../src/data/protectoraPetfinderProfiles.ts";
import { getVisibilityRecommendations } from "../src/lib/protectora/visibilityRecommendations.ts";

for (const riskLevel of ["Bajo", "Medio", "Alto"]) {
  test(`cada perfil de riesgo ${riskLevel} recibe acciones de visibilidad`, () => {
    const source = adopterProfiles.find((profile) => profile.riskLevel === riskLevel);
    assert.ok(source, `debe existir al menos un perfil ${riskLevel}`);
    const dog = getProtectoraPetfinderProfileById(source.petId);
    assert.ok(dog);
    const recommendations = getVisibilityRecommendations(dog);
    assert.ok(recommendations.length >= 5);
    for (const recommendation of recommendations) {
      assert.ok(recommendation.action.trim().length > 0);
      assert.ok(recommendation.reason.trim().length > 0);
    }
  });
}

test("las recomendaciones siempre incluyen contenido, imagen, vídeo, completitud y difusión", () => {
  const source = adopterProfiles[0];
  const dog = getProtectoraPetfinderProfileById(source.petId);
  assert.ok(dog);
  const recommendations = getVisibilityRecommendations(dog).map((item) => `${item.action} ${item.reason}`).join(" ");
  assert.match(recommendations, /descripci/i);
  assert.match(recommendations, /fotograf/i);
  assert.match(recommendations, /vídeo/i);
  assert.match(recommendations, /completitud|datos estructurados/i);
  assert.match(recommendations, /difusi|visibilidad/i);
});

test("Bailey se presenta sin el texto explicativo entre paréntesis en Protectora", () => {
  const bailey = adopterProfiles.find((profile) => profile.name === "Bailey (Great With Kids).");
  assert.ok(bailey, "debe existir el registro histórico de Bailey");
  const dog = getProtectoraPetfinderProfileById(bailey.petId);
  assert.ok(dog);
  assert.equal(dog.name, "Bailey");
});

test("Vista Protectora enlaza al catálogo completo y el catálogo permite búsqueda, riesgo, orden y paginación", async () => {
  const protectoraSource = await readFile(new URL("../src/app/protectora/page.tsx", import.meta.url), "utf8");
  const catalogSource = await readFile(new URL("../src/app/protectora/catalogo/page.tsx", import.meta.url), "utf8");
  assert.match(protectoraSource, /href="\/protectora\/catalogo"/);
  assert.match(protectoraSource, /Ver los \{HISTORICAL_CATALOG_SIZE\.toLocaleString/);
  assert.match(catalogSource, /const PAGE_SIZE = 24/);
  assert.match(catalogSource, /name="q"/);
  assert.match(catalogSource, /name="riesgo"/);
  assert.match(catalogSource, /name="orden"/);
  assert.match(catalogSource, /filtered\.slice\(start, start \+ PAGE_SIZE\)/);
  assert.match(catalogSource, /Revisar perfil y acciones/);
});

test("la ficha individual muestra siempre el bloque de acciones recomendadas", async () => {
  const source = await readFile(new URL("../src/app/protectora/perro/[id]/page.tsx", import.meta.url), "utf8");
  assert.match(source, /Cómo mejorar su visibilidad/);
  assert.match(source, /getVisibilityRecommendations\(dog\)/);
  assert.match(source, /Por qué:/);
  assert.match(source, /no representan relaciones causales ni garantizan una reducción del tiempo de adopción/);
});
