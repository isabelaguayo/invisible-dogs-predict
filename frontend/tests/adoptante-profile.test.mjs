import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolveAdopterProfileView } from "../src/lib/adoptante/profile.ts";
import { buildAdopterProfileSummary } from "../src/lib/adoptante/presentation.ts";
import { createAdopterHref, parseAdopterSearchRecord } from "../src/lib/adoptante/query.ts";
import { resolveAdopterResults } from "../src/lib/adoptante/results.ts";

const serverDataDirectory = new URL("../server-data/adoptante/", import.meta.url);
const petfinderProfiles = JSON.parse(
  await readFile(new URL("petfinderProfiles.v1.json", serverDataDirectory), "utf8"),
);
const profileByPetId = new Map(petfinderProfiles.map((profile) => [profile.petId, profile]));

// A. Valid PetID -> real profile.
test("A: un PetID válido resuelve una ficha real con datos PetFinder", () => {
  const view = resolveAdopterProfileView("e0667be3b", {});
  assert.equal(view.status, "found");
  assert.equal(view.dog.profile.petId, "e0667be3b");
  assert.equal(view.dog.profile.sourceName, "Nick");
  assert.equal(view.dog.profile.displayName, "Nick");
});

// B. Invalid PetID -> not-found (page must call notFound()).
test("B: un PetID inexistente entre los 6.474 perfiles produce not-found", () => {
  const view = resolveAdopterProfileView("no-existe-este-petid", {});
  assert.equal(view.status, "not-found");
});

// C. Nick desde Chihuahua -> misma similarity/rank que resultados.
test("C: Nick abierto desde la búsqueda B de Chihuahua reproduce la similarity exacta de resultados", () => {
  const resultsView = resolveAdopterResults({
    searchMode: "breed",
    referenceType: "breed",
    prototypeLabel: 123,
  });
  assert.equal(resultsView.status, "results");
  const cardDog = resultsView.dogs.find((dog) => dog.profile.petId === "e0667be3b");
  assert.ok(cardDog, "Nick debe estar en el Top 12 de Chihuahua");

  const profileView = resolveAdopterProfileView("e0667be3b", {
    searchMode: "breed",
    referenceType: "breed",
    prototypeLabel: 123,
  });
  assert.equal(profileView.status, "found");
  assert.equal(profileView.context.kind, "breed");
  assert.equal(profileView.context.referenceName, "Chihuahua");
  assert.equal(profileView.context.similarity, cardDog.search.similarity);
  assert.equal(profileView.context.rank, cardDog.search.rank);
  assert.equal(profileView.context.similarity, 0.7578060324034745);
  assert.equal(profileView.context.rank, 1);
  assert.equal(profileView.dog.search.similarity, cardDog.search.similarity);
  assert.equal(profileView.dog.search.rank, cardDog.search.rank);
});

// D. Nick directo, sin query -> sin similarity, sin contexto.
test("D: Nick sin query no muestra similarity, filtros ni referencia visual", () => {
  const view = resolveAdopterProfileView("e0667be3b", {});
  assert.equal(view.status, "found");
  assert.equal(view.context.kind, "none");
  assert.deepEqual(view.dog.search, {});
});

// E. Momo desde características -> filtros correctos, sin similarity.
test("E: Momo abierto desde características muestra los filtros activos y ninguna similarity", () => {
  const view = resolveAdopterProfileView("0143edd0a", {
    searchMode: "characteristics",
    age: "Adulto",
    sex: "Hembra",
    size: "Mediano",
  });
  assert.equal(view.status, "found");
  assert.equal(view.context.kind, "characteristics");
  assert.deepEqual(view.context.preferences, [
    { label: "Edad", value: "Adulto" },
    { label: "Sexo", value: "Hembra" },
    { label: "Tamaño", value: "Mediano" },
  ]);
  assert.deepEqual(view.dog.search, {});

  const resultsView = resolveAdopterResults({
    searchMode: "characteristics",
    age: "Adulto",
    sex: "Hembra",
    size: "Mediano",
  });
  assert.equal(resultsView.candidateCount, 209);
  assert.ok(resultsView.dogs.some((dog) => dog.profile.petId === "0143edd0a"));
});

// F. Contexto inconsistente -> no afirmar compatibilidad ni similarity.
test("F: un contexto de búsqueda que Nick no cumple no se presenta como compatible", () => {
  // Nick is Macho; a Hembra filter is a valid but mismatched characteristics context.
  const view = resolveAdopterProfileView("e0667be3b", {
    searchMode: "characteristics",
    sex: "Hembra",
  });
  assert.equal(view.status, "found");
  assert.equal(view.context.kind, "inconsistent");
  assert.deepEqual(view.dog.search, {});
});

test("F: una referencia de raza válida que no incluye al perfil entre los candidatos también es inconsistente", () => {
  // Nick's breed is Chihuahua but combining an unrelated breed filter with the
  // (implicit, filters-preserving) breed reference excludes him from candidates.
  const view = resolveAdopterProfileView("e0667be3b", {
    breed: "Poodle",
    referenceType: "breed",
    prototypeLabel: 123,
  });
  assert.equal(view.status, "found");
  assert.equal(view.context.kind, "inconsistent");
  assert.deepEqual(view.dog.search, {});
});

