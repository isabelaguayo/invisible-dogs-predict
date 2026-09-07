import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { createAdopterPreferenceSummary } from "../src/lib/adoptante/presentation.ts";
import { resolveAdopterProfileView } from "../src/lib/adoptante/profile.ts";
import { resolveAdopterResults } from "../src/lib/adoptante/results.ts";
import { getAdopterSearchDiagnostics } from "../src/lib/adoptante/search.ts";

const fixturesDirectory = new URL("./fixtures/", import.meta.url);
const photoDirectory = new URL("../public/images/petfinder/adoptante/", import.meta.url);
const generatedDirectory = new URL("../src/data/adoptante/generated/", import.meta.url);
const golden = JSON.parse(
  await readFile(new URL("adopter-search-golden.v1.json", fixturesDirectory), "utf8"),
);
const photoCatalog = JSON.parse(
  await readFile(new URL("adopterDemoPhotoCatalog.v1.json", generatedDirectory), "utf8"),
);

const requiredScenarioIds = [
  "all-golden-retriever",
  "female-golden-retriever",
  "medium-shiba-dog",
  "combined-french-bulldog",
  "all-toy-poodle",
];

function scenario(id) {
  return golden.scenarios.find((item) => item.id === id);
}

function resolveScenario(id) {
  const fixture = scenario(id);
  assert.ok(fixture, `Missing fixture ${id}`);
  return resolveAdopterResults({
    ...fixture.state,
    referenceType: "breed",
    prototypeLabel: fixture.prototypeLabel,
  });
}

test("el modo compatible no carga los artefactos DINOv2", () => {
  assert.equal(getAdopterSearchDiagnostics().loaded, false);
  const actual = resolveAdopterResults({ searchMode: "characteristics", sex: "Hembra" });
  assert.equal(actual.status, "results");
  assert.equal(actual.mode, "compatible");
  assert.equal(getAdopterSearchDiagnostics().loaded, false);
});

test("A1-A8: characteristics filtra PetFinder, ignora raza y no produce similarity", () => {
  const scenarios = [
    [{ searchMode: "characteristics" }, 6474],
    [{ searchMode: "characteristics", sex: "Hembra" }, 3740],
    [{ searchMode: "characteristics", size: "Mediano" }, 4867],
    [{ searchMode: "characteristics", coat: "Largo" }, 339],
    [{ searchMode: "characteristics", health: "Saludable" }, 6230],
    [{
      searchMode: "characteristics",
      sex: "Hembra",
      size: "Mediano",
      coat: "Largo",
      health: "Saludable",
      vaccinated: "Sí",
    }, 45],
  ];

  for (const [state, candidateCount] of scenarios) {
    const actual = resolveAdopterResults(state);
    assert.equal(actual.status, "results");
    assert.equal(actual.mode, "compatible");
    assert.equal(actual.candidateCount, candidateCount);
    assert.equal(actual.dogs.length, 12);
    assert.ok(actual.dogs.every((dog) => Object.keys(dog.search).length === 0));
  }

  const breedIsNotAnAFilter = resolveAdopterResults({
    searchMode: "characteristics",
    sex: "Hembra",
    breed: "Akita",
  });
  assert.equal(breedIsNotAnAFilter.status, "results");
  assert.equal(breedIsNotAnAFilter.candidateCount, 3740);

  const empty = resolveAdopterResults({
    searchMode: "characteristics",
    sex: "Hembra",
    size: "Extra grande",
    coat: "Largo",
    health: "Lesión grave",
  });
  assert.equal(empty.status, "empty");
  assert.equal(empty.mode, "compatible");
  assert.equal(empty.candidateCount, 0);
});

test("B1-B3-B7: breed compara los 6.474 perfiles PetFinder con el prototipo Tsinghua", () => {
  const golden = resolveAdopterResults({
    searchMode: "breed",
    sex: "Hembra",
    referenceType: "breed",
    prototypeLabel: 125,
  });
  assert.equal(golden.status, "results");
  assert.equal(golden.mode, "similarity");
  assert.equal(golden.candidateCount, 6474);
  assert.equal(golden.dogs[0].profile.petId, "df2d9957f");
  assert.ok(golden.dogs.every((dog) => dog.search.similarity !== undefined));

  const shiba = resolveAdopterResults({
    searchMode: "breed",
    referenceType: "breed",
    prototypeLabel: 0,
  });
  assert.equal(shiba.status, "results");
  assert.equal(shiba.candidateCount, 6474);
  assert.deepEqual(shiba.dogs.map((dog) => dog.search.rank), Array.from({ length: 12 }, (_, index) => index + 1));

  const toyPoodle = resolveAdopterResults({
    searchMode: "breed",
    referenceType: "breed",
    prototypeLabel: 114,
  });
  assert.equal(toyPoodle.status, "results");
  assert.equal(toyPoodle.candidateCount, 6474);
  assert.equal(toyPoodle.dogs[0].profile.petId, "3b0b88ac2");
});

