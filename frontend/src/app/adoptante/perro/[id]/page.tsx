import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileFavoriteButton } from "@/components/ProfileFavoriteButton";
import { SectionDivider } from "@/components/SectionDivider";
import { FavoritesNavLink } from "@/components/adoptante/FavoritesNavLink";
import { buildAdopterProfileSummary } from "@/lib/adoptante/presentation";
import {
  createAdopterHref,
  parseAdopterSearchRequest,
  type SearchParamsRecord,
} from "@/lib/adoptante/query";
import { resolveAdopterProfileView } from "@/lib/adoptante/profile";
import type { AdopterDogResult } from "@/types/adopterResult";

type AdopterProfilePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

function AdopterProfileHeader() {
  return (
    <header className="flow-header">
      <div className="page-shell flow-header-inner">
        <Link className="brand-link" href="/" aria-label="InvisibleDogs Predict, volver al inicio">
          <Image src="/brand/idog-predict-logo-compacto.png" alt="" width={1448} height={1086} priority className="brand-mark" />
          <span className="brand-name">InvisibleDogs <strong>Predict</strong></span>
        </Link>
        <div className="flow-header-actions">
          <span className="flow-context"><i aria-hidden="true" />Recorrido Adoptante</span>
          <FavoritesNavLink />
          <Link className="back-home" href="/"><BackIcon />Inicio</Link>
        </div>
      </div>
    </header>
  );
}

function AdopterProfilePhoto({ profile }: { profile: AdopterDogResult["profile"] }) {
  return (
    <figure className="profile-gallery">
      <div className="profile-photo-frame">
        {profile.photoUrl ? (
          <Image
            src={profile.photoUrl}
            alt={`Fotografía de ${profile.displayName}`}
            fill
            sizes="(max-width: 760px) 88vw, (max-width: 1040px) 46vw, 480px"
            style={{ objectFit: "contain" }}
            priority
          />
        ) : (
          <div className="profile-photo-missing">
            <span aria-hidden="true">{profile.displayName.charAt(0) || "?"}</span>
            <p>Fotografía no disponible en esta revisión</p>
          </div>
        )}
      </div>
      <figcaption>Fotografía del registro histórico PetFinder, sin recortar para conservar el encuadre original.</figcaption>
    </figure>
  );
}

