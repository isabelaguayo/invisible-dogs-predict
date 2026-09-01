import Image from "next/image";
import Link from "next/link";
import { ProfileFavoriteButton } from "@/components/ProfileFavoriteButton";
import { SectionDivider } from "@/components/SectionDivider";
import { DEMO_DOGS, getDemoDogById, type DemoDog } from "@/data/demoDogs";

type DogProfilePageProps = {
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

export const dynamicParams = true;

export function generateStaticParams() {
  return DEMO_DOGS.map((dog) => ({ id: dog.id }));
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

function FlowHeader() {
  return (
    <header className="flow-header">
      <div className="page-shell flow-header-inner">
        <Link className="brand-link" href="/" aria-label="InvisibleDogs Predict, volver al inicio">
          <Image src="/brand/idog-predict-logo-compacto.png" alt="" width={1448} height={1086} priority className="brand-mark" />
          <span className="brand-name">InvisibleDogs <strong>Predict</strong></span>
        </Link>
        <div className="flow-header-actions">
          <span className="flow-context"><i aria-hidden="true" />Recorrido Adoptante</span>
          <Link className="back-home" href="/"><BackIcon />Inicio</Link>
        </div>
      </div>
    </header>
  );
}

function ProfileGallery({ dog }: { dog: DemoDog }) {
  return (
    <figure className="profile-gallery">
      <div className="profile-main-photo" aria-hidden="true">
        <span>{dog.name[0]}</span>
        <p>Fotografía principal</p>
        <small>Vista ilustrativa</small>
      </div>
      <div className="profile-thumbnails" aria-hidden="true">
        {["01", "02", "03"].map((number) => (
          <div key={number}>
            <span>{dog.name[0]}</span>
            <p>Vista adicional {number}</p>
          </div>
        ))}
      </div>
      <figcaption>Galería de demostración preparada para incorporar fotografías reales del perfil.</figcaption>
    </figure>
  );
}

function DogMetrics({ dog }: { dog: DemoDog }) {
  return (
    <div className="profile-metrics">
      <section className="profile-similarity" aria-labelledby="profile-similarity-title">
        <div className="profile-metric-heading">
          <div><span>01</span><h2 id="profile-similarity-title">Similitud visual</h2></div>
          <strong>{dog.similarity} %</strong>
        </div>
        <div className="profile-similarity-track" role="progressbar" aria-label="Similitud visual" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dog.similarity}>
          <span style={{ width: `${dog.similarity}%` }} />
        </div>
        <p>Indica el parecido visual con la referencia utilizada en la búsqueda.</p>
        <small>No representa compatibilidad total ni probabilidad de raza.</small>
      </section>

      <section className="profile-risk" aria-labelledby="profile-risk-title">
        <div className="profile-metric-heading">
          <div><span>02</span><h2 id="profile-risk-title">Riesgo complementario</h2></div>
          <strong className={`profile-risk-badge risk-${dog.risk.toLocaleLowerCase()}`}>{dog.risk}</strong>
        </div>
        <p>Score complementario de riesgo de adopción lenta. Se muestra como contexto adicional y no mide compatibilidad con el adoptante.</p>
      </section>

      <section className="profile-completeness" aria-labelledby="profile-completeness-title">
        <div className="profile-metric-heading">
          <div><span>03</span><h2 id="profile-completeness-title">Completitud de ficha</h2></div>
          <strong>{dog.completeness} %</strong>
        </div>
        <div className="profile-completeness-track" role="progressbar" aria-label="Completitud de ficha" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dog.completeness}>
          <span style={{ width: `${dog.completeness}%` }} />
        </div>
        <p>Indica cuánta información contiene la ficha; no evalúa al perro.</p>
      </section>
    </div>
  );
}

function ProfileNotFound() {
  return (
    <main className="adopter-page dog-profile-page">
      <FlowHeader />
      <section className="profile-not-found">
        <div className="page-shell profile-not-found-inner">
          <p className="section-kicker">Perfil de demostración</p>
          <h1>Perfil no encontrado</h1>
          <p>El identificador solicitado no corresponde a ninguno de los perfiles disponibles en esta demostración.</p>
          <Link className="profile-primary-link" href="/adoptante/resultados"><BackIcon />Volver a resultados</Link>
        </div>
      </section>
      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Perfiles y métricas explicables.</p></div>
      </footer>
    </main>
  );
}