// G. displayName ya validado, reutilizado tal cual en la ficha.
test("G: displayName en la ficha coincide con la capa de presentación ya validada", () => {
  const pumpkin = resolveAdopterProfileView("f477f306f", {});
  assert.equal(pumpkin.status, "found");
  assert.equal(pumpkin.dog.profile.sourceName, '"Pumpkin" - Applehead Chihuahua');
  assert.equal(pumpkin.dog.profile.displayName, "Pumpkin");

  const chibi = resolveAdopterProfileView("43b277272", {});
  assert.equal(chibi.status, "found");
  assert.equal(chibi.dog.profile.sourceName, profileByPetId.get("43b277272").name);
  assert.equal(chibi.dog.profile.displayName, "Chibi ちび");
});

// H. Mixed Breed -> Mestizo, ya reutilizado desde presentation.ts.
test("H: la raza registrada usa la presentación ya aprobada (Mixed Breed -> Mestizo)", () => {
  const abby = resolveAdopterProfileView("08f40f232", {});
  assert.equal(abby.status, "found");
  assert.equal(abby.dog.profile.primaryBreed, "Spitz");
  assert.equal(abby.dog.profile.secondaryBreed, "Mixed Breed");
  assert.equal(abby.dog.profile.breedLabel, "Spitz / Mestizo");
});

// I. "No" y "No consta" deben seguir siendo valores distintos.
test('I: "No" y "No consta" permanecen como valores distintos en la ficha', () => {
  const withNo = resolveAdopterProfileView("850a43f90", {});
  const withNoConsta = resolveAdopterProfileView("c02be41e6", {});
  assert.equal(withNo.status, "found");
  assert.equal(withNoConsta.status, "found");
  assert.equal(withNo.dog.profile.vaccinated, "No");
  assert.equal(withNoConsta.dog.profile.vaccinated, "No consta");
  assert.notEqual(withNo.dog.profile.vaccinated, withNoConsta.dog.profile.vaccinated);
});

// J. Foto local existente.
test("J: un PetID con fotografía local expone photoUrl", () => {
  const view = resolveAdopterProfileView("e0667be3b", {});
  assert.equal(view.status, "found");
  assert.equal(view.dog.profile.photoUrl, "/images/petfinder/adoptante/e0667be3b-1.jpg");
});

// K. Foto no disponible localmente -> sin photoUrl (placeholder en la UI).
test("K: un PetID válido sin fotografía local no expone photoUrl", () => {
  const view = resolveAdopterProfileView("3422e4906", {});
  assert.equal(view.status, "found");
  assert.equal(view.dog.profile.photoUrl, undefined);
});

// L. "Volver a resultados" conserva la query exacta.
test('L: el href de "Volver a resultados" reconstruye la misma búsqueda que originó la ficha', () => {
  const originalHref = "/adoptante/resultados?v=1&mode=breed&reference=breed&prototype=123";
  const [, queryString] = originalHref.split("?");
  const state = parseAdopterSearchRecord(Object.fromEntries(new URLSearchParams(queryString)));
  const rebuiltHref = createAdopterHref("/adoptante/resultados", state);
  assert.equal(rebuiltHref, originalHref);

  const profileHref = createAdopterHref("/adoptante/perro/e0667be3b", state);
  assert.equal(profileHref, "/adoptante/perro/e0667be3b?v=1&mode=breed&reference=breed&prototype=123");
});

// M/N. El resumen estructurado no expone Description cruda ni texto en inglés.
test("M: el artefacto de perfiles no incluye el campo Description crudo", () => {
  for (const key of Object.keys(petfinderProfiles[0])) {
    assert.notEqual(key, "Description");
  }
});

test("N: el resumen estructurado se construye solo a partir de campos ya traducidos", () => {
  const momo = resolveAdopterProfileView("0143edd0a", {});
  assert.equal(momo.status, "found");
  const summary = buildAdopterProfileSummary(momo.dog.profile);
  assert.equal(
    summary,
    "Momo es una hembra, de 7 años, tamaño mediano y pelo medio. Su ficha registra la raza Poodle y consta como saludable.",
  );
  assert.ok(!summary.includes("estado de salud saludable"), "no debe repetir \"salud\" de forma redundante");
  // No English PetFinder vocabulary leaks into the deterministic summary.
  for (const englishWord of ["Female", "Male", "Mixed", "Breed", "Dog", "Puppy", "Adult"]) {
    assert.ok(!summary.includes(englishWord), `"${englishWord}" no debería aparecer en el resumen`);
  }
});

// O. Sin score combinado en el contexto de la ficha.
test("O: el contexto de la ficha nunca combina similarity, riesgo y completitud en una puntuación", () => {
  const view = resolveAdopterProfileView("e0667be3b", {
    searchMode: "breed",
    referenceType: "breed",
    prototypeLabel: 123,
  });
  assert.equal(view.status, "found");
  assert.equal(view.context.kind, "breed");
  assert.ok(!("score" in view.context));
  assert.ok(!("matchScore" in view.dog));
  assert.ok(!("priority" in view.dog));
});

test("acceso directo a un PetID de un perfil sin candidatos posibles para su propio contexto no lo declara compatible", () => {
  const empty = resolveAdopterProfileView("e0667be3b", {
    searchMode: "characteristics",
    size: "Extra grande",
    coat: "Largo",
    health: "Lesión grave",
  });
  assert.equal(empty.status, "found");
  assert.equal(empty.context.kind, "inconsistent");
});
