import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionDivider } from "@/components/SectionDivider";
import { DEMO_DOGS, type DemoDog, type RiskLevel } from "@/data/demoDogs";

const HISTORICAL_CATALOG_SIZE = 6474;
const RISK_LEVELS: readonly RiskLevel[] = ["Bajo", "Medio", "Alto"];
const MATRIX_RISK_POSITION: Record<RiskLevel, number> = {
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
      value: DEMO_DOGS.length.toLocaleString("es-ES"),
      detail: "perfiles ilustrativos",
      context: "Vista frontend actual",
    },
    {
      label: "Riesgo complementario alto",
      value: highRiskCount.toLocaleString("es-ES"),
      detail: "perfiles",
      context: "Derivado de la vista ilustrativa",
    },
    {
      label: "Completitud media",
      value: `${averageCompleteness} %`,
      detail: "información disponible",
      context: "Media de la vista ilustrativa",
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

function RiskDistribution({ counts }: { counts: Record<RiskLevel, number> }) {
  return (
    <section className="protector-panel protector-risk-panel" aria-labelledby="risk-distribution-title">
      <header className="protector-panel-heading">
        <p className="section-kicker">Lectura del catálogo</p>
        <h2 id="risk-distribution-title">Riesgo complementario de adopción lenta</h2>
        <p>Permite contextualizar qué perfiles podrían requerir una mayor atención en términos de visibilidad.</p>
      </header>
      <div className="protector-risk-list">
        {RISK_LEVELS.map((level) => {
          const width = (counts[level] / DEMO_DOGS.length) * 100;
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

function CompletenessOverview({ dogs }: { dogs: readonly DemoDog[] }) {
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
              {DEMO_DOGS.map((dog) => (
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

function ProtectorReviewCard({ dog }: { dog: DemoDog }) {
  return (
    <article className="protector-review-card">
      <div className="protector-review-photo" aria-label={`Espacio reservado para la fotografía del perfil de ${dog.name}`}>
        <span aria-hidden="true">{dog.name[0]}</span>
        <p>Fotografía del perfil</p>
        <small>Vista ilustrativa</small>
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
        <button type="button" disabled aria-label={`Revisar el perfil de ${dog.name}, disponible próximamente`}>Revisar perfil <small>Próximamente</small></button>
      </div>
    </article>
  );
}

export default function ProtectorPage() {
  const demoCount = DEMO_DOGS.length;
  const riskCounts = DEMO_DOGS.reduce<Record<RiskLevel, number>>(
    (counts, dog) => ({ ...counts, [dog.risk]: counts[dog.risk] + 1 }),
    { Bajo: 0, Medio: 0, Alto: 0 },
  );
  const averageCompleteness = DEMO_DOGS.reduce((total, dog) => total + dog.completeness, 0) / demoCount;
  const averageCompletenessLabel = averageCompleteness.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const dogsByCompleteness = [...DEMO_DOGS].sort((first, second) => second.completeness - first.completeness);
  const highRiskDogs = DEMO_DOGS.filter((dog) => dog.risk === "Alto");

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
              <h2 id="protector-demo-title">Lectura operativa con perfiles ilustrativos</h2>
              <p>Los perfiles y métricas mostrados en esta pantalla se utilizan para validar la experiencia de usuario. La versión final se conectará al catálogo histórico y a los componentes analíticos preparados.</p>
            </div>
            <p>Los animales mostrados no deben interpretarse como actualmente disponibles para adopción.</p>
          </aside>

          <section className="protector-summary" aria-labelledby="protector-summary-title">
            <header className="protector-section-heading">
              <div><p className="section-kicker">Contexto operativo</p><h2 id="protector-summary-title">Resumen de la vista</h2></div>
              <p>El catálogo histórico preparado y los seis perfiles de esta demostración se muestran como ámbitos claramente diferenciados.</p>
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
                <p>Austin constituye el núcleo predictivo principal de InvisibleDogs Predict para estimar el riesgo de larga estancia cuando se dispone de entradas compatibles con el modelo preparado.</p>
              </article>
              <article>
                <span>02 · PetFinder</span>
                <h3>Riesgo complementario de adopción lenta</h3>
                <p>PetFinder aporta una capa complementaria basada en datos históricos de adopción y presentación de perfiles, utilizada en esta demostración para contextualizar qué perros podrían necesitar una mayor visibilidad.</p>
              </article>
            </div>
            <aside className="protector-methodology-note">
              <span aria-hidden="true">i</span>
              <p>El modelo de Austin y el score complementario de PetFinder tienen objetivos y contratos de entrada diferentes. No se combinan directamente ni se aplica el modelo Austin sobre los perfiles históricos de PetFinder.</p>
            </aside>
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