test("Fase C reproduce Top 12 y Top 1 de los escenarios A, B, C, D y G", () => {
  for (const id of requiredScenarioIds) {
    const fixture = scenario(id);
    const actual = resolveScenario(id);
    assert.equal(actual.status, "results", id);
    assert.equal(actual.mode, "similarity", id);
    assert.equal(actual.referenceName, fixture.referenceName, id);
    assert.equal(actual.candidateCount, fixture.candidateCount, id);
    assert.equal(actual.dogs.length, 12, id);
    assert.deepEqual(
      actual.dogs.map((dog) => dog.profile.petId),
      fixture.top20.slice(0, 12).map((result) => result.petId),
      id,
    );
    assert.deepEqual(
      actual.dogs.map((dog) => dog.search.rank),
      Array.from({ length: 12 }, (_, index) => index + 1),
      id,
    );
  }
});

test("el resultado UI mantiene separados perfil permanente y búsqueda actual", () => {
  const actual = resolveScenario("all-golden-retriever");
  assert.equal(actual.status, "results");
  const dog = actual.dogs[0];

  assert.equal(dog.profile.petId, "df2d9957f");
  assert.equal(typeof dog.profile.sourceName, "string");
  assert.equal(typeof dog.profile.displayName, "string");
  assert.equal(typeof dog.profile.ageMonths, "number");
  assert.equal(typeof dog.profile.ageLabel, "string");
  assert.equal(typeof dog.profile.coat, "string");
  assert.ok(Array.isArray(dog.profile.colors));
  assert.equal(typeof dog.profile.health, "string");
  assert.equal(typeof dog.profile.sterilized, "string");
  assert.equal(typeof dog.profile.vaccinated, "string");
  assert.equal(typeof dog.profile.dewormed, "string");
  assert.ok(["Bajo", "Medio", "Alto"].includes(dog.profile.riskLevel));
  assert.equal(typeof dog.profile.riskProbability, "number");
  assert.equal(
    dog.profile.completenessPercent,
    Math.round(dog.profile.completenessIndex * 100),
  );
  assert.deepEqual(Object.keys(dog.search).sort(), ["rank", "similarity", "similarityPercent"]);
  assert.equal(dog.search.similarityPercent, Math.round(dog.search.similarity * 100));
  assert.equal("similarity" in dog.profile, false);
  assert.equal("riskLevel" in dog.search, false);
  assert.equal("completenessIndex" in dog.search, false);
});

test("con menos de 12 candidatos muestra todos y con cero no relaja filtros", () => {
  const few = resolveScenario("few-secondary-breed-shiba-dog");
  assert.equal(few.status, "results");
  assert.equal(few.candidateCount, 1);
  assert.deepEqual(few.dogs.map((dog) => dog.profile.petId), ["269a6756f"]);

  const empty = resolveScenario("zero-candidates-golden-retriever");
  assert.equal(empty.status, "empty");
  assert.equal(empty.candidateCount, 0);
  assert.deepEqual(empty.dogs, []);
});

test("photo y referencias incompletas producen estados controlados", () => {
  assert.deepEqual(resolveAdopterResults({ searchMode: "photo" }), {
    status: "photo-pending",
  });
  assert.deepEqual(resolveAdopterResults({ referenceType: "photo", photoToken: "abc" }), {
    status: "photo-pending",
  });
  assert.deepEqual(resolveAdopterResults({ referenceType: "breed" }), {
    status: "invalid-reference",
  });
  assert.deepEqual(resolveAdopterResults({ prototypeLabel: 125 }), {
    status: "invalid-reference",
  });
  assert.deepEqual(
    resolveAdopterResults({ referenceType: "breed", prototypeLabel: 999 }),
    { status: "invalid-reference" },
  );
});

test("A: Hembra + Akita produce tres perfiles compatibles sin similitud", () => {
  const actual = resolveAdopterResults({ sex: "Hembra", breed: "Akita" });
  assert.equal(actual.status, "results");
  assert.equal(actual.mode, "compatible");
  assert.equal(actual.candidateCount, 3);
  assert.deepEqual(actual.dogs.map((dog) => dog.profile.petId), [
    "5ab4df736",
    "c1ed7562f",
    "cb0e74ef1",
  ]);
  assert.ok(actual.dogs.every((dog) => Object.keys(dog.search).length === 0));
  assert.ok(actual.dogs.every((dog) => dog.profile.sex === "Hembra"));
  assert.ok(actual.dogs.every((dog) => (
    dog.profile.primaryBreed === "Akita" || dog.profile.secondaryBreed === "Akita"
  )));
});

