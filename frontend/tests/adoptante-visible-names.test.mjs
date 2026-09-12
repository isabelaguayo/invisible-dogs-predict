import assert from "node:assert/strict";
import test from "node:test";

import { presentPetfinderVisibleName } from "../src/lib/presentation/petfinderName.ts";

test("Adoptante sustituye nombres ausentes por un alias estable", () => {
  const first = presentPetfinderVisibleName("Sin nombre", "5d792dd24", "Macho");
  const second = presentPetfinderVisibleName("Sin nombre", "5d792dd24", "Macho");

  assert.notEqual(first, "Sin nombre");
  assert.equal(first, second);
  assert.match(first, /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/u);
});

test("Adoptante sustituye identificadores históricos tipo D117 por un nombre de presentación", () => {
  const visibleName = presentPetfinderVisibleName("D117 (160415)", "71eda06c6", "Hembra");

  assert.notEqual(visibleName, "Sin nombre");
  assert.doesNotMatch(visibleName, /\d/);
  assert.match(visibleName, /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/u);
});

test("Adoptante normaliza mayúsculas y signos decorativos en nombres utilizables", () => {
  assert.equal(presentPetfinderVisibleName("HAPPY", "example-happy", "Macho"), "Happy");
  assert.equal(presentPetfinderVisibleName("*Cola*", "example-cola", "Hembra"), "Cola");
});

test("Adoptante no muestra descriptores genéricos como si fueran nombres", () => {
  const visibleName = presentPetfinderVisibleName("Poodle Female", "079332bdc", "Hembra");

  assert.notEqual(visibleName, "Poodle female");
  assert.match(visibleName, /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/u);
});

test("Adoptante sustituye frases promocionales del anuncio por un nombre de presentación", () => {
  const visibleName = presentPetfinderVisibleName("Pls take me home", "promo-profile", "Hembra");

  assert.notEqual(visibleName, "Pls take me home");
  assert.match(visibleName, /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/u);
  assert.equal(visibleName, presentPetfinderVisibleName("Pls take me home", "promo-profile", "Hembra"));
});

test("Adoptante no muestra la raza como si fuera el nombre del perro", () => {
  const shihTzu = presentPetfinderVisibleName(
    "Shih Tzu",
    "breed-only-shih-tzu",
    "Macho",
    ["Shih Tzu", undefined],
  );
  const spitz = presentPetfinderVisibleName(
    "Spitz",
    "breed-only-spitz",
    "Hembra",
    ["Spitz", undefined],
  );

  assert.notEqual(shihTzu.toLocaleLowerCase("en-US"), "shih tzu");
  assert.notEqual(spitz.toLocaleLowerCase("en-US"), "spitz");
  assert.match(shihTzu, /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/u);
  assert.match(spitz, /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/u);
});
