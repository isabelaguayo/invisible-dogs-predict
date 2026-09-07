import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const homeSource = readFileSync(path.join(repoRoot, "src/app/page.tsx"), "utf-8");
const globalsCssSource = readFileSync(path.join(repoRoot, "src/app/globals.css"), "utf-8");

test("Home ya no contiene la sección extensa 'El texto también cuenta'", () => {
  assert.doesNotMatch(homeSource, /El texto también cuenta/);
  assert.doesNotMatch(homeSource, /id="analisis-textual"/);
  assert.doesNotMatch(homeSource, /text-mining-section/);
  assert.doesNotMatch(homeSource, /Nube de palabras/);
  assert.doesNotMatch(homeSource, /Señales extraídas del texto/);
});

test("Home no renderiza las imágenes de las nubes de palabras", () => {
  assert.doesNotMatch(homeSource, /petfinder-wordcloud-no-lenta\.png/);
  assert.doesNotMatch(homeSource, /petfinder-wordcloud-lenta\.png/);
});

test("Home mantiene una mención compacta a la multimodalidad dentro de 'Cómo funciona'", () => {
  const howStart = homeSource.indexOf('id="como-funciona"');
  const journeysStart = homeSource.indexOf('id="recorridos"');
  assert.notEqual(howStart, -1);
  assert.notEqual(journeysStart, -1);
  const howSection = homeSource.slice(howStart, journeysStart);

  assert.match(howSection, /how-multimodal-strip/);
  assert.match(howSection, /Datos estructurados, texto e imagen se analizan de forma complementaria/);
  assert.match(howSection, />Datos estructurados</);
  assert.match(howSection, />Texto</);
  assert.match(howSection, />Imagen</);
  assert.match(howSection, /Análisis multimodal/);
});

test("la mención compacta es realmente compacta, no una sección grande nueva", () => {
  const howStart = homeSource.indexOf('id="como-funciona"');
  const journeysStart = homeSource.indexOf('id="recorridos"');
  const howSection = homeSource.slice(howStart, journeysStart);
  // No debe reaparecer ninguna de las piezas grandes que existían en Home antes de la reubicación.
  assert.doesNotMatch(howSection, /Cómo se utiliza/);
  assert.doesNotMatch(howSection, /TF-IDF/);
  assert.doesNotMatch(howSection, /<Image\b/);
});

test("no aparece ningún porcentaje ficticio en la mención compacta", () => {
  const howStart = homeSource.indexOf('id="como-funciona"');
  const journeysStart = homeSource.indexOf('id="recorridos"');
  const howSection = homeSource.slice(howStart, journeysStart);
  assert.doesNotMatch(howSection, /\b\d{1,3}\s?%/);
});

test("los assets científicos de las nubes de palabras siguen existiendo en el repo (no se han borrado)", () => {
  for (const filename of ["petfinder-wordcloud-no-lenta.png", "petfinder-wordcloud-lenta.png"]) {
    const assetPath = path.join(repoRoot, "public/images/text-mining", filename);
    const stats = statSync(assetPath);
    assert.ok(stats.isFile(), `${filename} debe seguir existiendo como archivo`);
    assert.ok(stats.size > 20_000, `${filename} no debe ser un stub vacío`);
  }
});

test("las clases CSS de la sección extensa eliminada ya no existen en globals.css (sin dejar CSS muerto)", () => {
  assert.doesNotMatch(globalsCssSource, /\.text-mining-section/);
  assert.doesNotMatch(globalsCssSource, /\.text-mining-grid/);
  assert.doesNotMatch(globalsCssSource, /\.text-mining-wordcloud/);
});

test("la nueva franja compacta está definida en globals.css sin tocar tokens tipográficos globales", () => {
  assert.match(globalsCssSource, /\.how-multimodal-strip/);
  assert.match(globalsCssSource, /--heading-sm: 1\.875rem;/, "el token tipográfico global no debe modificarse");
  assert.match(globalsCssSource, /--heading-md: clamp\(2\.25rem, 2\.8vw, 2\.75rem\);/, "el token tipográfico global no debe modificarse");
});