test("B-C: Golden Retriever admite ranking visual o resultados neutros", () => {
  const visual = resolveAdopterResults({
    breed: "Golden Retriever",
    referenceType: "breed",
    prototypeLabel: 125,
  });
  assert.equal(visual.status, "results");
  assert.equal(visual.mode, "similarity");
  assert.ok(visual.dogs.every((dog) => dog.search.similarity !== undefined));

  const compatible = resolveAdopterResults({ breed: "Golden Retriever" });
  assert.equal(compatible.status, "results");
  assert.equal(compatible.mode, "compatible");
  assert.ok(compatible.dogs.every((dog) => dog.search.similarity === undefined));
  assert.ok(compatible.dogs.every((dog) => dog.search.rank === undefined));
});

test("D-E-F: Poodle e Indiferente funcionan con y sin referencia visual", () => {
  const poodle = resolveAdopterResults({ breed: "Poodle" });
  assert.equal(poodle.status, "results");
  assert.equal(poodle.mode, "compatible");
  assert.equal(poodle.candidateCount, 176);
  assert.equal(poodle.dogs.length, 12);

  const indifferent = resolveAdopterResults({ sex: "Hembra", age: "Adulto" });
  assert.equal(indifferent.status, "results");
  assert.equal(indifferent.mode, "compatible");
  assert.equal(indifferent.candidateCount, 412);
  assert.equal(indifferent.dogs.length, 12);

  const shibaVisual = resolveAdopterResults({
    sex: "Hembra",
    age: "Adulto",
    referenceType: "breed",
    prototypeLabel: 0,
  });
  assert.equal(shibaVisual.status, "results");
  assert.equal(shibaVisual.mode, "similarity");
  assert.equal(shibaVisual.candidateCount, 412);
  assert.equal(shibaVisual.dogs.length, 12);
});

test("I-J: el modo neutro conserva cero candidatos y muestra menos de 12", () => {
  const empty = resolveAdopterResults({
    sex: "Hembra",
    size: "Extra grande",
    coat: "Largo",
    health: "Lesión grave",
  });
  assert.equal(empty.status, "empty");
  assert.equal(empty.mode, "compatible");
  assert.equal(empty.candidateCount, 0);
  assert.deepEqual(empty.dogs, []);

  const few = resolveAdopterResults({ breed: "Affenpinscher" });
  assert.equal(few.status, "results");
  assert.equal(few.mode, "compatible");
  assert.equal(few.candidateCount, 1);
  assert.deepEqual(few.dogs.map((dog) => dog.profile.petId), ["269a6756f"]);
});

test("el resumen refleja solo preferencias activas y traduce el color", () => {
  assert.deepEqual(
    createAdopterPreferenceSummary({
      sex: "Hembra",
      size: "Mediano",
      color: "Golden",
      referenceType: "breed",
      prototypeLabel: 125,
    }),
    [
      { label: "Sexo", value: "Hembra" },
      { label: "Tamaño", value: "Mediano" },
      { label: "Color", value: "Dorado" },
    ],
  );
});

test("las 69 fotos controladas existen y conservan el hash validado", async () => {
  const files = (await readdir(photoDirectory)).sort();
  assert.equal(photoCatalog.uniquePhotoCount, 69);
  assert.deepEqual(files, photoCatalog.photos.map((photo) => photo.file).sort());

  for (const photo of photoCatalog.photos) {
    assert.equal(photo.file, `${photo.petId}-1.jpg`);
    const bytes = await readFile(new URL(photo.file, photoDirectory));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), photo.sha256);
  }

  const petIds = photoCatalog.photos.map((photo) => photo.petId);
  assert.equal(new Set(petIds).size, petIds.length, "no debe haber PetID duplicados en el catálogo");

  // "photo-search-external-chihuahua" is a real Method C search (fotografía
  // externa del usuario, no un fixture PetFinder/Tsinghua reconstructible
  // desde query params), así que su cobertura se valida por PetID directo
  // más abajo en lugar de re-ejecutar una búsqueda por query.
  for (const id of photoCatalog.scenarioIds) {
    if (id === "photo-search-external-chihuahua") continue;
    const actual = id === "adult-female-medium-characteristics"
      ? resolveAdopterResults({
          searchMode: "characteristics",
          age: "Adulto",
          sex: "Hembra",
          size: "Mediano",
        })
      : id === "all-chihuahua"
        ? resolveAdopterResults({
            searchMode: "breed",
            referenceType: "breed",
            prototypeLabel: 123,
          })
        : resolveScenario(id);
    assert.equal(actual.status, "results");
    assert.equal(actual.dogs.length, 12);
    assert.ok(actual.dogs.every((dog) => dog.profile.photoUrl));
  }
});

