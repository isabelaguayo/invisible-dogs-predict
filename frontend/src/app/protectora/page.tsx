import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionDivider } from "@/components/SectionDivider";
import { LogoutButton } from "@/components/protectora/LogoutButton";
import { adopterProfiles } from "@/lib/adoptante/artifacts";
import { tfmResults, austinTestCount, austinTopTen, formatTfmMetric } from "@/lib/tfm/results";
import {
  PROTECTORA_PETFINDER_PROFILES,
  type ProtectoraPetfinderProfile,
  type ProtectoraRiskLevel,
} from "@/data/protectoraPetfinderProfiles";

const TEXTMINING_CONCEPTOS_SENCILLA = [
  "Sociable con personas", "Juguetón", "Cariñoso", "Confiado", "Desparasitado",
  "Independiente", "Curioso", "Buen comportamiento", "Fácil adaptación", "Amigable",
  "Esterilizado", "Adaptable", "Sociable", "Saludable", "Microchip", "Tranquilo",
  "Activo", "Buen estado de salud", "Equilibrado", "Fácil manejo",
  "Acostumbrado al hogar", "Educado", "Dócil", "Sociable con perros",
  "Vacunado", "Alegre", "Paseo con correa",
];

const TEXTMINING_CONCEPTOS_LENTA = [
  "Timidez", "Baja sociabilidad", "Encadenado", "Sin hogar", "Tratamiento",
  "Maltrato", "Reactividad", "Historial complejo", "Inseguridad",
  "Necesidades especiales", "Mayor", "Enfermedad", "Movilidad reducida",
  "Miedo", "Recuperación", "Discapacidad", "Agresividad", "Abandono",
  "Medicación", "Adaptación", "Estrés", "Trauma", "Cirugía",
  "Problemas de conducta", "Cuidados especiales", "Herido", "Ansiedad",
  "Paciencia", "Desconfianza", "Socialización",
];

const HISTORICAL_CATALOG_SIZE = adopterProfiles.length;
const RISK_LEVELS: readonly ProtectoraRiskLevel[] = ["Bajo", "Medio", "Alto"];
const MATRIX_RISK_POSITION: Record<ProtectoraRiskLevel, number> = {
  Alto: 16.667,
  Medio: 50,
  Bajo: 83.333,
};

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

function ProtectorHeader() {
  return (
    <header className="flow-header protector-header">
      <div className="page-shell flow-header-inner">
        <Link className="brand-link" href="/" aria-label="InvisibleDogs Predict, volver al inicio">
          <Image src="/brand/idog-predict-logo-compacto.png" alt="" width={1448} height={1086} priority className="brand-mark" />
          <span className="brand-name">InvisibleDogs <strong>Predict</strong></span>
        </Link>
        <div className="flow-header-actions">
          <span className="flow-context"><i aria-hidden="true" />Vista Protectora</span>
          <LogoutButton />
          <Link className="back-home" href="/"><BackIcon />Inicio</Link>
        </div>
      </div>
    </header>
  );
}

function ProtectorKpis({
  highRiskCount,
  averageCompleteness,
}: {
  highRiskCount: number;
  averageCompleteness: string;
}) {
  const kpis = [
    {
      label: "Catálogo histórico preparado",
      value: HISTORICAL_CATALOG_SIZE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
      detail: "perfiles individuales",
      context: "Contexto del proyecto",
    },
    {
      label: "Perfiles en esta demostración",
      value: PROTECTORA_PETFINDER_PROFILES.length.toLocaleString("es-ES"),
      detail: "perfiles históricos",
      context: "Selección PetFinder",
    },
    {
      label: "Riesgo complementario alto",
      value: highRiskCount.toLocaleString("es-ES"),
      detail: "perfiles",
      context: "Derivado de la selección PetFinder",
    },
    {
      label: "Completitud media",
      value: `${averageCompleteness} %`,
      detail: "información disponible",
      context: "Media del índice PetFinder",
    },
  ];

  return (
    <div className="protector-kpi-grid">
      {kpis.map((kpi, index) => (
        <article className="protector-kpi" key={kpi.label}>
          <span className="protector-kpi-index">0{index + 1}</span>
          <p>{kpi.label}</p>
          <strong>{kpi.value}</strong>
          <span>{kpi.detail}</span>
          <small>{kpi.context}</small>
        </article>
      ))}
    </div>
  );
}

