import Image from "next/image";
import Link from "next/link";
import { SectionDivider } from "@/components/SectionDivider";
import { LogoutButton } from "@/components/protectora/LogoutButton";
import { adopterProfiles } from "@/lib/adoptante/artifacts";
import { createAdopterDogResult } from "@/lib/adoptante/presentation";
import { tfmResults, austinTestCount, austinTopTen, formatTfmMetric } from "@/lib/tfm/results";
import type { AdopterDogResult } from "@/types/adopterResult";
import type { ProtectoraRiskLevel } from "@/data/protectoraPetfinderProfiles";

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

const PROTECTORA_REVIEW_PHOTO_POSITIONS: Readonly<Record<string, string>> = {
  Simone: "50% 34%",
  HAPPY: "50% 28%",
  "Wei Wei": "50% 46%",
  Lucy: "50% 34%",
  Lily: "50% 30%",
  "Bailey (Great With Kids).": "50% 30%",
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
          <Link className="protector-header-overview" href="/protectora/catalogo">Explorador de perfiles</Link>
          <LogoutButton />
          <Link className="back-home" href="/"><BackIcon />Inicio</Link>
        </div>
      </div>
    </header>
  );
}

function ProtectorKpis({
  highRiskCount,
  highRiskPercent,
  averageCompleteness,
}: {
  highRiskCount: number;
  highRiskPercent: string;
  averageCompleteness: string;
}) {
  const kpis = [
    {
      label: "Perfiles analizados",
      value: HISTORICAL_CATALOG_SIZE.toLocaleString("es-ES"),
      detail: "perfiles históricos",
      context: "Conjunto completo PetFinder",
    },
    {
      label: "Riesgo complementario alto",
      value: highRiskCount.toLocaleString("es-ES"),
      detail: "perfiles",
      context: "Clasificación del modelo PetFinder",
    },
    {
      label: "Proporción en nivel Alto",
      value: `${highRiskPercent} %`,
      detail: "de los perfiles",
      context: "Sobre todos los perfiles analizados",
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
        <p className="section-kicker">Lectura del conjunto completo</p>
        <h2 id="risk-distribution-title">Riesgo complementario de adopción lenta</h2>
        <p>Distribución de los {HISTORICAL_CATALOG_SIZE.toLocaleString("es-ES")} perfiles según el nivel de riesgo complementario estimado por el modelo PetFinder.</p>
      </header>
      <div className="protector-risk-list">
        {RISK_LEVELS.map((level) => {
          const percentage = (counts[level] / HISTORICAL_CATALOG_SIZE) * 100;
          return (
            <div className="protector-risk-row" key={level}>
              <div><span className={`protector-risk-dot risk-${level.toLocaleLowerCase()}`} aria-hidden="true" /><strong>{level}</strong></div>
              <div className="protector-risk-track" aria-hidden="true"><span className={`risk-${level.toLocaleLowerCase()}`} style={{ width: `${percentage}%` }} /></div>
              <p><strong>{counts[level].toLocaleString("es-ES")}</strong> perfiles · {percentage.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %</p>
            </div>
          );
        })}
      </div>
      <p className="protector-panel-note">Los niveles son categorías derivadas del modelo complementario y se muestran sobre el conjunto histórico completo.</p>
    </section>
  );
}

type CompletenessBand = {
  label: string;
  count: number;
  percentage: number;
};

function CompletenessOverview({ bands }: { bands: readonly CompletenessBand[] }) {
  return (
    <section className="protector-panel protector-completeness-panel" aria-labelledby="completeness-title">
      <header className="protector-panel-heading">
        <p className="section-kicker">Información disponible</p>
        <h2 id="completeness-title">Completitud de las fichas</h2>
        <p>Distribución de los perfiles según la cantidad de información estructurada disponible en cada ficha.</p>
      </header>
      <div className="protector-completeness-list">
        {bands.map((band) => (
          <div className="protector-completeness-row" key={band.label}>
            <div><strong>{band.label}</strong><span>{band.count.toLocaleString("es-ES")} · {band.percentage.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %</span></div>
            <div className="protector-completeness-track" role="progressbar" aria-label={`${band.label}: ${band.percentage.toLocaleString("es-ES", { maximumFractionDigits: 1 })} por ciento de los perfiles`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(band.percentage)}>
              <span style={{ width: `${band.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="protector-panel-note">La completitud describe la información disponible; no evalúa al perro ni modifica su nivel de riesgo.</p>
    </section>
  );
}

function ProtectorReviewCard({ dog }: { dog: AdopterDogResult["profile"] }) {
  const objectPosition = PROTECTORA_REVIEW_PHOTO_POSITIONS[dog.displayName]
    ?? PROTECTORA_REVIEW_PHOTO_POSITIONS[dog.sourceName]
    ?? dog.objectPosition;

  return (
    <article className="protector-review-card">
      <div className="protector-review-photo" style={{ aspectRatio: "16 / 9", height: "auto" }}>
        <Image
          className="protector-review-image"
          src={dog.photoUrl!}
          alt={`Fotografía de ${dog.displayName}`}
          width={640}
          height={360}
          sizes="(max-width: 760px) 100vw, 50vw"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition }}
        />
      </div>
      <div className="protector-review-body">
        <div className="protector-review-title">
          <div><p>Perfil para revisión</p><h3>{dog.displayName}</h3></div>
          <span>{dog.breedLabel}</span>
        </div>
        <p className="protector-review-meta">{dog.ageLabel} <i aria-hidden="true">·</i> {dog.sex} <i aria-hidden="true">·</i> {dog.size}</p>
        <dl>
          <div><dt>Riesgo complementario</dt><dd>{dog.riskLevel}</dd></div>
          <div><dt>Completitud de ficha</dt><dd>{dog.completenessPercent} %</dd></div>
        </dl>
        <div className="protector-review-track" role="progressbar" aria-label={`Completitud de la ficha de ${dog.displayName}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={dog.completenessPercent}>
          <span style={{ width: `${dog.completenessPercent}%` }} />
        </div>
        <p className="protector-review-context">Este perfil se encuentra entre los de mayor probabilidad estimada de adopción lenta dentro del nivel Alto. La completitud se muestra como una dimensión independiente y no interviene en este orden.</p>
        <Link className="protector-review-action" href={`/protectora/perro/${dog.petId}`}>Revisar perfil</Link>
      </div>
    </article>
  );
}

export default function ProtectorPage() {
  const riskStats = adopterProfiles.reduce<Record<ProtectoraRiskLevel, { count: number; completenessTotal: number }>>(
    (stats, dog) => {
      const current = stats[dog.riskLevel];
      return {
        ...stats,
        [dog.riskLevel]: {
          count: current.count + 1,
          completenessTotal: current.completenessTotal + dog.completenessIndex,
        },
      };
    },
    {
      Bajo: { count: 0, completenessTotal: 0 },
      Medio: { count: 0, completenessTotal: 0 },
      Alto: { count: 0, completenessTotal: 0 },
    },
  );
  const riskCounts: Record<ProtectoraRiskLevel, number> = {
    Bajo: riskStats.Bajo.count,
    Medio: riskStats.Medio.count,
    Alto: riskStats.Alto.count,
  };
  const averageCompleteness = (
    adopterProfiles.reduce((total, dog) => total + dog.completenessIndex, 0) / HISTORICAL_CATALOG_SIZE
  ) * 100;
  const averageCompletenessLabel = averageCompleteness.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const highRiskPercentLabel = ((riskCounts.Alto / HISTORICAL_CATALOG_SIZE) * 100).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const completenessBands: CompletenessBand[] = [
    { label: "Menos del 50 %", count: adopterProfiles.filter((dog) => dog.completenessIndex < 0.5).length, percentage: 0 },
    { label: "50–74 %", count: adopterProfiles.filter((dog) => dog.completenessIndex >= 0.5 && dog.completenessIndex < 0.75).length, percentage: 0 },
    { label: "75–89 %", count: adopterProfiles.filter((dog) => dog.completenessIndex >= 0.75 && dog.completenessIndex < 0.9).length, percentage: 0 },
    { label: "90–100 %", count: adopterProfiles.filter((dog) => dog.completenessIndex >= 0.9).length, percentage: 0 },
  ].map((band) => ({ ...band, percentage: (band.count / HISTORICAL_CATALOG_SIZE) * 100 }));

  const highRiskDogs = adopterProfiles
    .filter((dog) => dog.riskLevel === "Alto")
    .sort((first, second) => second.riskProbability - first.riskProbability)
    .slice(0, 6)
    .map((dog) => createAdopterDogResult(dog).profile);

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
            <span>Base histórica</span>
            <div>
              <h2 id="protector-demo-title">Lectura operativa sobre todos los perfiles</h2>
              <p>Las métricas de esta vista se calculan sobre los {HISTORICAL_CATALOG_SIZE.toLocaleString("es-ES")} perfiles históricos PetFinder analizados por InvisibleDogs Predict, no sobre una selección manual de ejemplos.</p>
            </div>
            <p>Los animales mostrados pertenecen a registros históricos y no deben interpretarse como actualmente disponibles para adopción.</p>
          </aside>

          <section className="protector-summary" aria-labelledby="protector-summary-title">
            <header className="protector-section-heading">
              <div><p className="section-kicker">Contexto operativo</p><h2 id="protector-summary-title">Resumen de perfiles</h2></div>
              <p>Las cifras siguientes describen el conjunto completo PetFinder utilizado por InvisibleDogs Predict.</p>
            </header>
            <ProtectorKpis highRiskCount={riskCounts.Alto} highRiskPercent={highRiskPercentLabel} averageCompleteness={averageCompletenessLabel} />
          </section>

          <div className="protector-analytics-grid">
            <RiskDistribution counts={riskCounts} />
            <CompletenessOverview bands={completenessBands} />
          </div>

          <section className="protector-review-section" aria-labelledby="protector-review-title">
            <header className="protector-section-heading">
              <div><p className="section-kicker">Revisión de visibilidad</p><h2 id="protector-review-title">Perfiles con mayor riesgo complementario</h2></div>
              <p>Se muestran los 6 perfiles con mayor probabilidad estimada de adopción lenta dentro de los {riskCounts.Alto.toLocaleString("es-ES")} perfiles clasificados en nivel Alto. La completitud no interviene en este orden.</p>
            </header>
            <div className="protector-review-grid">
              {highRiskDogs.map((dog) => <ProtectorReviewCard dog={dog} key={dog.petId} />)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "18px", marginTop: "26px", padding: "22px 24px", border: "1px solid rgba(91, 42, 134, 0.12)", borderRadius: "18px", background: "#fff" }}>
              <div>
                <strong style={{ display: "block", marginBottom: "6px" }}>Explorador de perfiles</strong>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.55 }}>Busca y filtra cualquiera de los {HISTORICAL_CATALOG_SIZE.toLocaleString("es-ES")} perfiles para revisar su ficha y sus acciones recomendadas de visibilidad.</p>
              </div>
              <Link className="protector-review-action" href="/protectora/catalogo">Ver los {HISTORICAL_CATALOG_SIZE.toLocaleString("es-ES")} perfiles</Link>
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
