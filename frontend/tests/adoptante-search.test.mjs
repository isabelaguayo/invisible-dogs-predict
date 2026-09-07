import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  AdopterSearchValidationError,
  getAdopterSearchDiagnostics,
  searchAdopterByBreed,
} from "../src/lib/adoptante/search.ts";

const fixturesDirectory = new URL("./fixtures/", import.meta.url);
const serverDataDirectory = new URL("../server-data/adoptante/", import.meta.url);
const golden = JSON.parse(
  await readFile(new URL("adopter-search-golden.v1.json", fixturesDirectory), "utf8"),
);
const petfinderManifest = JSON.parse(
  await readFile(new URL("petfinderDinov2Manifest.v1.json", serverDataDirectory), "utf8"),
);
const prototypeManifest = JSON.parse(
  await readFile(new URL("tsinghuaPrototypeManifest.v1.json", serverDataDirectory), "utf8"),
);

async function fileSha256(url) {
  const contents = await readFile(url);
  return createHash("sha256").update(contents).digest("hex");
}

test("los binarios coinciden con tamaños y hashes de sus manifiestos", async () => {
  const petfinderUrl = new URL(petfinderManifest.file, serverDataDirectory);
  const prototypeUrl = new URL(prototypeManifest.file, serverDataDirectory);
  const petfinderBytes = await readFile(petfinderUrl);
  const prototypeBytes = await readFile(prototypeUrl);

  assert.equal(petfinderBytes.byteLength, 6474 * 384 * 4);
  assert.equal(prototypeBytes.byteLength, 130 * 384 * 4);
  assert.equal(await fileSha256(petfinderUrl), petfinderManifest.artifactSha256);
  assert.equal(await fileSha256(prototypeUrl), prototypeManifest.artifactSha256);
});

test("TypeScript reproduce exactamente los Top 20 dorados de Python", () => {
  let maximumObservedDifference = 0;

  for (const scenario of golden.scenarios) {
    const actual = searchAdopterByBreed(
      {
        ...scenario.state,
        referenceType: "breed",
        prototypeLabel: scenario.prototypeLabel,
      },
      { limit: 20 },
    );

    assert.equal(actual.candidateCount, scenario.candidateCount, scenario.id);
    assert.deepEqual(
      actual.results.map((result) => result.petId),
      scenario.top20.map((result) => result.petId),
      scenario.id,
    );
    assert.deepEqual(
      actual.results.map((result) => result.rank),
      scenario.top20.map((result) => result.rank),
      scenario.id,
    );

    for (let index = 0; index < actual.results.length; index += 1) {
      const difference = Math.abs(
        actual.results[index].similarity - scenario.top20[index].similarity,
      );
      maximumObservedDifference = Math.max(maximumObservedDifference, difference);
      assert.ok(difference <= golden.numericTolerance, `${scenario.id}: ${difference}`);
    }
  }

  console.log(`maximum Python/TypeScript similarity difference: ${maximumObservedDifference}`);
  assert.equal(getAdopterSearchDiagnostics().artifactLoadCount, 1);
});

test("el caso sin candidatos es válido y no relaja filtros", () => {
  const result = searchAdopterByBreed(
    {
      sex: "Hembra",
      size: "Extra grande",
      coat: "Largo",
      health: "Lesión grave",
      referenceType: "breed",
      prototypeLabel: 125,
    },
    { limit: 20 },
  );
  assert.equal(result.candidateCount, 0);
  assert.deepEqual(result.results, []);
});

test("valida referenceType, prototypeLabel y limit", () => {
  assert.throws(
    () => searchAdopterByBreed({ referenceType: "photo" }),
    AdopterSearchValidationError,
  );
  assert.throws(
    () => searchAdopterByBreed({ referenceType: "breed", prototypeLabel: 999 }),
    AdopterSearchValidationError,
  );
  assert.throws(
    () => searchAdopterByBreed(
      { referenceType: "breed", prototypeLabel: 125 },
      { limit: -1 },
    ),
    AdopterSearchValidationError,
  );
});

test("Golden Retriever y Poodle resuelven labels independientes", () => {
  assert.deepEqual(golden.goldenRetriever, {
    label: 125,
    prototypeRow: 125,
    technicalName: "golden-retriever",
  });
  assert.deepEqual(golden.poodleVariants, {
    "Miniature Poodle": 6,
    "Toy Poodle": 114,
    "Standard Poodle": 116,
  });
});
