import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getProtectoraRiskExplanation } from "../src/lib/protectora/explanations.ts";
import { PROTECTORA_PETFINDER_PROFILES } from "../src/data/protectoraPetfinderProfiles.ts";

const contractRaw = await readFile(
  new URL("../server-data/protectora/petfinderProtectoraExplanations.v2.json", import.meta.url),
  "utf8",
);
const pageSource = await readFile(
  new URL("../src/app/protectora/perro/[id]/page.tsx", import.meta.url),
  "utf8",
);
const cssSource = await readFile(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);

const EXPECTED = [
  ["485bebd4f", "Sophie", "Alto"],
  ["a9085cdde", "Tom", "Alto"],
  ["c3a2d4d83", "Hawk", "Medio"],
  ["ad2423b1f", "Cindi", "Medio"],
  ["fff4a6420", "Zander", "Bajo"],
  ["c749028bb", "Koldie", "Bajo"],
];

// A: 6 PetID tienen explicación.
test("A: los 6 PetID de la demo tienen explicación de riesgo", () => {
  for (const [petId] of EXPECTED) {
    const explanation = getProtectoraRiskExplanation(petId);
    assert.ok(explanation, `${petId} debe tener explicación`);
  }
});

// B/C: máximo 3 factores por dirección.
test("B/C: nunca más de 3 factores por dirección, para ningún perfil", () => {
  for (const [petId] of EXPECTED) {
    const explanation = getProtectoraRiskExplanation(petId);
    assert.ok(explanation.increases.length <= 3, `${petId} increases <= 3`);
    assert.ok(explanation.decreases.length <= 3, `${petId} decreases <= 3`);
    assert.ok(explanation.increases.length >= 1, `${petId} debe tener al menos 1 factor real que aumente`);
    assert.ok(explanation.decreases.length >= 1, `${petId} debe tener al menos 1 factor real que reduzca`);
  }
});

// D: ningún concepto duplicado (mismo label repetido dentro de la misma dirección).
test("D: ningún concepto/etiqueta se repite dentro de la misma dirección, para ningún perfil", () => {
  for (const [petId] of EXPECTED) {
    const explanation = getProtectoraRiskExplanation(petId);
    const incLabels = explanation.increases.map((f) => f.label);
    const decLabels = explanation.decreases.map((f) => f.label);
    assert.equal(new Set(incLabels).size, incLabels.length, `${petId} increases sin duplicados`);
    assert.equal(new Set(decLabels).size, decLabels.length, `${petId} decreases sin duplicados`);
  }
});

// E-J: nivel de riesgo exacto por perfil.
for (const [petId, name, expectedLevel] of EXPECTED) {
  test(`${name} (${petId}) = ${expectedLevel}`, () => {
    const explanation = getProtectoraRiskExplanation(petId);
    assert.equal(explanation.riskLevel, expectedLevel);
  });
}

// K: riskLevel coincide con nivel_riesgo_relativo ya existente en los datos de Protectora.
test("K: riskLevel de la explicación coincide con el risk ya mostrado en la ficha (nivel_riesgo_relativo)", () => {
  for (const [petId] of EXPECTED) {
    const explanation = getProtectoraRiskExplanation(petId);
    const profile = PROTECTORA_PETFINDER_PROFILES.find((p) => p.id === petId);
    assert.ok(profile, `${petId} debe existir en PROTECTORA_PETFINDER_PROFILES`);
    assert.equal(explanation.riskLevel, profile.risk, `${petId}: riskLevel debe coincidir con dog.risk`);
  }
});

