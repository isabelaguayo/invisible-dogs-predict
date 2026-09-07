import Image from "next/image";
import Link from "next/link";
import { SectionDivider } from "@/components/SectionDivider";
import { LogoutButton } from "@/components/protectora/LogoutButton";
import {
  PROTECTORA_PETFINDER_PROFILES,
  getProtectoraPetfinderProfileById,
  type ProtectoraPetfinderProfile,
} from "@/data/protectoraPetfinderProfiles";
import { getProtectoraRiskExplanation } from "@/lib/protectora/explanations";
import { InfoTooltip } from "@/components/protectora/InfoTooltip";
import type { ProtectoraRiskExplanation, ProtectoraRiskFactor } from "@/types/protectoraRiskExplanation";

type ProtectorDogProfilePageProps = {
  params: Promise<{ id: string }>;
};

const PROFILE_CHARACTERISTICS = [
  ["age", "Edad"],
  ["sex", "Sexo"],
  ["size", "Tamaño adulto"],
  ["hairLength", "Pelo"],
  ["breed", "Raza"],
  ["color", "Color"],
] as const;

const PROFILE_CARE = [
  ["healthStatus", "Estado de salud"],
  ["sterilized", "Esterilización"],
  ["vaccinated", "Vacunación"],
  ["dewormed", "Desparasitación"],
] as const;

const REVIEWABLE_FIELDS = [
  ["healthStatus", "Estado de salud"],
  ["sterilized", "Esterilización"],
  ["vaccinated", "Vacunación"],
  ["dewormed", "Desparasitación"],
] as const;

export const dynamicParams = true;

