import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const protectoraSource = readFileSync(path.join(repoRoot, "src/app/protectora/page.tsx"), "utf-8");
const globalsCssSource = readFileSync(path.join(repoRoot, "src/app/globals.css"), "utf-8");

function extractSection(source, marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `no se encuentra el marcador "${marker}" en protectora/page.tsx`);
  const end = source.indexOf('<aside className="protector-responsible-note">', start);
  assert.notEqual(end, -1, "no se encuentra el cierre de la sección de análisis textual");
  return source.slice(start, end);
}

const textMiningSection = extractSection(protectoraSource, 'className="protector-textmining-section"');

test("Protectora contiene el título 'Cómo se analiza la descripción del perfil'", () => {
  assert.match(protectoraSource, /Cómo se analiza la descripción del perfil/);
  assert.match(textMiningSection, /ANÁLISIS TEXTUAL|Análisis textual/);
});

test("el título de la visualización es el nuevo copy pedido", () => {
  assert.match(textMiningSection, /Términos que diferencian las descripciones de ambos grupos/);
});

test("A: el gráfico diferencial de barras antiguo ya NO se renderiza", () => {
  assert.doesNotMatch(protectoraSource, /petfinder-terminos-diferenciales\.svg/);
  assert.doesNotMatch(protectoraSource, /protector-textmining-chart-scroll/);
  assert.doesNotMatch(protectoraSource, /Gráfico de barras divergente/);
});

test("B: ambas nubes de palabras en castellano están presentes con los nuevos títulos", () => {
  assert.match(textMiningSection, /src="\/images\/text-mining\/adopcion-sencilla\.png"/);
  assert.match(textMiningSection, /src="\/images\/text-mining\/adopcion-lenta\.png"/);
  assert.match(textMiningSection, />Adopción potencialmente más sencilla</);
  assert.match(textMiningSection, />Adopción potencialmente más lenta</);
});

test("los títulos antiguos de las nubes ya no aparecen", () => {
  assert.doesNotMatch(textMiningSection, />Adopción no lenta</);
  assert.doesNotMatch(textMiningSection, />Adopción lenta</);
  assert.doesNotMatch(textMiningSection, /petfinder-wordcloud-no-lenta-es\.png/);
  assert.doesNotMatch(textMiningSection, /petfinder-wordcloud-lenta-es\.png/);
});