test("Top 12 real de la búsqueda C con fotografía externa de Chihuahua: cobertura local completa", () => {
  // Reproducido el 2026-09-04 enviando la fotografía externa "chi.jpg" al
  // servicio DINOv2 real y ejecutando el motor actual (photoSearch.ts) sin
  // modificarlo; los 6 primeros coinciden exactamente con la comprobación
  // visual de la usuaria (June/Shasha/Tiny/Polo/Poco/Lily, ~72/72/72/72/71/71%).
  const top12 = [
    ["5bf976dd7", "June"],
    ["be3247b2c", "Shasha"],
    ["518e71b74", "Tiny"],
    ["f618c35b8", "Polo"],
    ["83976eb62", "Poco"],
    ["2b6e5343e", "Lily"],
    ["747c82f83", "Lady"],
    ["b47109e90", "Miley"],
    ["71eda06c6", "D6"],
    ["1b0d28fab", "Zone A3 P7"],
    ["485cff597", "Balloon"],
    ["82a97cd8d", "Good Month"],
  ];

  for (const [petId, expectedDisplayName] of top12) {
    const view = resolveAdopterProfileView(petId, {});
    assert.equal(view.status, "found", petId);
    assert.equal(view.dog.profile.displayName, expectedDisplayName, petId);
    assert.ok(view.dog.profile.photoUrl, `${petId} (${expectedDisplayName}) debe tener fotografía local`);
    assert.equal(
      view.dog.profile.photoUrl,
      `/images/petfinder/adoptante/${petId}-1.jpg`,
      petId,
    );
  }
});

test("Chihuahua conserva su Top 12, similitudes y presentación PetFinder", () => {
  const actual = resolveAdopterResults({
    searchMode: "breed",
    referenceType: "breed",
    prototypeLabel: 123,
  });
  assert.equal(actual.status, "results");
  assert.equal(actual.mode, "similarity");
  assert.equal(actual.referenceName, "Chihuahua");
  assert.equal(actual.candidateCount, 6474);
  assert.deepEqual(
    actual.dogs.map((dog) => [dog.profile.petId, dog.search.similarity]),
    [
      ["e0667be3b", 0.7578060324034745],
      ["f477f306f", 0.7279372687273538],
      ["1712ba40e", 0.7075927692807127],
      ["719917454", 0.6888496906840595],
      ["caa16cc3c", 0.6833783090893235],
      ["56b0b72b1", 0.6711819010469067],
      ["43b277272", 0.6634133001035819],
      ["36ab1bdc9", 0.652950980680475],
      ["41e4cc1de", 0.6518449056987701],
      ["3e158c21e", 0.6338482788753286],
      ["5d792dd24", 0.6311413089229817],
      ["2b6e5343e", 0.6260175752415471],
    ],
  );
  assert.equal(actual.dogs[8].profile.breedLabel, "Mestizo");
  assert.ok(actual.dogs.every((dog) => dog.profile.photoUrl));
});

test("el escenario Adulto + Hembra + Mediano conserva orden y presentación de raza", () => {
  const actual = resolveAdopterResults({
    searchMode: "characteristics",
    age: "Adulto",
    sex: "Hembra",
    size: "Mediano",
  });
  assert.equal(actual.status, "results");
  assert.equal(actual.mode, "compatible");
  assert.equal(actual.candidateCount, 209);
  assert.deepEqual(
    actual.dogs.map((dog) => [dog.profile.petId, dog.profile.displayName]),
    [
      ["0143edd0a", "Momo"],
      ["052c95a93", "Gigi"],
      ["060d1de98", "Bebe"],
      ["0636650db", "*Cola*"],
      ["064217ca4", "Brownie"],
      ["069762ec2", "Jimmy"],
      ["079332bdc", "Poodle Female"],
      ["0806f9e3f", "Vero"],
      ["0819ac2f6", "Lucy"],
      ["08bfdc66f", "Beagle Mixed Dog"],
      ["08f40f232", "Abby"],
      ["09807c555", "Lucy"],
    ],
  );
  assert.deepEqual(
    actual.dogs.map((dog) => dog.profile.breedLabel),
    [
      "Poodle",
      "Shih Tzu",
      "Mestizo",
      "Schnauzer",
      "Mestizo",
      "Australian Kelpie",
      "Poodle",
      "Mestizo / Spitz",
      "Beagle",
      "Beagle / Mestizo",
      "Spitz / Mestizo",
      "Mestizo",
    ],
  );
  assert.ok(actual.dogs.every((dog) => Object.keys(dog.search).length === 0));
});
