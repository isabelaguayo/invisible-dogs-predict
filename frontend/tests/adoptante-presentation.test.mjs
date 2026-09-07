import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ADOPTER_PHOTO_OBJECT_POSITION_OVERRIDES,
  DEFAULT_ADOPTER_PHOTO_OBJECT_POSITION,
  presentPetfinderName,
} from "../src/lib/adoptante/presentation.ts";
import { resolveAdopterResults } from "../src/lib/adoptante/results.ts";

const serverDataDirectory = new URL("../server-data/adoptante/", import.meta.url);
const petfinderProfiles = JSON.parse(
  await readFile(new URL("petfinderProfiles.v1.json", serverDataDirectory), "utf8"),
);
const profileByPetId = new Map(petfinderProfiles.map((profile) => [profile.petId, profile]));

test("presentPetfinderName: nombres personales inequívocos permanecen intactos", () => {
  assert.equal(presentPetfinderName("Nick", "e0667be3b"), "Nick");
  assert.equal(presentPetfinderName("Puppy", "1712ba40e"), "Puppy");
  assert.equal(presentPetfinderName("Hugo", "56b0b72b1"), "Hugo");
  assert.equal(presentPetfinderName("GIRo", "36ab1bdc9"), "GIRo");
  assert.equal(presentPetfinderName("Patch", "41e4cc1de"), "Patch");
  assert.equal(presentPetfinderName("Jerry", "3e158c21e"), "Jerry");
  assert.equal(presentPetfinderName("Lily", "2b6e5343e"), "Lily");
});

test("presentPetfinderName: extrae el nombre entre comillas/apóstrofos del título del anuncio", () => {
  assert.equal(
    presentPetfinderName('"Pumpkin" - Applehead Chihuahua', "f477f306f"),
    "Pumpkin",
  );
  assert.equal(
    presentPetfinderName("'Mango' Small Apple Head Chihuahua", "719917454"),
    "Mango",
  );
});

test("presentPetfinderName: nunca inventa un nombre a partir de una descripción", () => {
  assert.equal(
    presentPetfinderName("Adult Smooth Coat Chihuahua Female", "caa16cc3c"),
    "Sin nombre",
  );
});

test("presentPetfinderName: valores vacíos o ausentes producen Sin nombre", () => {
  assert.equal(presentPetfinderName("", "5d792dd24"), "Sin nombre");
  assert.equal(presentPetfinderName("   ", "5d792dd24"), "Sin nombre");
  assert.equal(presentPetfinderName(null, "5d792dd24"), "Sin nombre");
  assert.equal(presentPetfinderName(undefined, "5d792dd24"), "Sin nombre");
  assert.equal(presentPetfinderName("Sin nombre", "5d792dd24"), "Sin nombre");
});

test("presentPetfinderName: Chibi recupera ちび solo mediante una reconstrucción de bytes verificable", () => {
  const sourceName = profileByPetId.get("43b277272").name;
  assert.equal([...sourceName].length, 12, "el valor fuente incluye 2 bytes de control C1 invisibles");

  const suffix = sourceName.slice("Chibi ".length);
  const bytesFromMisreadLatin1 = Buffer.from(suffix, "latin1");
  const recovered = bytesFromMisreadLatin1.toString("utf8");
  assert.equal(recovered, "ちび");

  const forwardBytes = Buffer.from("ちび", "utf8");
  assert.equal(forwardBytes.toString("latin1"), suffix);

  assert.equal(presentPetfinderName(sourceName, "43b277272"), `Chibi ${recovered}`);
});

test("presentPetfinderName: un override solo se aplica si el valor fuente coincide exactamente", () => {
  assert.equal(presentPetfinderName("Pumpkin", "f477f306f"), "Pumpkin");
  assert.equal(
    presentPetfinderName('"Pumpkin" - Applehead Chihuahua', "unknown-pet-id"),
    '"Pumpkin" - Applehead Chihuahua',
  );
});