function RiskDistribution({ counts }: { counts: Record<ProtectoraRiskLevel, number> }) {
  return (
    <section className="protector-panel protector-risk-panel" aria-labelledby="risk-distribution-title">
      <header className="protector-panel-heading">
        <p className="section-kicker">Lectura del catálogo</p>
        <h2 id="risk-distribution-title">Riesgo complementario de adopción lenta</h2>
        <p>Permite contextualizar qué perfiles podrían requerir una mayor atención en términos de visibilidad.</p>
      </header>
      <div className="protector-risk-list">
        {RISK_LEVELS.map((level) => {
          const width = (counts[level] / PROTECTORA_PETFINDER_PROFILES.length) * 100;
          return (
            <div className="protector-risk-row" key={level}>
              <div><span className={`protector-risk-dot risk-${level.toLocaleLowerCase()}`} aria-hidden="true" /><strong>{level}</strong></div>
              <div className="protector-risk-track" aria-hidden="true"><span className={`risk-${level.toLocaleLowerCase()}`} style={{ width: `${width}%` }} /></div>
              <p><strong>{counts[level]}</strong> {counts[level] === 1 ? "perfil" : "perfiles"}</p>
            </div>
          );
        })}
      </div>
      <p className="protector-panel-note">Los niveles son categorías descriptivas de riesgo complementario; no representan probabilidades.</p>
    </section>
  );
}