export function generateStaticParams() {
  return PROTECTORA_PETFINDER_PROFILES.map((dog) => ({ id: dog.id }));
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

function ProtectorProfileHeader() {
  return (
    <header className="flow-header protector-header protector-profile-header">
      <div className="page-shell flow-header-inner">
        <Link className="brand-link" href="/" aria-label="InvisibleDogs Predict, volver al inicio">
          <Image src="/brand/idog-predict-logo-compacto.png" alt="" width={1448} height={1086} priority className="brand-mark" />
          <span className="brand-name">InvisibleDogs <strong>Predict</strong></span>
        </Link>
        <div className="flow-header-actions">
          <span className="flow-context"><i aria-hidden="true" />Vista Protectora</span>
          <Link className="protector-header-overview" href="/protectora">Vista general</Link>
          <LogoutButton />
          <Link className="back-home" href="/"><BackIcon />Inicio</Link>
        </div>
      </div>
    </header>
  );
}

function ProtectorProfilePhoto({ dog }: { dog: ProtectoraPetfinderProfile }) {
  return (
    <figure className="protector-profile-photo">
      <div>
        <Image
          className="protector-profile-image"
          src={dog.imagePath}
          alt={`Fotografía de ${dog.name}`}
          width={640}
          height={640}
          sizes="(max-width: 760px) 88vw, (max-width: 1040px) 42vw, 440px"
          priority
        />
      </div>
      <figcaption>Fotografía principal asociada al mismo registro histórico PetFinder.</figcaption>
    </figure>
  );
}

function ProtectorProfileMetrics({ dog }: { dog: ProtectoraPetfinderProfile }) {
  return (
    <div className="protector-profile-metrics">
      <section className="protector-profile-risk" aria-labelledby="protector-profile-risk-title">
        <div>
          <span>01</span>
          <h2 id="protector-profile-risk-title">Riesgo complementario de adopción lenta</h2>
        </div>
        <strong className={`risk-${dog.risk.toLocaleLowerCase()}`}>{dog.risk}</strong>
        <p>Este nivel aporta contexto sobre el riesgo relativo de adopción lenta en la demostración PetFinder. No mide compatibilidad, calidad del perro ni constituye una probabilidad calibrada.</p>
      </section>

      <section className="protector-profile-completeness" aria-labelledby="protector-profile-completeness-title">
        <div className="protector-profile-metric-heading">
          <div><span>02</span><h2 id="protector-profile-completeness-title">Completitud de ficha</h2></div>
          <strong>{dog.completeness} %</strong>
        </div>
        <div className="protector-profile-completeness-track" role="progressbar" aria-label={`Completitud de la ficha de ${dog.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={dog.completeness}>
          <span style={{ width: `${dog.completeness}%` }} />
        </div>
        <p>Indica cuánta información contiene la ficha; no evalúa al perro. Esta métrica es independiente del riesgo complementario.</p>
      </section>
    </div>
  );
}

function ProfileFacts({ dog }: { dog: ProtectoraPetfinderProfile }) {
  return (
    <div className="protector-profile-facts-grid">
      <section className="protector-profile-fact-card" aria-labelledby="protector-characteristics-title">
        <div className="protector-profile-section-title"><span>01</span><h3 id="protector-characteristics-title">Características</h3></div>
        <dl>
          {PROFILE_CHARACTERISTICS.map(([key, label]) => (
            <div key={key}><dt>{label}</dt><dd>{dog[key]}</dd></div>
          ))}
        </dl>
      </section>
      <section className="protector-profile-fact-card" aria-labelledby="protector-care-title">
        <div className="protector-profile-section-title"><span>02</span><h3 id="protector-care-title">Cuidados y salud</h3></div>
        <dl>
          {PROFILE_CARE.map(([key, label]) => (
            <div key={key}><dt>{label}</dt><dd className={dog[key] === "No consta" ? "value-missing" : undefined}>{dog[key]}</dd></div>
          ))}
        </dl>
        <p>Información descriptiva histórica; no constituye una recomendación médica.</p>
      </section>
    </div>
  );
}

function ProfileReview({ dog }: { dog: ProtectoraPetfinderProfile }) {
  const missingFields = REVIEWABLE_FIELDS.filter(([key]) => dog[key].trim().toLocaleLowerCase() === "no consta");
  const descriptionMissing = dog.description.trim().length === 0;
  const availableFields: string[] = [...PROFILE_CHARACTERISTICS, ...PROFILE_CARE]
    .filter(([key]) => dog[key].trim().length > 0 && dog[key].trim().toLocaleLowerCase() !== "no consta")
    .map(([, label]) => label);
  if (!descriptionMissing) availableFields.push("Descripción del perfil");

  return (
    <section className="protector-profile-review" aria-labelledby="protector-profile-review-title">
      <header className="protector-profile-content-heading">
        <div><p className="section-kicker">Lectura de los datos disponibles</p><h2 id="protector-profile-review-title">Revisión de la ficha</h2></div>
        <p>La revisión distingue los campos informados de las ausencias explícitas, sin deducir qué falta a partir del porcentaje de completitud.</p>
      </header>

      <div className="protector-profile-review-grid">
        <section className="protector-available-fields" aria-labelledby="available-fields-title">
          <h3 id="available-fields-title">Información disponible</h3>
          <ul>
            {availableFields.map((label) => <li key={label}><span aria-hidden="true">✓</span>{label}</li>)}
          </ul>
        </section>

        <section className="protector-missing-fields" aria-labelledby="missing-fields-title">
          <h3 id="missing-fields-title">Aspectos a revisar</h3>
          {missingFields.length === 0 && !descriptionMissing ? (
            <div className="protector-no-missing">
              <strong>No se han identificado campos estructurados sin información entre los datos disponibles en esta demostración.</strong>
              <p>El porcentaje de completitud puede reflejar otros componentes de la ficha que no se detallan individualmente en esta vista.</p>
            </div>
          ) : (
            <ul>
              {missingFields.map(([key, label]) => (
                <li key={key}><strong>{label} · No consta</strong><p>Completar esta información si la protectora dispone del dato.</p></li>
              ))}
              {descriptionMissing && <li><strong>Descripción del perfil</strong><p>Completar o ampliar la descripción si existe información disponible.</p></li>}
            </ul>
          )}
        </section>
      </div>

      <section className="protector-review-opportunities" aria-labelledby="review-opportunities-title">
        <div>
          <p className="section-kicker">Orientaciones descriptivas</p>
          <h3 id="review-opportunities-title">Oportunidades de revisión</h3>
        </div>
        <ul>
          {missingFields.map(([key, label]) => <li key={key}>Comprobar si existe información disponible sobre {label.toLocaleLowerCase()}.</li>)}
          {descriptionMissing && <li>Revisar si existe una descripción del perfil que pueda incorporarse.</li>}
          {missingFields.length === 0 && !descriptionMissing && <li>No se han identificado ausencias explícitas entre los campos revisables mostrados.</li>}
        </ul>
        <p>Estas orientaciones se basan en la información disponible en la ficha y no son predicciones del modelo.</p>
      </section>
    </section>
  );
}

function RiskFactorList({ title, direction, factors }: { title: string; direction: "increase" | "decrease"; factors: ProtectoraRiskFactor[] }) {
  return (
    <div className={`protector-risk-factor-column protector-risk-factor-${direction}`}>
      <h3>{title}</h3>
      {factors.length === 0 ? (
        <p className="protector-risk-factor-empty">No se han identificado factores individuales relevantes en esta dirección.</p>
      ) : (
        <ul>
          {factors.map((factor, index) => (
            <li className="protector-risk-factor-item" key={`${direction}-${index}`}>
              <div className="protector-risk-factor-heading">
                <span className="protector-risk-factor-label">
                  <strong>{factor.label}</strong>
                  {factor.tooltip && <InfoTooltip text={factor.tooltip} subjectLabel={factor.label} />}
                </span>
                {factor.value && <span className="protector-risk-factor-value">{factor.value}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProtectorRiskFactors({ explanation }: { explanation: ProtectoraRiskExplanation }) {
  return (
    <section className="protector-risk-factors" aria-labelledby="protector-risk-factors-title">
      <header className="protector-profile-content-heading">
        <div>
          <p className="section-kicker">Interpretación del modelo</p>
          <h2 id="protector-risk-factors-title" className="protector-risk-factors-title">¿Por qué tiene este nivel de riesgo?</h2>
        </div>
        <p>Estos son los principales factores del perfil que influyeron en la predicción del modelo.</p>
      </header>

      <div className="protector-risk-factors-grid">
        <RiskFactorList title="↑ Factores que aumentan la predicción" direction="increase" factors={explanation.increases} />
        <RiskFactorList title="↓ Factores que reducen la predicción" direction="decrease" factors={explanation.decreases} />
      </div>

      <p className="protector-risk-factors-note">
        <span aria-hidden="true">ⓘ</span>
        Estos factores reflejan patrones estadísticos aprendidos a partir de datos históricos. Indican cómo el modelo llegó a su predicción y no representan relaciones causales.
      </p>
    </section>
  );
}

function ProtectorProfileNotFound() {
  return (
    <main className="protector-page protector-profile-page">
      <ProtectorProfileHeader />
      <section className="protector-profile-not-found">
        <div className="page-shell">
          <p className="section-kicker">Vista Protectora</p>
          <h1>Perfil no encontrado</h1>
          <p>No encontramos el perfil solicitado en esta demostración.</p>
          <Link className="protector-profile-primary-link" href="/protectora"><BackIcon />Volver a Vista Protectora</Link>
        </div>
      </section>
      <footer className="flow-footer protector-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Revisión explicable de perfiles históricos.</p></div>
      </footer>
    </main>
  );
}

export default async function ProtectorDogProfilePage({ params }: ProtectorDogProfilePageProps) {
  const { id } = await params;
  const dog = getProtectoraPetfinderProfileById(id.toLocaleLowerCase());

  if (!dog) return <ProtectorProfileNotFound />;

  const riskExplanation = getProtectoraRiskExplanation(dog.id);

  return (
    <main className="protector-page protector-profile-page">
      <ProtectorProfileHeader />

      <section className="protector-profile-hero">
        <div className="page-shell">
          <Link className="protector-profile-back" href="/protectora"><BackIcon />Volver a Vista Protectora</Link>
          <div className="protector-profile-hero-grid">
            <ProtectorProfilePhoto dog={dog} />
            <div className="protector-profile-summary">
              <div className="protector-profile-labels"><span>Vista Protectora</span><strong>Perfil en revisión</strong></div>
              <h1>{dog.name}</h1>
              <p className="protector-profile-meta">{dog.age} <i aria-hidden="true">·</i> {dog.sex} <i aria-hidden="true">·</i> {dog.size}</p>
              <p className="protector-profile-breed">{dog.breed}</p>
              <ProtectorProfileMetrics dog={dog} />
              <aside className="protector-profile-demo-note">
                <strong>Perfil histórico</strong>
                <p>Este perfil y sus métricas proceden del artefacto histórico PetFinder preparado para la demostración.</p>
                <small>El animal mostrado no debe interpretarse como actualmente disponible para adopción.</small>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="protector-profile-content">
        <div className="page-shell">
          <section className="protector-profile-why" aria-labelledby="protector-profile-why-title">
            <div><p className="section-kicker">Riesgo relativo</p><h2 id="protector-profile-why-title">Interpretación del resultado</h2></div>
            <div>
              <p>{riskExplanation?.riskContext ?? `Este perfil presenta un nivel ${dog.risk} de riesgo complementario de adopción lenta en la demostración PetFinder.`}</p>
              <p>La completitud de la ficha se muestra como una dimensión independiente y no determina por sí sola que un perfil deba priorizarse.</p>
            </div>
          </section>

          {riskExplanation && <ProtectorRiskFactors explanation={riskExplanation} />}

          <div className="protector-profile-information-grid">
            <section className="protector-profile-about" aria-labelledby="protector-profile-about-title">
              <p className="section-kicker">Contexto descriptivo</p>
              <h2 id="protector-profile-about-title">Sobre este perfil</h2>
              <p>{dog.description}</p>
            </section>
            <section className="protector-profile-information" aria-labelledby="protector-profile-information-title">
              <header><p className="section-kicker">Datos estructurados</p><h2 id="protector-profile-information-title">Información de la ficha</h2></header>
              <ProfileFacts dog={dog} />
            </section>
          </div>

          <ProfileReview dog={dog} />

          <section className="protector-profile-model" aria-labelledby="protector-profile-model-title">
            <header className="protector-profile-content-heading protector-profile-model-heading">
              <div><p className="section-kicker">Separación metodológica</p><h2 id="protector-profile-model-title">Contexto del modelo</h2></div>
              <p>Las dos señales responden a problemas relacionados pero diferentes y no se combinan directamente.</p>
            </header>
            <div className="protector-profile-model-grid">
              <article>
                <span>PetFinder</span><h3>Riesgo complementario de adopción lenta</h3>
                <strong>{dog.risk}</strong>
                <p>Es la señal utilizada en esta demostración para aportar contexto de visibilidad.</p>
              </article>
              <article>
                <span>Austin Animal Center</span><h3>Predicción de larga estancia</h3>
                <strong>No calculado en esta demostración</strong>
                <p>El modelo de Austin requiere un conjunto de entradas compatible con su contrato analítico. No se aplica directamente a este perfil histórico de PetFinder.</p>
              </article>
            </div>
          </section>

          <section className="protector-profile-interpretation" aria-labelledby="protector-profile-interpretation-title">
            <div><p className="section-kicker">Uso responsable</p><h2 id="protector-profile-interpretation-title">Cómo interpretar esta vista</h2></div>
            <div className="protector-profile-interpretation-grid">
              <article><span>01</span><h3>Riesgo complementario</h3><p>Aporta contexto sobre adopción lenta.</p></article>
              <article><span>02</span><h3>Completitud</h3><p>Describe cuánta información contiene la ficha.</p></article>
              <article><span>03</span><h3>Criterio profesional</h3><p>La decisión sobre cualquier actuación corresponde a la protectora.</p></article>
            </div>
          </section>

          <div className="protector-profile-final">
            <div><strong>Próximas fases</strong><p>Las acciones operativas sobre los perfiles se incorporarán en fases posteriores del prototipo.</p></div>
            <Link className="protector-profile-primary-link" href="/protectora"><BackIcon />Volver a Vista Protectora</Link>
          </div>
        </div>
      </section>

      <footer className="flow-footer protector-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Perfil histórico · Revisión bajo criterio profesional.</p></div>
      </footer>
    </main>
  );
}
