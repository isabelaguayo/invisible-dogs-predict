import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { filterAdopterProfiles } from "../src/lib/adoptante/filters.ts";

const profiles = JSON.parse(
  await readFile(
    new URL("../server-data/adoptante/petfinderProfiles.v1.json", import.meta.url),
    "utf8",
  ),
);

function filtered(preferences) {
  return filterAdopterProfiles(profiles, preferences);
}

test("A: Indiferente conserva los 6.474 perfiles", () => {
  assert.equal(filtered({}).length, 6474);
});

test("B-H: cada filtro real reproduce los recuentos validados", () => {
  assert.equal(filtered({ sex: "Hembra" }).length, 3740);
  assert.equal(filtered({ size: "Mediano" }).length, 4867);
  assert.equal(filtered({ coat: "Largo" }).length, 339);
  assert.equal(filtered({ health: "Saludable" }).length, 6230);
  assert.equal(filtered({ sterilized: "Sí" }).length, 1641);
  assert.equal(filtered({ vaccinated: "Sí" }).length, 3386);
  assert.equal(filtered({ dewormed: "Sí" }).length, 4181);
});

test("I: combina varios filtros con AND", () => {
  assert.equal(
    filtered({
      sex: "Hembra",
      size: "Mediano",
      coat: "Largo",
      health: "Saludable",
      vaccinated: "Sí",
    }).length,
    45,
  );
});

test("cero resultados devuelve una colección vacía", () => {
  assert.equal(
    filtered({
      sex: "Hembra",
      size: "Extra grande",
      coat: "Largo",
      health: "Lesión grave",
    }).length,
    0,
  );
});

test("J: la raza coincide también con raza secundaria", () => {
  const matches = filtered({ breed: "Affenpinscher" });
  assert.equal(matches.length, 1);
  assert.equal(matches[0].primaryBreed === "Affenpinscher", false);
  assert.equal(matches[0].secondaryBreed, "Affenpinscher");
});

test("K: el color coincide en cualquiera de los tres campos fuente", () => {
  const matches = filtered({ color: "Brown" });
  assert.equal(matches.length, 3807);
  assert.equal(matches.some((profile) => profile.colors.indexOf("Brown") > 0), true);
});

test("No y No consta permanecen como estados distintos", () => {
  assert.equal(filtered({ sterilized: "No" }).length, 4024);
  assert.equal(filtered({ sterilized: "No consta" }).length, 809);
});

test("L: Age=0 solo permanece cuando la edad es Indiferente", () => {
  assert.equal(filtered({}).filter((profile) => profile.ageMonths === 0).length, 41);

  const ageCounts = {
    Cachorro: 4309,
    Joven: 1157,
    Adulto: 870,
    Senior: 97,
  };

  for (const [age, expected] of Object.entries(ageCounts)) {
    const matches = filtered({ age });
    assert.equal(matches.length, expected);
    assert.equal(matches.some((profile) => profile.ageMonths === 0), false);
  }
});