function CompletenessOverview({ dogs }: { dogs: readonly ProtectoraPetfinderProfile[] }) {
  return (
    <section className="protector-panel protector-completeness-panel" aria-labelledby="completeness-title">
      <header className="protector-panel-heading">
        <p className="section-kicker">Información disponible</p>
        <h2 id="completeness-title">Completitud de las fichas</h2>
        <p>La completitud indica cuánta información contiene una ficha; no evalúa al perro.</p>
      </header>
      <div className="protector-completeness-list">
        {dogs.map((dog) => (
          <div className="protector-completeness-row" key={dog.id}>
            <div><strong>{dog.name}</strong><span>{dog.completeness} %</span></div>
            <div className="protector-completeness-track" role="progressbar" aria-label={`Completitud de la ficha de ${dog.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={dog.completeness}>
              <span style={{ width: `${dog.completeness}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="protector-panel-note">Orden descriptivo de mayor a menor información disponible.</p>
    </section>
  );
}

function RiskCompletenessMatrix() {
  return (
    <section className="protector-matrix-section" aria-labelledby="risk-matrix-title">
      <header className="protector-section-heading">
        <div>
          <p className="section-kicker">Dos dimensiones independientes</p>
          <h2 id="risk-matrix-title">Riesgo y completitud</h2>
        </div>
        <p>Una lectura conjunta del nivel de riesgo complementario y de la cantidad de información disponible en cada ficha.</p>
      </header>

      <div className="protector-matrix-scroll" tabIndex={0} aria-label="Matriz desplazable de riesgo y completitud">
        <div className="protector-matrix">
          <div className="protector-matrix-y-title">Riesgo complementario</div>
          <div className="protector-matrix-y-labels" aria-hidden="true"><span>Alto</span><span>Medio</span><span>Bajo</span></div>
          <div className="protector-matrix-plot" role="img" aria-label="Matriz con los seis perfiles según su riesgo complementario y completitud de ficha">
            <div className="protector-matrix-stage">
              {PROTECTORA_PETFINDER_PROFILES.map((dog) => (
                <div
                  className={`protector-matrix-point matrix-risk-${dog.risk.toLocaleLowerCase()}`}
                  style={{ "--matrix-x": `${dog.completeness}%`, "--matrix-y": `${MATRIX_RISK_POSITION[dog.risk]}%` } as CSSProperties}
                  aria-label={`${dog.name}: riesgo complementario ${dog.risk}, completitud ${dog.completeness} por ciento`}
                  key={dog.id}
                >
                  <span aria-hidden="true" />
                  <strong>{dog.name}</strong>
                  <small>{dog.completeness} %</small>
                </div>
              ))}
            </div>
          </div>
          <div className="protector-matrix-x-axis" aria-hidden="true"><span>0 %</span><span>25 %</span><span>50 %</span><span>75 %</span><span>100 %</span></div>
          <div className="protector-matrix-x-title">Completitud de ficha</div>
        </div>
      </div>

      <p className="protector-matrix-note">Esta vista permite revisar conjuntamente dos dimensiones independientes. No constituye una puntuación combinada ni determina automáticamente la prioridad de un perfil.</p>
    </section>
  );
}

function ProtectorReviewCard({ dog }: { dog: ProtectoraPetfinderProfile }) {
  return (
    <article className="protector-review-card">
      <div className="protector-review-photo">
        <Image
          className="protector-review-image"
          src={dog.imagePath}
          alt={`Fotografía de ${dog.name}`}
          width={640}
          height={480}
          sizes="(max-width: 760px) 100vw, 50vw"
        />
      </div>
      <div className="protector-review-body">
        <div className="protector-review-title">
          <div><p>Perfil para revisión</p><h3>{dog.name}</h3></div>
          <span>{dog.breed}</span>
        </div>
        <p className="protector-review-meta">{dog.age} <i aria-hidden="true">·</i> {dog.sex} <i aria-hidden="true">·</i> {dog.size}</p>
        <dl>
          <div><dt>Riesgo complementario</dt><dd>Alto</dd></div>
          <div><dt>Completitud de ficha</dt><dd>{dog.completeness} %</dd></div>
        </dl>
        <div className="protector-review-track" role="progressbar" aria-label={`Completitud de la ficha de ${dog.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={dog.completeness}>
          <span style={{ width: `${dog.completeness}%` }} />
        </div>
        <p className="protector-review-context">Este perfil aparece en esta sección por pertenecer al nivel Alto de riesgo complementario. La completitud se muestra como una dimensión independiente.</p>
        <Link className="protector-review-action" href={`/protectora/perro/${dog.id}`}>Revisar perfil</Link>
      </div>
    </article>
  );
}

export default function ProtectorPage() {
  const demoCount = PROTECTORA_PETFINDER_PROFILES.length;
  const riskCounts = PROTECTORA_PETFINDER_PROFILES.reduce<Record<ProtectoraRiskLevel, number>>(
    (counts, dog) => ({
      ...counts,
      [dog.source.nivel_riesgo_relativo]: counts[dog.source.nivel_riesgo_relativo] + 1,
    }),
    { Bajo: 0, Medio: 0, Alto: 0 },
  );
  const averageCompleteness = (
    PROTECTORA_PETFINDER_PROFILES.reduce(
      (total, dog) => total + dog.source.indice_completitud_ficha,
      0,
    ) / demoCount
  ) * 100;
  const averageCompletenessLabel = averageCompleteness.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const dogsByCompleteness = [...PROTECTORA_PETFINDER_PROFILES].sort((first, second) => second.completeness - first.completeness);
  const highRiskDogs = PROTECTORA_PETFINDER_PROFILES.filter(
    (dog) => dog.source.nivel_riesgo_relativo === "Alto",
  );

  return (
    <main className="protector-page">
      <ProtectorHeader />

      <section className="protector-hero">
        <div className="page-shell protector-hero-grid">
          <div className="protector-hero-copy">
            <p className="flow-eyebrow">Vista Protectora</p>
            <h1>Haz visibles los perfiles que podrían necesitar más atención</h1>
            <p>InvisibleDogs Predict ayuda a revisar el riesgo complementario de adopción lenta y la información disponible en cada ficha para detectar perfiles que podrían beneficiarse de una mayor visibilidad.</p>
            <div><span aria-hidden="true">i</span>Esta vista organiza información para apoyar la revisión de los perfiles; no sustituye el criterio profesional de la protectora.</div>
          </div>
          <Image
            className="protector-hero-image"
            src="/illustrations/Protectora.png"
            alt=""
            width={1122}
            height={1402}
            priority
            sizes="(max-width: 760px) 190px, (max-width: 1040px) 240px, 300px"
          />
        </div>
      </section>

      <SectionDivider />

      <section className="protector-overview">
        <div className="page-shell">
          <aside className="protector-demo-notice" aria-labelledby="protector-demo-title">
            <span>Vista de demostración</span>
            <div>
              <h2 id="protector-demo-title">Lectura operativa con perfiles históricos</h2>
              <p>Los seis perfiles y sus métricas proceden del artefacto histórico PetFinder preparado para esta demostración. La selección se mantiene separada del catálogo completo y del modelo Austin.</p>
            </div>
            <p>Los animales mostrados no deben interpretarse como actualmente disponibles para adopción.</p>
          </aside>

          <section className="protector-summary" aria-labelledby="protector-summary-title">
            <header className="protector-section-heading">
              <div><p className="section-kicker">Contexto operativo</p><h2 id="protector-summary-title">Resumen de la vista</h2></div>
              <p>El catálogo histórico preparado y los seis perfiles PetFinder seleccionados se muestran como ámbitos claramente diferenciados.</p>
            </header>
            <ProtectorKpis highRiskCount={riskCounts.Alto} averageCompleteness={averageCompletenessLabel} />
          </section>

          <div className="protector-analytics-grid">
            <RiskDistribution counts={riskCounts} />
            <CompletenessOverview dogs={dogsByCompleteness} />
          </div>

          <RiskCompletenessMatrix />

          <section className="protector-review-section" aria-labelledby="protector-review-title">
            <header className="protector-section-heading">
              <div><p className="section-kicker">Revisión de visibilidad</p><h2 id="protector-review-title">Perfiles que podrían necesitar más visibilidad</h2></div>
              <p>Esta selección incluye únicamente los perfiles de la demostración con riesgo complementario Alto, sin aplicar fórmulas de priorización ni ordenar por un score combinado.</p>
            </header>
            <div className="protector-review-grid">
              {highRiskDogs.map((dog) => <ProtectorReviewCard dog={dog} key={dog.id} />)}
            </div>
          </section>

          <section className="protector-methodology" aria-labelledby="protector-methodology-title">
            <header className="protector-section-heading protector-methodology-heading">
              <div><p className="section-kicker">Separación metodológica</p><h2 id="protector-methodology-title">Dos capas con funciones diferentes</h2></div>
              <p>La lectura operativa mantiene separados los objetivos, las entradas y las salidas de cada componente analítico.</p>
            </header>
            <div className="protector-methodology-grid">
              <article>
                <span>01 · Austin Animal Center</span>
                <h3>Predicción de larga estancia</h3>
                <p>{tfmResults.austin.metrics.modelo} para estancias superiores a 30 días. En test Austin ({austinTestCount.toLocaleString("es-ES")} registros): ROC AUC {formatTfmMetric(tfmResults.austin.metrics.roc_auc)} y recall {formatTfmMetric(Number(tfmResults.austin.metrics.recall) * 100, 2)} %. La precisión del Top 10 % es {formatTfmMetric(Number(austinTopTen.precision_topk) * 100, 2)} %. Son resultados históricos del modelo, no predicciones de estas fichas PetFinder.</p>
              </article>
              <article>
                <span>02 · PetFinder</span>
                <h3>Riesgo complementario de adopción lenta</h3>
                <p>PetFinder aporta una capa complementaria basada en datos históricos de adopción y presentación de perfiles. El modelo final ({tfmResults.petfinder.metrics.modelo}) obtiene ROC AUC {formatTfmMetric(tfmResults.petfinder.metrics.roc_auc)} en test. Sus scores contextualizan qué perros podrían necesitar una mayor visibilidad.</p>
              </article>
            </div>
            <aside className="protector-methodology-note">
              <span aria-hidden="true">i</span>
              <p>El modelo de Austin y el score complementario de PetFinder tienen objetivos y contratos de entrada diferentes. No se combinan directamente ni se aplica el modelo Austin sobre los perfiles históricos de PetFinder.</p>
            </aside>
          </section>

          <section className="protector-textmining-section" aria-labelledby="protector-textmining-title">
            <header className="protector-section-heading">
              <div>
                <p className="section-kicker">Análisis textual</p>
                <h2 id="protector-textmining-title">Cómo se analiza la descripción del perfil</h2>
              </div>
              <p>La descripción histórica aporta señales lingüísticas que complementan la información estructurada del perfil dentro del modelo complementario PetFinder.</p>
            </header>

            <div className="protector-textmining-panel protector-textmining-chart">
                <h3>Términos que diferencian las descripciones de ambos grupos</h3>

                <div className="protector-textmining-clouds">
                  <figure className="protector-textmining-cloud">
                    <figcaption><i className="text-mining-legend-dot text-mining-legend-dot--no-lenta" aria-hidden="true" />Adopción potencialmente más sencilla</figcaption>
                    <Image
                      src="/images/text-mining/adopcion-sencilla.png"
                      alt="Nube de palabras con los términos aprobados asociados a una adopción potencialmente más sencilla."
                      width={1500}
                      height={900}
                      className="protector-textmining-cloud-image"
                    />
                    <p className="visually-hidden">{TEXTMINING_CONCEPTOS_SENCILLA.join(", ")}.</p>
                  </figure>
                  <figure className="protector-textmining-cloud">
                    <figcaption><i className="text-mining-legend-dot text-mining-legend-dot--lenta" aria-hidden="true" />Adopción potencialmente más lenta</figcaption>
                    <Image
                      src="/images/text-mining/adopcion-lenta.png"
                      alt="Nube de palabras con los términos aprobados asociados a una adopción potencialmente más lenta."
                      width={1500}
                      height={900}
                      className="protector-textmining-cloud-image"
                    />
                    <p className="visually-hidden">{TEXTMINING_CONCEPTOS_LENTA.join(", ")}.</p>
                  </figure>
                </div>

                <p className="protector-textmining-summary">Los términos de la nube morada (izquierda o superior) corresponden a una adopción potencialmente más sencilla; los de la nube naranja (derecha o inferior), a una adopción potencialmente más lenta.</p>

                <div className="reference-choice-note">
                  <span aria-hidden="true">i</span>
                  <p>Las palabras se muestran en castellano para facilitar su interpretación y se han organizado a partir de los patrones observados en las descripciones de PetFinder. Esta visualización es ilustrativa: el tamaño de las palabras no representa frecuencias ni pesos del modelo.</p>
                </div>
            </div>

            <div className="protector-textmining-side">
              <div className="protector-textmining-panel protector-textmining-signals">
                <h3>Señales extraídas del texto</h3>
                <ul>
                  <li><span>TF-IDF</span><p>Representa el texto según la relevancia de cada palabra dentro del conjunto de descripciones.</p></li>
                  <li><span>Sentimiento</span><p>Polaridad y magnitud del tono de la descripción.</p></li>
                  <li><span>Riqueza léxica</span><p>Diversidad de vocabulario dentro de cada descripción.</p></li>
                  <li><span>Longitud de la descripción</span><p>Número de palabras y caracteres del texto del perfil.</p></li>
                </ul>
              </div>
              <div className="protector-textmining-panel protector-textmining-usage">
                <h3>Cómo se utiliza</h3>
                <p>Estas señales alimentan la rama textual del modelo complementario PetFinder y se combinan con la información estructurada para estimar el riesgo relativo de adopción lenta.</p>
              </div>
            </div>
          </section>

          <aside className="protector-responsible-note">
            <div><span aria-hidden="true">i</span><strong>Apoyo a la decisión</strong></div>
            <p>InvisibleDogs Predict organiza información y señales analíticas para facilitar la revisión de los perfiles. Las decisiones sobre visibilidad, cuidado y adopción deben mantenerse bajo criterio profesional de la protectora.</p>
          </aside>
        </div>
      </section>

      <footer className="flow-footer protector-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Vista Protectora · Información explicable para apoyar la revisión profesional.</p></div>
      </footer>
    </main>
  );
}
