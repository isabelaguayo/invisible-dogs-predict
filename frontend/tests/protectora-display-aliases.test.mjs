import assert from "node:assert/strict";
import test from "node:test";

import { getProtectoraPetfinderProfileById } from "../src/data/protectoraPetfinderProfiles.ts";

test("Protectora asigna un alias de presentación a perfiles históricos sin nombre", () => {
  const dog = getProtectoraPetfinderProfileById("5d792dd24");
  assert.ok(dog, "debe existir el perfil histórico sin nombre");
  assert.equal(dog.source.nombre_app, "Sin nombre");
  assert.notEqual(dog.name, "Sin nombre");
  assert.match(dog.name, /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/u);
});

test("el alias de presentación es estable para el mismo PetID", () => {
  const first = getProtectoraPetfinderProfileById("5d792dd24");
  const second = getProtectoraPetfinderProfileById("5d792dd24");
  assert.ok(first && second);
  assert.equal(first.name, second.name);
});
