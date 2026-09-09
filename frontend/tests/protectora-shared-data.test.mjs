import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { adopterProfiles, adopterPetfinderEmbeddingManifest, adopterTsinghuaPrototypeManifest } from "../src/lib/adoptante/artifacts.ts";
import { PROTECTORA_PETFINDER_PROFILES } from "../src/data/protectoraPetfinderProfiles.ts";
import { createAdopterDogResult } from "../src/lib/adoptante/presentation.ts";
import { tfmResults, austinTestCount, austinTopTen } from "../src/lib/tfm/results.ts";
import { getPetfinderHistoricalDescription } from "../src/lib/tfm/descriptions.ts";
import { getFilteredAdopterResults } from "../src/lib/adoptante/compatibleResults.ts";

test("Protectora and Adoptante share historical identity, risk, completeness and available photos", () => {
  for (const dog of PROTECTORA_PETFINDER_PROFILES) {
    const source = adopterProfiles.find((profile) => profile.petId === dog.id);
    assert.ok(source);
    const result = createAdopterDogResult(source);
    assert.equal(dog.name, source.name);
    assert.equal(dog.risk, result.profile.riskLevel);
    assert.equal(dog.source.prob_adopcion_lenta_petfinder_final, result.profile.riskProbability);
    assert.equal(dog.completeness, result.profile.completenessPercent);
    assert.equal(dog.age, result.profile.ageLabel);
    assert.equal(result.profile.photoUrl, dog.imagePath);
    const bytes = readFileSync(new URL(`../public${result.profile.photoUrl}`, import.meta.url));
    assert.equal(bytes.readUInt16BE(0), 0xffd8);
    assert.equal(result.search.similarity, undefined);
  }
});

test("Austin metrics retain the scientific test cohort and do not become PetFinder risks", () => {
  assert.equal(tfmResults.commit, "1fe0bcff9a1fa13b86f5d028b05a526f839b6aef");
  assert.equal(tfmResults.branch, "documentacion-tfm");
  assert.equal(austinTestCount, 18752);
  assert.equal(tfmResults.austin.metrics.roc_auc, "0.8593");
  assert.equal(austinTopTen.precision_topk, "0.6103");
  assert.equal(tfmResults.petfinder.metrics.roc_auc, "0.7384");
  assert.equal(tfmResults.tsinghua.n_razas, 130);
  assert.equal(tfmResults.tsinghua.dimension_embedding, 384);
  const source = readFileSync(new URL("../../outputs/interpretability/metricas_invisible_dog_score_test.csv", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const [header, row] = source.trim().split("\n");
  assert.deepEqual(tfmResults.austin.metrics, Object.fromEntries(header.split(",").map((key, i) => [key, row.split(",")[i]])));
});

test("original descriptions cover the historical catalog and retain the packaged checksum", () => {
  const bytes = readFileSync(new URL("../server-data/tfm/petfinderDescriptions.v1.json", import.meta.url));
  const expected = tfmResults.sources["frontend/server-data/tfm/petfinderDescriptions.v1.json"].sha256;
  assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
  assert.equal(Object.keys(JSON.parse(bytes)).length, adopterProfiles.length);
  assert.match(getPetfinderHistoricalDescription("485bebd4f"), /Introducing Sophie/);
  assert.equal(getPetfinderHistoricalDescription("not-a-profile"), undefined);
  for (const dog of PROTECTORA_PETFINDER_PROFILES) {
    assert.equal(dog.source.Description, getPetfinderHistoricalDescription(dog.id));
  }
});

test("all twelve initial characteristics results have their actual source photo", () => {
  for (const profile of getFilteredAdopterResults({}, { limit: 12 }).profiles) {
    const dog = createAdopterDogResult(profile);
    const source = tfmResults.additionalPhotos[profile.petId];
    assert.equal(dog.profile.photoUrl, source.url);
    const bytes = readFileSync(new URL(`../public${source.url}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
    assert.equal(bytes.readUInt16BE(0), 0xffd8);
    assert.equal(source.source, `data/raw_petfinder/train_images/${profile.petId}-1.jpg`);
  }
});

test("existing scientific binary artifacts and profile row order retain their recorded checksums", () => {
  for (const manifest of [adopterPetfinderEmbeddingManifest, adopterTsinghuaPrototypeManifest]) {
    const bytes = readFileSync(new URL(`../server-data/adoptante/${manifest.file}`, import.meta.url));
    assert.equal(bytes.length, manifest.byteLength);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), manifest.artifactSha256);
  }
  const bytes = readFileSync(new URL("../server-data/adoptante/petfinderProfiles.v1.json", import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), adopterPetfinderEmbeddingManifest.profilesArtifactSha256);
  assert.equal(new Set(adopterProfiles.map((profile) => profile.petId)).size, adopterProfiles.length);
});