test("las nubes tienen alt text descriptivo y propio", () => {
  const altMatches = [...textMiningSection.matchAll(/alt="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(altMatches.length, 2, "debe haber exactamente dos imágenes de nube con alt");
  for (const alt of altMatches) {
    assert.ok(alt.length > 60, "cada alt debe ser descriptivo, no una etiqueta corta genérica");
  }
});

test("D: incluye exactamente la nueva frase explicativa sobre PetFinder y castellano", () => {
  assert.match(
    textMiningSection,
    /Las palabras se muestran en castellano para facilitar su interpretación y se han organizado a partir de los patrones observados en las descripciones de PetFinder\./,
  );
});

test("el aviso de no causalidad ha sido eliminado y no se sustituyó por uno equivalente", () => {
  assert.doesNotMatch(
    textMiningSection,
    /Estas asociaciones describen patrones del conjunto histórico y no implican causalidad ni determinan por sí solas el riesgo de un perro\./,
  );
  assert.doesNotMatch(textMiningSection, /no implican causalidad/);
  assert.doesNotMatch(textMiningSection, /Se muestran términos con significado interpretable dentro del contexto de adopción/);
  // Solo debe quedar UNA nota (la nueva frase), no dos notas apiladas.
  const noteCount = (textMiningSection.match(/reference-choice-note/g) || []).length;
  assert.equal(noteCount, 1, "solo debe quedar la nueva frase, sin explicaciones metodológicas adicionales");
});

test("no muestra porcentajes ni métricas ficticias en la sección", () => {
  assert.doesNotMatch(textMiningSection, /\b\d{1,3}\s?%/);
});

test("H: no se menciona Austin dentro del bloque de análisis textual", () => {
  assert.doesNotMatch(textMiningSection, /Austin/);
});

test("I: no se mezcla DINOv2 con el ensemble textual PetFinder en este bloque", () => {
  assert.doesNotMatch(textMiningSection, /DINOv2/);
  assert.match(textMiningSection, /modelo complementario PetFinder/);
});

test("la card de señales extraídas del texto tiene como máximo 4 elementos", () => {
  const listItemCount = (textMiningSection.match(/<li><span>/g) || []).length;
  assert.equal(listItemCount, 4, "la card de señales debe tener exactamente 4 elementos");
});

test("incluye el bloque 'Cómo se utiliza', distinto de la explicación local por perfil", () => {
  assert.match(
    textMiningSection,
    /Estas señales alimentan la rama textual del modelo complementario PetFinder y se combinan con la información estructurada para estimar el riesgo relativo de adopción lenta\./,
  );
  assert.doesNotMatch(textMiningSection, /¿Por qué tiene este nivel de riesgo\?/);
});

test("no se toca la ficha individual de Protectora (explicación 3+3, SHAP, tooltips)", () => {
  const fichaSource = readFileSync(path.join(repoRoot, "src/app/protectora/perro/[id]/page.tsx"), "utf-8");
  assert.match(fichaSource, /¿Por qué tiene este nivel de riesgo\?/, "la ficha debe seguir mostrando su explicación local intacta");
  assert.doesNotMatch(fichaSource, /protector-textmining-section/, "el bloque global de text mining no debe añadirse a la ficha individual");
});

const CONCEPTOS_SENCILLA = [
  "Sociable con personas", "Juguetón", "Cariñoso", "Confiado", "Desparasitado",
  "Independiente", "Curioso", "Buen comportamiento", "Fácil adaptación", "Amigable",
  "Esterilizado", "Adaptable", "Sociable", "Saludable", "Microchip", "Tranquilo",
  "Activo", "Buen estado de salud", "Equilibrado", "Fácil manejo",
  "Acostumbrado al hogar", "Educado", "Dócil", "Sociable con perros",
  "Vacunado", "Alegre", "Paseo con correa",
];

const CONCEPTOS_LENTA = [
  "Mayor", "Herido", "Recuperación", "Enfermedad", "Tratamiento", "Miedo",
  "Timidez", "Desconfianza", "Ansiedad", "Agresividad", "Reactividad",
  "Necesidades especiales", "Discapacidad", "Movilidad reducida", "Socialización",
  "Trauma", "Abandono", "Maltrato", "Encadenado", "Sin hogar", "Cirugía",
  "Cuidados especiales", "Medicación", "Adaptación", "Paciencia", "Inseguridad",
  "Estrés", "Problemas de conducta", "Baja sociabilidad", "Historial complejo",
];

test("F: la nube 'sencilla' contiene EXACTAMENTE los 27 conceptos del generador", () => {
  assert.equal(CONCEPTOS_SENCILLA.length, 27);
  const listMatch = textMiningSection.match(/TEXTMINING_CONCEPTOS_SENCILLA\.join/);
  assert.ok(listMatch, "la nube sencilla debe exponer su lista completa de conceptos (accesible, aunque visualmente oculta)");
  for (const concepto of CONCEPTOS_SENCILLA) {
    assert.ok(protectoraSource.includes(`"${concepto}"`), `falta el concepto "${concepto}" en la lista de la nube sencilla`);
  }
});

test("F: la nube 'lenta' contiene EXACTAMENTE los 30 conceptos pedidos, ni uno más ni uno menos", () => {
  assert.equal(CONCEPTOS_LENTA.length, 30);
  const listMatch = textMiningSection.match(/TEXTMINING_CONCEPTOS_LENTA\.join/);
  assert.ok(listMatch, "la nube lenta debe exponer su lista completa de conceptos (accesible, aunque visualmente oculta)");
  for (const concepto of CONCEPTOS_LENTA) {
    assert.ok(protectoraSource.includes(`"${concepto}"`), `falta el concepto "${concepto}" en la lista de la nube lenta`);
  }
});

test("las listas del componente contienen exactamente 27 y 30 conceptos, sin añadidos", () => {
  const sencillaArrayMatch = protectoraSource.match(/const TEXTMINING_CONCEPTOS_SENCILLA = \[([\s\S]*?)\];/);
  const lentaArrayMatch = protectoraSource.match(/const TEXTMINING_CONCEPTOS_LENTA = \[([\s\S]*?)\];/);
  assert.ok(sencillaArrayMatch && lentaArrayMatch, "no se encuentran las constantes de conceptos en el código");

  const countQuotedItems = (block) => (block.match(/"[^"]+"/g) || []).length;
  assert.equal(countQuotedItems(sencillaArrayMatch[1]), 27, "la lista sencilla debe tener exactamente 27 conceptos");
  assert.equal(countQuotedItems(lentaArrayMatch[1]), 30, "la lista lenta debe tener exactamente 30 conceptos");
});

test("G: no se introducen términos de la iteración de datos anterior que ya no forman parte de esta lista fija", () => {
  // Estos eran artefactos en inglés del CSV (ronda anterior, basada en log-ratio) o
  // conceptos explícitamente descartados entonces; ninguno forma parte de las dos
  // listas fijas de 30 conceptos de esta ronda, así que no deben reaparecer.
  const excluidos = [
    "Joven", "Veterinario", "grandma", "trust", "support", "rehabilitation",
    "affectionate", "survive", "condominium", "tzu",
  ];
  for (const term of excluidos) {
    assert.doesNotMatch(
      textMiningSection,
      new RegExp(term, "i"),
      `el término "${term}" (de la ronda de datos anterior) no debe aparecer en el bloque de análisis textual`,
    );
  }
});

test("las nubes originales (no traducidas) siguen existiendo intactas en el repositorio", () => {
  for (const filename of ["petfinder-wordcloud-no-lenta.png", "petfinder-wordcloud-lenta.png"]) {
    const assetPath = path.join(repoRoot, "public/images/text-mining", filename);
    const stats = statSync(assetPath);
    assert.ok(stats.isFile(), `${filename} debe seguir existiendo`);
    assert.ok(stats.size > 20_000, `${filename} no debe ser un stub vacío`);
  }
});

test("el SVG diferencial científico original sigue existiendo en el repositorio aunque ya no se renderice", () => {
  const assetPath = path.join(repoRoot, "public/images/text-mining/petfinder-terminos-diferenciales.svg");
  const stats = statSync(assetPath);
  assert.ok(stats.isFile(), "el SVG diferencial debe conservarse en el repo");
  assert.ok(stats.size > 500);
});

test("las nubes originales no se renderizan en Protectora (se reservan para una futura sección 'Sobre el proyecto')", () => {
  assert.doesNotMatch(protectoraSource, /petfinder-wordcloud-no-lenta\.png/);
  assert.doesNotMatch(protectoraSource, /petfinder-wordcloud-lenta\.png/);
});

test("los assets de nube en castellano de la iteración anterior (v1) se conservan, aunque ya no se rendericen", () => {
  for (const filename of ["petfinder-wordcloud-no-lenta-es.png", "petfinder-wordcloud-lenta-es.png"]) {
    const assetPath = path.join(repoRoot, "public/images/text-mining", filename);
    const stats = statSync(assetPath);
    assert.ok(stats.isFile(), `${filename} debe seguir existiendo`);
    assert.ok(stats.size > 5_000, `${filename} no debe ser un stub vacío`);
  }
});

test("los assets de nube v2 (30 conceptos, packing anterior) se conservan, aunque ya no se rendericen", () => {
  for (const filename of ["petfinder-wordcloud-sencilla-es-v2.png", "petfinder-wordcloud-lenta-es-v2.png"]) {
    const assetPath = path.join(repoRoot, "public/images/text-mining", filename);
    const stats = statSync(assetPath);
    assert.ok(stats.isFile(), `${filename} debe seguir existiendo`);
    assert.ok(stats.size > 5_000, `${filename} no debe ser un stub vacío`);
  }
  assert.doesNotMatch(textMiningSection, /petfinder-wordcloud-sencilla-es-v2\.png/);
  assert.doesNotMatch(textMiningSection, /petfinder-wordcloud-lenta-es-v2\.png/);
});

test("los assets v3 anteriores se conservan, aunque ya no se renderizan", () => {
  for (const filename of ["petfinder-wordcloud-sencilla-es-v3.png", "petfinder-wordcloud-lenta-es-v3.png"]) {
    const assetPath = path.join(repoRoot, "public/images/text-mining", filename);
    const stats = statSync(assetPath);
    assert.ok(stats.isFile(), `${filename} debe existir`);
    assert.ok(stats.size > 5_000, `${filename} no debe ser un stub vacío`);
  }
  assert.doesNotMatch(textMiningSection, /petfinder-wordcloud-sencilla-es-v3\.png/);
  assert.doesNotMatch(textMiningSection, /petfinder-wordcloud-lenta-es-v3\.png/);
});

test("los PNG definitivos son RGBA 1500x900, estáticos y se declaran sin recorte", () => {
  for (const filename of ["adopcion-sencilla.png", "adopcion-lenta.png"]) {
    const assetPath = path.join(repoRoot, "public/images/text-mining", filename);
    const bytes = readFileSync(assetPath);
    assert.ok(bytes.length > 5_000, `${filename} no debe ser un stub vacío`);
    assert.equal(bytes.toString("hex", 0, 8), "89504e470d0a1a0a", `${filename} debe ser PNG`);
    assert.equal(bytes.readUInt32BE(16), 1500, `${filename} debe medir 1500 px de ancho`);
    assert.equal(bytes.readUInt32BE(20), 900, `${filename} debe medir 900 px de alto`);
    assert.equal(bytes[25], 6, `${filename} debe conservar canal alfa RGBA`);
  }
  assert.match(textMiningSection, /width=\{1500\}\s*\n\s*height=\{900\}/);
});

test("las clases nuevas de las nubes están definidas en globals.css sin tocar tokens tipográficos globales", () => {
  assert.match(globalsCssSource, /\.protector-textmining-clouds/);
  assert.match(globalsCssSource, /\.protector-textmining-cloud-image/);
  assert.match(globalsCssSource, /--heading-sm: 1\.875rem;/, "el token tipográfico global no debe modificarse");
});