test("sourceName permanece intacto en los resultados aunque displayName cambie", () => {
  const chihuahua = resolveAdopterResults({
    searchMode: "breed",
    referenceType: "breed",
    prototypeLabel: 123,
  });
  assert.equal(chihuahua.status, "results");

  const expectedSourceNames = new Map([
    ["e0667be3b", "Nick"],
    ["f477f306f", '"Pumpkin" - Applehead Chihuahua'],
    ["1712ba40e", "Puppy"],
    ["719917454", "'Mango' Small Apple Head Chihuahua"],
    ["caa16cc3c", "Adult Smooth Coat Chihuahua Female"],
    ["56b0b72b1", "Hugo"],
    ["43b277272", profileByPetId.get("43b277272").name],
    ["36ab1bdc9", "GIRo"],
    ["41e4cc1de", "Patch"],
    ["3e158c21e", "Jerry"],
    ["5d792dd24", "Sin nombre"],
    ["2b6e5343e", "Lily"],
  ]);

  for (const dog of chihuahua.dogs) {
    assert.equal(dog.profile.sourceName, expectedSourceNames.get(dog.profile.petId));
    assert.equal(dog.profile.sourceName, profileByPetId.get(dog.profile.petId).name);
  }

  const expectedDisplayNames = new Map([
    ["e0667be3b", "Nick"],
    ["f477f306f", "Pumpkin"],
    ["1712ba40e", "Puppy"],
    ["719917454", "Mango"],
    ["caa16cc3c", "Sin nombre"],
    ["56b0b72b1", "Hugo"],
    ["43b277272", "Chibi ちび"],
    ["36ab1bdc9", "GIRo"],
    ["41e4cc1de", "Patch"],
    ["3e158c21e", "Jerry"],
    ["5d792dd24", "Sin nombre"],
    ["2b6e5343e", "Lily"],
  ]);

  for (const dog of chihuahua.dogs) {
    assert.equal(dog.profile.displayName, expectedDisplayNames.get(dog.profile.petId));
  }
});

test("un mismo PetID produce el mismo displayName en método A (compatible) y método B (similitud)", () => {
  const sharedPetIds = ["f477f306f", "43b277272"];

  const similarity = resolveAdopterResults({
    searchMode: "breed",
    referenceType: "breed",
    prototypeLabel: 123,
  });
  const similarityByPetId = new Map(
    similarity.dogs.map((dog) => [dog.profile.petId, dog.profile.displayName]),
  );
  for (const petId of sharedPetIds) {
    assert.ok(similarityByPetId.has(petId), `${petId} debe aparecer en el Top 12 de Chihuahua`);
  }

  const compatible = resolveAdopterResults({ searchMode: "characteristics", breed: "Chihuahua" });
  assert.equal(compatible.status, "results");
  assert.equal(compatible.mode, "compatible");

  for (const petId of sharedPetIds) {
    const compatibleDog = compatible.dogs.find((dog) => dog.profile.petId === petId);
    if (!compatibleDog) continue;
    assert.equal(compatibleDog.profile.displayName, similarityByPetId.get(petId));
  }

  assert.equal(
    presentPetfinderName(profileByPetId.get("f477f306f").name, "f477f306f"),
    similarityByPetId.get("f477f306f"),
  );
  assert.equal(
    presentPetfinderName(profileByPetId.get("43b277272").name, "43b277272"),
    similarityByPetId.get("43b277272"),
  );
});

test("los overrides de encuadre solo referencian PetID reales y usan porcentajes CSS válidos", () => {
  const objectPositionPattern = /^\d{1,3}% \d{1,3}%$/;
  for (const [petId, objectPosition] of Object.entries(ADOPTER_PHOTO_OBJECT_POSITION_OVERRIDES)) {
    assert.ok(profileByPetId.has(petId), `${petId} no existe en el catálogo PetFinder`);
    assert.match(objectPosition, objectPositionPattern, `valor inválido para ${petId}`);
  }
  assert.match(DEFAULT_ADOPTER_PHOTO_OBJECT_POSITION, objectPositionPattern);
});

test("el encuadre no altera la ruta de imagen, el PetID ni el archivo original", () => {
  const chihuahua = resolveAdopterResults({
    searchMode: "breed",
    referenceType: "breed",
    prototypeLabel: 123,
  });
  for (const dog of chihuahua.dogs) {
    const override = ADOPTER_PHOTO_OBJECT_POSITION_OVERRIDES[dog.profile.petId];
    assert.equal(
      dog.profile.objectPosition,
      override ?? DEFAULT_ADOPTER_PHOTO_OBJECT_POSITION,
    );
    if (dog.profile.photoUrl) {
      assert.equal(dog.profile.photoUrl, `/images/petfinder/adoptante/${dog.profile.primaryImageFile}`);
    }
  }
});
