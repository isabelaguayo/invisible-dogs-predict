import assert from "node:assert/strict";
import test from "node:test";

import {
  EXACT_BREED_REFERENCE_COUNT,
  EXACT_BREED_REFERENCE_LABELS,
  getExactBreedVisualReference,
} from "../src/data/adoptante/breedReferenceMapping.ts";
import {
  alphabeticalVisualReferenceBreeds,
  filterVisualReferenceBreeds,
  petfinderBreedOptions,
} from "../src/data/adoptante/catalogs.ts";
import { createAdopterHref, parseAdopterSearchState } from "../src/lib/adoptante/query.ts";
import {
  createBreedReferenceSearchState,
  resolveInitialBreedReference,
  withExplicitBreedReference,
} from "../src/lib/adoptante/reference.ts";

test("el mapping contiene solo las 38 correspondencias exactas verificadas", () => {
  assert.equal(EXACT_BREED_REFERENCE_COUNT, 38);
  assert.equal(Object.keys(EXACT_BREED_REFERENCE_LABELS).length, 38);

  for (const [petfinderBreed, label] of Object.entries(EXACT_BREED_REFERENCE_LABELS)) {
    assert.ok(petfinderBreedOptions.includes(petfinderBreed), petfinderBreed);
    const reference = getExactBreedVisualReference(petfinderBreed);
    assert.equal(reference?.displayName, petfinderBreed, petfinderBreed);
    assert.equal(reference?.label, label, petfinderBreed);
  }
});

test("A: Golden Retriever sugiere el prototipo exacto 125", () => {
  assert.deepEqual(resolveInitialBreedReference({ breed: "Golden Retriever" }), {
    status: "selected",
    source: "suggested",
    reference: {
      id: "125",
      label: 125,
      technicalName: "golden-retriever",
      displayName: "Golden Retriever",
    },
  });
});

test("B-C-D: Akita, Poodle y la ausencia de raza no preseleccionan", () => {
  assert.deepEqual(resolveInitialBreedReference({ breed: "Akita" }), {
    status: "unavailable",
    petfinderBreed: "Akita",
  });
  assert.deepEqual(resolveInitialBreedReference({ breed: "Poodle" }), {
    status: "unavailable",
    petfinderBreed: "Poodle",
  });
  assert.deepEqual(resolveInitialBreedReference({}), { status: "none" });
  assert.equal(getExactBreedVisualReference("Akita"), undefined);
  assert.equal(getExactBreedVisualReference("Poodle"), undefined);
  assert.equal("Akita" in EXACT_BREED_REFERENCE_LABELS, false);
  assert.equal("Poodle" in EXACT_BREED_REFERENCE_LABELS, false);
});

test("E: una referencia explícita diferente prevalece sobre la sugerencia", () => {
  const selection = resolveInitialBreedReference({
    breed: "Golden Retriever",
    referenceType: "breed",
    prototypeLabel: 111,
  });
  assert.equal(selection.status, "selected");
  assert.equal(selection.source, "explicit");
  assert.equal(selection.reference.displayName, "Beagle");
  assert.equal(selection.reference.label, 111);
});

test("F: una elección manual sustituye la sugerencia sin cambiar el filtro", () => {
  const resultState = createBreedReferenceSearchState(
    { sex: "Hembra", breed: "Golden Retriever" },
    111,
  );
  assert.deepEqual(resultState, {
    sex: "Hembra",
    breed: "Golden Retriever",
    referenceType: "breed",
    prototypeLabel: 111,
  });
  assert.equal(resolveInitialBreedReference(resultState).reference.displayName, "Beagle");
});

test("G: la URL resultante conserva filtros y selección visual independiente", () => {
  const state = createBreedReferenceSearchState(
    { sex: "Hembra", size: "Mediano", breed: "Golden Retriever" },
    125,
  );
  const href = createAdopterHref("/adoptante/resultados", state);
  assert.equal(
    href,
    "/adoptante/resultados?v=1&sex=hembra&size=mediano&breed=Golden+Retriever&reference=breed&prototype=125",
  );
  assert.deepEqual(
    parseAdopterSearchState(new URLSearchParams(href.split("?")[1])),
    state,
  );
});

test("volver y cambiar raza actualiza sugerencias pero conserva elecciones explícitas", () => {
  const suggestedJourney = withExplicitBreedReference(
    { breed: "Golden Retriever" },
    { breed: "Beagle" },
  );
  assert.deepEqual(suggestedJourney, { breed: "Beagle" });
  assert.equal(resolveInitialBreedReference(suggestedJourney).reference.label, 111);

  const explicitJourney = withExplicitBreedReference(
    {
      breed: "Golden Retriever",
      referenceType: "breed",
      prototypeLabel: 111,
    },
    { breed: "Akita" },
  );
  assert.deepEqual(explicitJourney, {
    breed: "Akita",
    referenceType: "breed",
    prototypeLabel: 111,
  });
  assert.equal(resolveInitialBreedReference(explicitJourney).reference.displayName, "Beagle");
});

test("el selector expone las 130 referencias Tsinghua ordenadas alfabéticamente", () => {
  assert.equal(alphabeticalVisualReferenceBreeds.length, 130);
  assert.deepEqual(
    alphabeticalVisualReferenceBreeds.map((breed) => breed.displayName),
    [...alphabeticalVisualReferenceBreeds]
      .map((breed) => breed.displayName)
      .sort((left, right) => left.localeCompare(right, "en", { sensitivity: "base" })),
  );
  assert.equal(new Set(alphabeticalVisualReferenceBreeds.map((breed) => breed.label)).size, 130);
});

test("el buscador filtra nombres visibles sin inferir equivalencias", () => {
  assert.deepEqual(
    filterVisualReferenceBreeds("gold").map((breed) => [breed.displayName, breed.label]),
    [["Golden Retriever", 125]],
  );
  assert.deepEqual(filterVisualReferenceBreeds("Akita"), []);
});

test("Poodle muestra sus tres referencias reales sin crear un Poodle genérico", () => {
  assert.deepEqual(
    filterVisualReferenceBreeds("Poodle").map((breed) => breed.displayName),
    ["Miniature Poodle", "Standard Poodle", "Toy Poodle"],
  );
  assert.equal(filterVisualReferenceBreeds("Poodle").some((breed) => breed.displayName === "Poodle"), false);
});
