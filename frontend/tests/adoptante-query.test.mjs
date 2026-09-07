import assert from "node:assert/strict";
import test from "node:test";

import {
  adopterCharacteristicsOnly,
  createAdopterHref,
  parseAdopterSearchRequest,
  parseAdopterSearchState,
  serializeAdopterSearchState,
} from "../src/lib/adoptante/query.ts";

test("la URL omite Indiferente, valores desconocidos y parámetros ajenos", () => {
  const parsed = parseAdopterSearchState(new URLSearchParams(
    "v=1&age=indiferente&sex=otro&size=mediano&unknown=value",
  ));
  assert.deepEqual(parsed, { size: "Mediano" });
  assert.equal(serializeAdopterSearchState({}).toString(), "v=1");
});

test("serialización y parsing conservan el contrato completo permitido", () => {
  const state = {
    age: "Adulto",
    sex: "Hembra",
    size: "Extra grande",
    coat: "Largo",
    health: "Lesión leve",
    sterilized: "No consta",
    vaccinated: "Sí",
    dewormed: "No",
    breed: "German Shepherd Dog",
    color: "Yellow",
    referenceType: "breed",
    prototypeLabel: 125,
  };
  const serialized = serializeAdopterSearchState(state);
  assert.deepEqual(parseAdopterSearchState(serialized), state);
  assert.match(createAdopterHref("/adoptante/resultados", state), /^\/adoptante\/resultados\?v=1&/);
});

test("el alias inequívoco de raza se normaliza a PetFinder", () => {
  const parsed = parseAdopterSearchState(
    new URLSearchParams("v=1&breed=German+Shepherd"),
  );
  assert.equal(parsed.breed, "German Shepherd Dog");
});

test("prototype usa label y rechaza índices o versiones inválidos", () => {
  assert.deepEqual(
    parseAdopterSearchState(new URLSearchParams("v=1&reference=breed&prototype=125")),
    { referenceType: "breed", prototypeLabel: 125 },
  );
  assert.deepEqual(
    parseAdopterSearchState(new URLSearchParams("v=1&reference=breed&prototype=999")),
    {},
  );
  assert.deepEqual(
    parseAdopterSearchState(new URLSearchParams("v=2&age=adulto")),
    {},
  );
});

test("photoToken solo acepta el formato opaco previsto", () => {
  assert.deepEqual(
    parseAdopterSearchState(new URLSearchParams("v=1&reference=photo&photoToken=abc_123-X")),
    { referenceType: "photo", photoToken: "abc_123-X" },
  );
  assert.deepEqual(
    parseAdopterSearchState(new URLSearchParams("v=1&reference=photo&photoToken=not%20safe")),
    { referenceType: "photo" },
  );
});

test("G-H: detecta pares reference/prototype incompletos en la URL", () => {
  assert.equal(
    parseAdopterSearchRequest({ v: "1", reference: "breed" }).referenceStatus,
    "invalid",
  );
  assert.equal(
    parseAdopterSearchRequest({ v: "1", prototype: "125" }).referenceStatus,
    "invalid",
  );
  assert.equal(
    parseAdopterSearchRequest({ v: "1", reference: "breed", prototype: "125" }).referenceStatus,
    "breed",
  );
  assert.equal(
    parseAdopterSearchRequest({ v: "1", sex: "hembra", breed: "Akita" }).referenceStatus,
    "none",
  );
});

test("los modos A/B/C se serializan de forma explícita", () => {
  assert.equal(
    createAdopterHref("/adoptante/resultados", {
      searchMode: "characteristics",
      sex: "Hembra",
      size: "Mediano",
    }),
    "/adoptante/resultados?v=1&mode=characteristics&sex=hembra&size=mediano",
  );
  assert.equal(
    createAdopterHref("/adoptante/resultados", {
      searchMode: "breed",
      referenceType: "breed",
      prototypeLabel: 125,
    }),
    "/adoptante/resultados?v=1&mode=breed&reference=breed&prototype=125",
  );
  assert.deepEqual(
    parseAdopterSearchState(new URLSearchParams("v=1&mode=photo")),
    { searchMode: "photo" },
  );
});

test("el método A descarta cualquier filtro de raza heredado", () => {
  assert.deepEqual(
    adopterCharacteristicsOnly({
      searchMode: "characteristics",
      sex: "Hembra",
      breed: "Akita",
      referenceType: "breed",
      prototypeLabel: 125,
    }),
    { sex: "Hembra" },
  );
});
