import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  PhotoSearchValidationError,
  searchAdopterByPhotoEmbedding,
} from "../src/lib/adoptante/photoSearch.ts";

const serverDataDirectory = new URL("../server-data/adoptante/", import.meta.url);
const petfinderProfiles = JSON.parse(
  await readFile(new URL("petfinderProfiles.v1.json", serverDataDirectory), "utf8"),
);
const manifest = JSON.parse(
  await readFile(new URL("petfinderDinov2Manifest.v1.json", serverDataDirectory), "utf8"),
);
const embeddingsBuffer = await readFile(new URL(manifest.file, serverDataDirectory));
const DIMENSION = manifest.dimension;

function embeddingForPetId(petId) {
  const rowIndex = petfinderProfiles.findIndex((profile) => profile.petId === petId);
  assert.ok(rowIndex !== -1, `${petId} must exist in petfinderProfiles.v1.json`);
  const floatOffset = rowIndex * DIMENSION * 4;
  const floats = new Float32Array(
    embeddingsBuffer.buffer,
    embeddingsBuffer.byteOffset + floatOffset,
    DIMENSION,
  );
  return Array.from(floats);
}

function normalizedRandomEmbedding(seed) {
  let state = seed;
  const random = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  const raw = Array.from({ length: DIMENSION }, () => random() - 0.5);
  const norm = Math.sqrt(raw.reduce((sum, value) => sum + value * value, 0));
  return raw.map((value) => value / norm);
}

test("un embedding con dimensión distinta de 384 se rechaza", () => {
  assert.throws(
    () => searchAdopterByPhotoEmbedding(new Array(383).fill(0.05)),
    PhotoSearchValidationError,
  );
  assert.throws(
    () => searchAdopterByPhotoEmbedding(new Array(385).fill(0.05)),
    PhotoSearchValidationError,
  );
});

test("un embedding con NaN o Infinity se rechaza", () => {
  const withNaN = normalizedRandomEmbedding(1);
  withNaN[10] = NaN;
  assert.throws(() => searchAdopterByPhotoEmbedding(withNaN), PhotoSearchValidationError);

  const withInfinity = normalizedRandomEmbedding(2);
  withInfinity[20] = Infinity;
  assert.throws(() => searchAdopterByPhotoEmbedding(withInfinity), PhotoSearchValidationError);
});

test("un embedding no normalizado (norma muy distinta de 1) se rechaza", () => {
  const unnormalized = new Array(DIMENSION).fill(1); // norm = sqrt(384) ~= 19.6
  assert.throws(() => searchAdopterByPhotoEmbedding(unnormalized), PhotoSearchValidationError);
});

test("un embedding válido produce Top 12 ordenado por similarity descendente con desempate por PetID", () => {
  const response = searchAdopterByPhotoEmbedding(normalizedRandomEmbedding(42));
  assert.equal(response.mode, "similarity");
  assert.equal(response.referenceType, "photo");
  assert.equal(response.candidateCount, 6474);
  assert.equal(response.results.length, 12);

  for (let i = 0; i < response.results.length; i += 1) {
    assert.equal(response.results[i].rank, i + 1);
    assert.equal(typeof response.results[i].similarity, "number");
    assert.ok(Number.isFinite(response.results[i].similarity));
  }

  for (let i = 1; i < response.results.length; i += 1) {
    const previous = response.results[i - 1];
    const current = response.results[i];
    assert.ok(
      previous.similarity > current.similarity
      || (previous.similarity === current.similarity && previous.petId < current.petId),
      "el orden debe ser similarity descendente y, en empate, PetID ascendente",
    );
  }
});

test("la respuesta no incluye riesgo, completitud ni ninguna referencia a Tsinghua", () => {
  const response = searchAdopterByPhotoEmbedding(normalizedRandomEmbedding(7));
  const responseKeys = Object.keys(response);
  assert.deepEqual(responseKeys.sort(), ["candidateCount", "mode", "referenceType", "results"]);
  for (const result of response.results) {
    const resultKeys = Object.keys(result).sort();
    assert.deepEqual(resultKeys, ["petId", "profileIndex", "rank", "similarity", "sourceEmbeddingIndex"]);
  }
  assert.ok(!("prototypeLabel" in response));
  assert.ok(!("prototypeName" in response));
});

test("self-match del motor TypeScript: el embedding PetFinder de un perfil se reconoce a sí mismo", () => {
  const nickEmbedding = embeddingForPetId("e0667be3b");
  const response = searchAdopterByPhotoEmbedding(nickEmbedding);
  assert.equal(response.results[0].petId, "e0667be3b");
  assert.equal(response.results[0].rank, 1);
  assert.ok(
    Math.abs(response.results[0].similarity - 1) < 0.001,
    `similarity contra sí mismo debería ser ~1, fue ${response.results[0].similarity}`,
  );
});

test("self-match también funciona para el embedding de Momo (escenario A) y df2d9957f (Golden Retriever)", () => {
  for (const petId of ["0143edd0a", "df2d9957f"]) {
    const embedding = embeddingForPetId(petId);
    const response = searchAdopterByPhotoEmbedding(embedding);
    assert.equal(response.results[0].petId, petId, `self-match falló para ${petId}`);
    assert.ok(Math.abs(response.results[0].similarity - 1) < 0.001);
  }
});