// L: no se usa el esquema antiguo de 4 bandas en el artefacto consumido por el frontend.
test("L: el contrato frontend no contiene el esquema de 4 bandas (Riesgo muy alto/alto/medio/bajo)", () => {
  assert.doesNotMatch(contractRaw, /Riesgo muy alto/);
  assert.doesNotMatch(contractRaw, /"riskLevel"\s*:\s*"Riesgo/);
  for (const [petId, , expectedLevel] of EXPECTED) {
    const explanation = getProtectoraRiskExplanation(petId);
    assert.ok(["Bajo", "Medio", "Alto"].includes(explanation.riskLevel));
    assert.equal(explanation.riskLevel, expectedLevel);
  }
});

// M: no se muestran valores SHAP numéricos al usuario. "generationNote" is
// internal methodology documentation never read by the resolver or rendered
// to the user — the real guarantee is that no factor object carries a
// numeric SHAP field, and that nothing rendered in the page mentions SHAP.
test("M: ningún factor expone un valor SHAP numérico, y la UI renderizada nunca menciona SHAP", () => {
  const contract = JSON.parse(contractRaw);
  for (const profile of Object.values(contract.profiles)) {
    for (const factor of [...profile.increases, ...profile.decreases]) {
      assert.ok(!("shapContribution" in factor));
      assert.ok(!("shap_contribution" in factor));
      assert.equal(typeof factor.value, factor.value === null ? "object" : "string");
    }
  }
  assert.doesNotMatch(pageSource, /shap/i);
});

// N: no se muestra texto/SVM de la rama textual en la UI. Same reasoning —
// check the actual factor data and the rendered page, not internal
// methodology prose in generationNote.
test("N: ningún factor expone señales textuales/SVM/TF-IDF, y la UI renderizada no las menciona", () => {
  const contract = JSON.parse(contractRaw);
  for (const profile of Object.values(contract.profiles)) {
    for (const factor of [...profile.increases, ...profile.decreases]) {
      assert.ok(!("term" in factor));
      assert.ok(!("tfidf_value" in factor));
      assert.ok(!("svm_coefficient" in factor));
      assert.ok(!("decision_function_contribution" in factor));
    }
  }
  assert.doesNotMatch(pageSource, /tfidf|svm|coeficiente/i);
});

// O: la completitud no se usa como causa del riesgo.
test("O: la completitud no aparece como causa dentro de la sección de factores", () => {
  assert.doesNotMatch(contractRaw, /completitud/i);
  // The completeness block must remain a separate, independent section in the page.
  assert.match(pageSource, /Completitud de ficha/);
  assert.match(pageSource, /independiente/);
});

// P: Austin no interviene.
test("P: Austin no interviene en la explicación del riesgo PetFinder", () => {
  assert.doesNotMatch(contractRaw, /austin/i);
  assert.match(pageSource, /No calculado en esta demostración/);
});

// Q: ninguna explicación es causal.
test("Q: el copy evita lenguaje causal (usa \"contribuyó\"/\"influyeron\", nunca \"causó\"/\"provoca\")", () => {
  assert.doesNotMatch(contractRaw, /\bcaus[oó]\b|\bcausa\b|\bprovoca\b/i);
  assert.doesNotMatch(pageSource, /\bcaus[oó]\b|\bprovoca\b/i);
  assert.match(contractRaw, /no representan relaciones causales/);
});

// R: PetID inexistente no produce una explicación inventada.
test("R: un PetID inexistente no devuelve una explicación inventada", () => {
  assert.equal(getProtectoraRiskExplanation("no-existe-este-id"), null);
  assert.equal(getProtectoraRiskExplanation(""), null);
});

test("la sección de factores no se renderiza cuando no hay explicación (sin fabricar contenido)", () => {
  assert.match(pageSource, /\{riskExplanation && <ProtectorRiskFactors/);
});

test("las variables sensibles/contraintuitivas llevan tooltip con lenguaje no causal, no un texto fijo repetido", () => {
  const withSensitive = EXPECTED
    .map(([petId]) => getProtectoraRiskExplanation(petId))
    .flatMap((e) => [...e.increases, ...e.decreases])
    .filter((f) => f.sensitive);
  assert.ok(withSensitive.length > 0, "al menos un factor sensible debe aparecer entre los 6 perfiles reales");
  for (const factor of withSensitive) {
    assert.ok(factor.tooltip, `el factor sensible "${factor.label}" debe llevar tooltip`);
    assert.doesNotMatch(factor.tooltip, /\bcaus[oó]\b|\bcausa\b/i);
  }
  assert.match(pageSource, /InfoTooltip/);
});

// --- Microajuste UI/UX final: título reducido, sin línea de dirección
// redundante por tarjeta, tooltips accesibles. -----------------------------

test("microajuste 1: el título de la sección usa una clase reducida propia, sin tocar la escala global var(--heading-md)", () => {
  assert.match(pageSource, /className="protector-risk-factors-title"/);
  assert.match(cssSource, /\.protector-profile-content-heading h2\.protector-risk-factors-title \{ font-size: clamp\(2rem, 2\.4vw, 2\.35rem\); \}/);
  // The shared rule other section headings rely on must be untouched.
  assert.match(cssSource, /\.protector-profile-content-heading h2 \{ margin: 7px 0 0; font-size: var\(--heading-md\); font-weight: 700; letter-spacing: -0\.04em; line-height: 1\.05; \}/);
});

test("microajuste 2: cada tarjeta ya no repite la dirección — solo columna+color+flecha la comunican", () => {
  assert.doesNotMatch(pageSource, /protector-risk-factor-direction/);
  // The per-card block itself must not render a standalone "Aumenta/Reduce la predicción" line.
  const cardBlockMatch = pageSource.match(/<li className="protector-risk-factor-item"[\s\S]*?<\/li>/);
  assert.ok(cardBlockMatch, "debe existir el bloque de tarjeta individual");
  assert.doesNotMatch(cardBlockMatch[0], /Aumenta la predicción|Reduce la predicción/);
});

test("microajuste 3: el icono ⓘ es un botón accesible (aria-label, aria-expanded, funciona por click y no solo hover)", async () => {
  const tooltipSource = await readFile(
    new URL("../src/components/protectora/InfoTooltip.tsx", import.meta.url),
    "utf8",
  );
  assert.match(tooltipSource, /"use client"/);
  assert.match(tooltipSource, /aria-label=\{`Más información sobre: \$\{subjectLabel\}`\}/);
  assert.match(tooltipSource, /aria-expanded=\{open\}/);
  assert.match(tooltipSource, /onClick=\{\(\) => setOpen/); // click/tap toggle, not hover-only
  assert.match(tooltipSource, /role="tooltip"/);
});

test("microajuste 3: solo los factores con tooltip real muestran el icono; los de valor autoexplicativo no", () => {
  for (const [petId] of EXPECTED) {
    const explanation = getProtectoraRiskExplanation(petId);
    for (const factor of [...explanation.increases, ...explanation.decreases]) {
      if (["Edad", "Tamaño", "Extensión de la descripción"].includes(factor.label)) {
        assert.equal(factor.tooltip, null, `"${factor.label}" es autoexplicativo y no debe llevar tooltip`);
      }
    }
  }
});

test("los factores seleccionados (technicalFeature/valor/dirección) no cambiaron respecto a la versión ya validada visualmente", () => {
  const contract = JSON.parse(contractRaw);
  const snapshot = {
    "485bebd4f": { inc: ["sterilized_label", "label_score_mean", "Age"], dec: ["n_label_annotations_mean", "dominant_color_pixel_fraction_mean", "brightness_mean"] },
    "a9085cdde": { inc: ["label_score_mean", "age_months", "n_label_annotations_mean"], dec: ["gender_label", "Fee", "dominant_color_score_mean"] },
    "c3a2d4d83": { inc: ["Age", "maturity_size_label", "state_name"], dec: ["label_score_mean", "n_label_annotations_mean", "sterilized_label"] },
    "ad2423b1f": { inc: ["Age", "label_score_mean", "description_unique_tokens"], dec: ["n_label_annotations_mean", "maturity_size_label", "breed1_name"] },
    "fff4a6420": { inc: ["label_score_mean", "sentiment_score", "dominant_color_score_mean"], dec: ["gender_label", "age_months", "sterilized_label"] },
    "c749028bb": { inc: ["Age", "sterilized_label", "sentiment_magnitude"], dec: ["label_score_mean", "breed1_name", "n_label_annotations_mean"] },
  };
  for (const [petId, expected] of Object.entries(snapshot)) {
    const profile = contract.profiles[petId];
    assert.deepEqual(profile.increases.map((f) => f.technicalFeature), expected.inc, `${petId} increases sin cambios`);
    assert.deepEqual(profile.decreases.map((f) => f.technicalFeature), expected.dec, `${petId} decreases sin cambios`);
  }
});

test("cada factor mostrado expone como máximo texto/label/valor/dirección — nunca el nombre técnico de la feature", () => {
  for (const [petId] of EXPECTED) {
    const explanation = getProtectoraRiskExplanation(petId);
    for (const factor of [...explanation.increases, ...explanation.decreases]) {
      assert.equal(typeof factor.label, "string");
      assert.ok(factor.value === null || typeof factor.value === "string");
      assert.ok(["increase", "decrease"].includes(factor.direction));
      assert.ok(!("technicalFeature" in factor), "el tipo expuesto no debe incluir el nombre técnico");
      assert.ok(!("shapContribution" in factor) && !("shap_contribution" in factor));
    }
  }
});