export default async function AdopterDogProfilePage({ params, searchParams }: AdopterProfilePageProps) {
  const { id } = await params;
  const request = parseAdopterSearchRequest(await searchParams);
  const state = request.state;

  const view = resolveAdopterProfileView(id, state, {
    invalidReferenceQuery: request.referenceStatus === "invalid",
  });
  if (view.status === "not-found") notFound();

  const { dog, context } = view;
  const { profile } = dog;
  const cameFromSearch = request.referenceStatus !== "none" || Object.keys(state).length > 0;
  const backToResultsHref = cameFromSearch ? createAdopterHref("/adoptante/resultados", state) : undefined;
  const summary = buildAdopterProfileSummary(profile);

  return (
    <main className="adopter-page dog-profile-page">
      <AdopterProfileHeader />

      <section className="profile-hero">
        <div className="page-shell">
          {backToResultsHref ? (
            <Link className="profile-back-link" href={backToResultsHref}><BackIcon />Volver a resultados</Link>
          ) : (
            <Link className="profile-back-link" href="/adoptante/encontrar"><BackIcon />Buscar en Adoptante</Link>
          )}

          <div className="profile-hero-grid">
            <AdopterProfilePhoto profile={profile} />

            <div className="profile-summary">
              <div className="profile-demo-label"><i aria-hidden="true" />Perfil histórico</div>
              <div className="profile-title-row">
                <div>
                  <p className="flow-eyebrow">Ficha individual</p>
                  <h1>{profile.displayName}</h1>
                </div>
                <ProfileFavoriteButton petId={profile.petId} dogName={profile.displayName} />
              </div>
              <p className="profile-meta">{profile.ageLabel} <i aria-hidden="true">·</i> {profile.sex} <i aria-hidden="true">·</i> {profile.size}</p>
              <p className="profile-breed">{profile.breedLabel}</p>

              <div className="profile-metrics">
                {context.kind === "breed" && (
                  <section className="profile-similarity" aria-label={`Similitud visual de ${profile.displayName}: ${context.similarityPercent} por ciento`}>
                    <div className="profile-metric-heading">
                      <div><span>01</span><h2>Similitud visual</h2></div>
                      <strong>{context.similarityPercent} %</strong>
                    </div>
                    <div className="profile-similarity-track" role="progressbar" aria-label="Similitud visual" aria-valuemin={0} aria-valuemax={100} aria-valuenow={context.similarityPercent}>
                      <span style={{ width: `${context.similarityPercent}%` }} />
                    </div>
                    <p>Referencia visual: {context.referenceName}</p>
                    <small>La similitud visual describe parecido en la imagen y no representa una probabilidad de raza ni compatibilidad total.</small>
                  </section>
                )}

                {context.kind === "characteristics" && (
                  <section className="compatible-profile-note" aria-label={`${profile.displayName} cumple las preferencias seleccionadas`}>
                    <span aria-hidden="true">✓</span>
                    <div>
                      <strong>Compatible con tus preferencias</strong>
                      <small>{context.preferences.length
                        ? context.preferences.map((item) => `${item.label}: ${item.value}`).join(" · ")
                        : "Sin filtros estructurados específicos"}</small>
                    </div>
                  </section>
                )}

                {context.kind === "inconsistent" && (
                  <div className="profile-demo-note">
                    <strong>Contexto no aplicable</strong>
                    <p>Este perfil no forma parte de los resultados de la búsqueda desde la que llegaste. Se muestra su ficha histórica, sin similitud ni indicación de compatibilidad.</p>
                  </div>
                )}

                <section className="profile-risk">
                  <div className="profile-metric-heading">
                    <div><span>02</span><h2>Riesgo complementario</h2></div>
                    <strong className={`profile-risk-badge risk-${profile.riskLevel.toLocaleLowerCase()}`}>{profile.riskLevel}</strong>
                  </div>
                  <p>Indicador complementario de riesgo de adopción lenta. Se muestra como contexto adicional y no mide compatibilidad con el adoptante ni determina prioridad automática.</p>
                </section>

                <section className="profile-completeness">
                  <div className="profile-metric-heading">
                    <div><span>03</span><h2>Completitud de ficha</h2></div>
                    <strong>{profile.completenessPercent} %</strong>
                  </div>
                  <div className="profile-completeness-track" role="progressbar" aria-label="Completitud de ficha" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profile.completenessPercent}>
                    <span style={{ width: `${profile.completenessPercent}%` }} />
                  </div>
                  <p>Indica cuánta información contiene la ficha; no evalúa al perro. Es independiente del riesgo y de la similitud.</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="profile-content">
        <div className="page-shell">
          <section className="profile-about" aria-labelledby="adopter-profile-about-title">
            <p className="section-kicker">Resumen de la información disponible</p>
            <div>
              <h2 id="adopter-profile-about-title">Sobre este perfil</h2>
              <p>{summary}</p>
              <small>Texto generado de forma determinista a partir de los campos estructurados de la ficha. No es la descripción histórica original ni una valoración de personalidad o comportamiento.</small>
            </div>
          </section>

          <div className="profile-details-grid">
            <section className="profile-detail-card" aria-labelledby="adopter-characteristics-title">
              <div className="profile-section-heading"><span>01</span><h2 id="adopter-characteristics-title">Características</h2></div>
              <dl className="profile-facts">
                <div><dt>Edad</dt><dd>{profile.ageLabel}</dd></div>
                <div><dt>Sexo</dt><dd>{profile.sex}</dd></div>
                <div><dt>Tamaño</dt><dd>{profile.size}</dd></div>
                <div><dt>Pelo</dt><dd>{profile.coat}</dd></div>
                <div><dt>Raza</dt><dd>{profile.breedLabel}</dd></div>
                <div><dt>Color/es</dt><dd>{profile.colorLabel}</dd></div>
              </dl>
            </section>

            <section className="profile-detail-card" aria-labelledby="adopter-care-title">
              <div className="profile-section-heading"><span>02</span><h2 id="adopter-care-title">Cuidados y salud</h2></div>
              <dl className="profile-facts">
                <div><dt>Estado de salud</dt><dd>{profile.health}</dd></div>
                <div><dt>Esterilización</dt><dd>{profile.sterilized}</dd></div>
                <div><dt>Vacunación</dt><dd>{profile.vaccinated}</dd></div>
                <div><dt>Desparasitación</dt><dd>{profile.dewormed}</dd></div>
              </dl>
              <p className="profile-health-note">Información estructurada histórica; no constituye una recomendación médica.</p>
            </section>
          </div>

          {(context.kind === "characteristics" || context.kind === "breed") && (
            <section className="profile-why" aria-labelledby="adopter-profile-why-title">
              <div className="profile-why-intro">
                <p className="section-kicker">Explicación del resultado</p>
                <h2 id="adopter-profile-why-title">Por qué aparece en tu búsqueda</h2>
                {context.kind === "characteristics" ? (
                  <p>Este perfil cumple las preferencias estructuradas que seleccionaste en el método A. Todos los resultados proceden del catálogo histórico PetFinder y se presentan sin puntuación de similitud visual.</p>
                ) : (
                  <p>Este perfil pertenece al catálogo histórico PetFinder (6.474 perfiles) y se ordenó según su similitud visual respecto a la referencia Tsinghua &ldquo;{context.referenceName}&rdquo; en el método B. La similitud describe parecido en la imagen, no una probabilidad de raza ni una compatibilidad total.</p>
                )}
              </div>
              <div className="profile-why-grid">
                {context.kind === "characteristics" ? (
                  <>
                    <article><span>01</span><h3>Preferencias</h3><p>{context.preferences.length ? context.preferences.map((item) => `${item.label}: ${item.value}`).join(" · ") : "Sin filtros estructurados específicos"}</p></article>
                    <article><span>02</span><h3>Orden</h3><p>Perfiles PetFinder compatibles, sin ranking predictivo.</p></article>
                    <article><span>03</span><h3>Riesgo complementario</h3><p>Contexto adicional independiente de la compatibilidad.</p></article>
                  </>
                ) : (
                  <>
                    <article><span>01</span><h3>Referencia Tsinghua</h3><p>{context.referenceName}, usada solo como prototipo visual.</p></article>
                    <article><span>02</span><h3>Similitud visual</h3><p>{context.similarityPercent} % de parecido, puesto {context.rank} de {context.candidateCount} perfiles comparados.</p></article>
                    <article><span>03</span><h3>Riesgo complementario</h3><p>Contexto adicional independiente de la similitud.</p></article>
                  </>
                )}
              </div>
            </section>
          )}

          <aside className="profile-demo-note">
            <strong>Perfil histórico</strong>
            <p>Este perfil procede del catálogo histórico PetFinder preparado para esta demostración. No debe interpretarse como un perro actualmente disponible para adopción; la aplicación no es un portal real de adopción.</p>
          </aside>

          <div className="results-footer-area">
            <div className="results-modify-actions">
              {backToResultsHref ? (
                <Link href={backToResultsHref}><BackIcon />Volver a resultados</Link>
              ) : (
                <Link href="/adoptante/encontrar"><BackIcon />Buscar en Adoptante</Link>
              )}
            </div>
            <aside className="historical-results-note">
              <strong>Prototipo desarrollado con datos históricos.</strong>
              <p>El nombre y la descripción originales del anuncio PetFinder permanecen intactos en los datos; esta ficha solo presenta información derivada y estructurada.</p>
            </aside>
          </div>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Perfil histórico · Catálogo PetFinder.</p></div>
      </footer>
    </main>
  );
}