export default async function DogProfilePage({ params }: DogProfilePageProps) {
  const { id } = await params;
  const dog = getDemoDogById(id.toLocaleLowerCase());

  if (!dog) {
    return <ProfileNotFound />;
  }

  const riskContext = `Además, presenta un riesgo complementario ${dog.risk.toLocaleLowerCase()} de adopción lenta. Esta información se muestra como contexto adicional y no determina la compatibilidad.`;

  return (
    <main className="adopter-page dog-profile-page">
      <FlowHeader />

      <section className="profile-hero">
        <div className="page-shell">
          <Link className="profile-back-link" href="/adoptante/resultados"><BackIcon />Volver a resultados</Link>

          <div className="profile-hero-grid">
            <ProfileGallery dog={dog} />

            <div className="profile-summary">
              <div className="profile-demo-label"><i aria-hidden="true" />Vista de demostración</div>
              <div className="profile-title-row">
                <div>
                  <p className="flow-eyebrow">Perfil individual</p>
                  <h1>{dog.name}</h1>
                </div>
                <ProfileFavoriteButton dogName={dog.name} />
              </div>
              <p className="profile-meta">{dog.age} <i aria-hidden="true">·</i> {dog.sex} <i aria-hidden="true">·</i> {dog.size}</p>
              <p className="profile-breed">{dog.breed}</p>

              <DogMetrics dog={dog} />

              <aside className="profile-demo-note">
                <strong>Este perfil y sus métricas son ilustrativos y se utilizan para validar la experiencia de usuario.</strong>
                <p>Los animales mostrados no deben interpretarse como actualmente disponibles para adopción.</p>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="profile-content">
        <div className="page-shell">
          <section className="profile-about" aria-labelledby="about-profile-title">
            <p className="section-kicker">Contexto del perfil</p>
            <div>
              <h2 id="about-profile-title">Sobre este perfil</h2>
              <p>{dog.description}</p>
            </div>
          </section>

          <div className="profile-details-grid">
            <section className="profile-detail-card" aria-labelledby="profile-characteristics-title">
              <div className="profile-section-heading"><span>01</span><h2 id="profile-characteristics-title">Características</h2></div>
              <dl className="profile-facts">
                {PROFILE_CHARACTERISTICS.map(([key, label]) => (
                  <div key={key}><dt>{label}</dt><dd>{dog[key]}</dd></div>
                ))}
              </dl>
            </section>

            <section className="profile-detail-card profile-care-card" aria-labelledby="profile-care-title">
              <div className="profile-section-heading"><span>02</span><h2 id="profile-care-title">Cuidados y salud</h2></div>
              <dl className="profile-facts profile-care-facts">
                {PROFILE_CARE.map(([key, label]) => (
                  <div key={key}><dt>{label}</dt><dd>{dog[key]}</dd></div>
                ))}
              </dl>
              <p className="profile-health-note">Información descriptiva de demostración; no constituye una recomendación médica.</p>
            </section>
          </div>

          <section className="profile-why" aria-labelledby="profile-why-title">
            <div className="profile-why-intro">
              <p className="section-kicker">Explicación del resultado</p>
              <h2 id="profile-why-title">Por qué te lo mostramos</h2>
              <p>Este perfil aparece entre los resultados porque forma parte del conjunto compatible con los criterios de búsqueda y presenta una similitud visual elevada respecto a la referencia elegida.</p>
            </div>
            <div className="profile-why-grid">
              <article><span>01</span><h3>Preferencias</h3><p>Cumple los criterios utilizados para formar el conjunto de candidatos.</p></article>
              <article><span>02</span><h3>Similitud visual</h3><p>Su imagen presenta una similitud visual del {dog.similarity} % respecto a la referencia utilizada.</p></article>
              <article><span>03</span><h3>Riesgo complementario</h3><p>{riskContext}</p></article>
            </div>
          </section>

          <div className="profile-final-action">
            <Link className="profile-primary-link profile-primary-link-light" href="/adoptante/resultados"><BackIcon />Volver a resultados</Link>
          </div>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Perfil demostrativo y resultados explicables.</p></div>
      </footer>
    </main>
  );
}
