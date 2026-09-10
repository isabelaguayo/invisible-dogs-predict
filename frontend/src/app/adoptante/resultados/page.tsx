import Image from "next/image";
import Link from "next/link";
import { DogResultCard } from "@/components/DogResultCard";
import { SectionDivider } from "@/components/SectionDivider";
import { FavoritesNavLink } from "@/components/adoptante/FavoritesNavLink";
import { getVisualReferenceBreed } from "@/data/adoptante/catalogs";
import { createAdopterPreferenceSummary } from "@/lib/adoptante/presentation";
import {
  adopterCharacteristicsOnly,
  createAdopterHref,
  parseAdopterSearchRequest,
  type SearchParamsRecord,
} from "@/lib/adoptante/query";
import { resolveAdopterResults, type AdopterResultsView } from "@/lib/adoptante/results";
import type { AdopterSearchState } from "@/types/adopterSearch";

type AdopterResultsPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

function ResultState({ view, searchState }: { view: AdopterResultsView; searchState: AdopterSearchState }) {
  if (view.status === "results") {
    const visuallyRanked = view.mode === "similarity";
    const candidateCountLabel = visuallyRanked
      ? String(view.candidateCount).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : String(view.candidateCount);
    return (
      <>
        <header className="results-list-heading">
          <div>
            <p className="section-kicker">Resultados de tu búsqueda · {candidateCountLabel} {visuallyRanked ? "perfiles comparados" : "candidatos compatibles"}</p>
            <h2>{visuallyRanked
              ? `${view.dogs.length} perfiles históricos`
              : "Perfiles compatibles con tus preferencias"}</h2>
          </div>
          <div className="results-order">
            <span>{visuallyRanked ? "Ordenados por" : "Vista"}</span>
            <strong>{visuallyRanked ? "Similitud visual" : "Perfiles compatibles"}</strong>
          </div>
        </header>
        <div className="dog-results-grid">
          {view.dogs.map((dog) => (
            <DogResultCard
              dog={dog}
              key={dog.profile.petId}
              profileHref={createAdopterHref(`/adoptante/perro/${dog.profile.petId}`, searchState)}
            />
          ))}
        </div>
      </>
    );
  }

  if (view.status === "empty") {
    return (
      <section className="results-reading" aria-live="polite">
        <p className="section-kicker">0 candidatos compatibles</p>
        <div className="results-reading-heading"><span aria-hidden="true">i</span><h2>No hay resultados con estos filtros</h2></div>
        <p>No hemos relajado tus preferencias. Puedes modificarlas y realizar una nueva búsqueda.</p>
      </section>
    );
  }

  const content = {
    "photo-pending": {
      kicker: "Búsqueda por fotografía",
      title: "Continúa la búsqueda desde el método de fotografía",
      description: "Utiliza el método C para subir una fotografía y obtener resultados mediante DINOv2.",
    },
    "invalid-reference": {
      kicker: "Referencia visual no válida",
      title: "La referencia visual está incompleta",
      description: "La URL contiene una referencia sin todos los datos necesarios. Puedes volver y seleccionar una referencia Tsinghua válida o elegir otro método de búsqueda.",
    },
    error: {
      kicker: "Búsqueda no disponible",
      title: "No hemos podido consultar los perfiles",
      description: "No hemos podido completar la consulta. Puedes volver a intentarlo desde el paso anterior.",
    },
  }[view.status];

  return (
    <section className="results-reading" aria-live="polite">
      <p className="section-kicker">{content.kicker}</p>
      <div className="results-reading-heading"><span aria-hidden="true">i</span><h2>{content.title}</h2></div>
      <p>{content.description}</p>
    </section>
  );
}

export default async function AdopterResultsPage({ searchParams }: AdopterResultsPageProps) {
  const request = parseAdopterSearchRequest(await searchParams);
  const searchState = request.state;
  const view = resolveAdopterResults(searchState, {
    invalidReferenceQuery: request.referenceStatus === "invalid",
  });
  const isResolvedView = view.status === "results" || view.status === "empty";
  const hasVisualRanking = isResolvedView && view.mode === "similarity";
  const isPhotoMode = searchState.searchMode === "photo" || searchState.referenceType === "photo";
  const isBreedMode = searchState.searchMode === "breed" || hasVisualRanking;
  const isCharacteristicsMode = searchState.searchMode === "characteristics"
    || (!isBreedMode && !isPhotoMode && isResolvedView && view.mode === "compatible");
  const preferences = isCharacteristicsMode ? adopterCharacteristicsOnly(searchState) : {};
  const preferenceSummary = createAdopterPreferenceSummary(preferences);
  const selectedBreed = searchState.prototypeLabel === undefined
    ? undefined
    : getVisualReferenceBreed(searchState.prototypeLabel)?.displayName;
  const referenceName = isResolvedView
    ? view.referenceName ?? "Sin referencia visual"
    : searchState.referenceType === "photo"
      ? "Fotografía propia"
      : selectedBreed ?? "Sin referencia válida";
  const methodLabel = isBreedMode
    ? "Búsqueda por apariencia visual"
    : isCharacteristicsMode
      ? "Búsqueda por características"
      : isPhotoMode
        ? "Búsqueda mediante fotografía"
        : "Resultados de búsqueda";
  const methodKey = isBreedMode ? "B" : isCharacteristicsMode ? "A" : isPhotoMode ? "C" : "·";

  return (
    <main className="adopter-page results-page">
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

      <section className="results-intro">
        <div className="page-shell results-intro-grid">
          <div>
            <p className="flow-eyebrow">Paso 3 · Resultados</p>
            <h1>Descubre perros que podrían encajar en tu búsqueda</h1>
          </div>
          <div className="results-intro-copy">
            <p>{isBreedMode
              ? "La referencia visual Tsinghua permite ordenar los perfiles históricos PetFinder según su parecido, sin convertirlos en registros de raza Tsinghua."
              : "Tus preferencias estructuradas definen los perfiles PetFinder compatibles, sin ejecutar comparación visual."}</p>
            <div><span aria-hidden="true">i</span>{isBreedMode
              ? "La similitud visual describe parecido en la imagen. No mide personalidad ni compatibilidad total."
              : "Esta vista no utiliza una puntuación visual ni relaja los filtros seleccionados."}</div>
          </div>
          <Image className="results-hero-image" src="/illustrations/descubrir.png" alt="" width={1024} height={1536} priority sizes="(max-width: 760px) 180px, (max-width: 1040px) 210px, 260px" />
        </div>
      </section>

      <nav className="method-context-bar page-shell" aria-label="Método de búsqueda utilizado">
        <Link href="/adoptante/encontrar"><BackIcon />Cambiar método</Link>
        <span><i aria-hidden="true">{methodKey}</i>{methodLabel}</span>
      </nav>

      <SectionDivider />

      <section className="results-area">
        <div className="page-shell">
          <aside className="demo-results-notice" aria-labelledby="search-summary-title">
            <span>Datos históricos</span>
            <div>
              <h2 id="search-summary-title">{isBreedMode
                ? `Referencia visual: ${referenceName}`
                : "Método: por características"}</h2>
              <p>Los perfiles proceden de datos históricos PetFinder y no reflejan disponibilidad actual para adopción.</p>
            </div>
            <p><strong>Preferencias activas:</strong><br />{preferenceSummary.length
              ? preferenceSummary.map((item) => `${item.label}: ${item.value}`).join(" · ")
              : "Sin filtros estructurados específicos."}</p>
          </aside>

          <section className="results-ranking" aria-labelledby="ranking-title">
            <div>
              <p className="section-kicker">{isBreedMode ? "Principio de ordenación" : "Proceso de selección"}</p>
              <h2 id="ranking-title">Cómo se construye esta vista</h2>
            </div>
            <div className="ranking-sequence" aria-label={isBreedMode
              ? "Referencia Tsinghua, perfiles PetFinder, similitud visual y resultados"
              : "Preferencias, candidatos compatibles y resultados"}>
              <span><strong>{isBreedMode ? "Referencia Tsinghua" : "Preferencias"}</strong><small>{isBreedMode ? "Referencia visual" : "Definen la búsqueda"}</small></span>
              <i aria-hidden="true">→</i>
              <span><strong>{isBreedMode ? "Perfiles PetFinder" : "Candidatos compatibles"}</strong><small>{isBreedMode ? "6.474 perfiles históricos" : "Conjunto filtrado"}</small></span>
              {isBreedMode && <><i aria-hidden="true">→</i><span><strong>Similitud visual</strong><small>Ordena los perfiles</small></span></>}
              <i aria-hidden="true">→</i>
              <span><strong>Resultados</strong><small>{isBreedMode ? "Vista ordenada" : "Perfiles compatibles"}</small></span>
            </div>
          </section>

          <section className="results-reading" aria-labelledby="reading-results-title">
            <div className="results-reading-heading"><span aria-hidden="true">i</span><h2 id="reading-results-title">Cómo leer los resultados</h2></div>
            <div className="results-reading-grid">
              <div><span>01</span><strong>{isBreedMode ? "Catálogo PetFinder" : "Preferencias"}</strong><p>{isBreedMode
                ? "Todos los resultados son perfiles históricos PetFinder."
                : "Definen qué perfiles entran en la búsqueda."}</p></div>
              <div><span>02</span><strong>{isBreedMode ? "Similitud visual" : "Orden neutro"}</strong><p>{isBreedMode
                ? "Ordena los candidatos según parecido con tu referencia."
                : "Presenta los perfiles compatibles por PetID, sin puntuación predictiva."}</p></div>
              <div><span>03</span><strong>Riesgo complementario</strong><p>Aporta contexto sobre perfiles que podrían necesitar mayor visibilidad.</p></div>
            </div>
          </section>

          <ResultState view={view} searchState={searchState} />

          <div className="results-footer-area">
            <div className="results-modify-actions">
              {isCharacteristicsMode && <Link href={createAdopterHref("/adoptante/caracteristicas", searchState)}><BackIcon />Modificar características</Link>}
              {isBreedMode && <Link href={createAdopterHref("/adoptante/referencia", searchState)}><BackIcon />Cambiar referencia visual</Link>}
              <Link href="/adoptante/encontrar"><BackIcon />Cambiar método</Link>
            </div>
            <aside className="historical-results-note">
              <strong>Información basada en datos históricos.</strong>
              <p>Los perfiles mostrados proceden de datos históricos PetFinder y no reflejan disponibilidad actual para adopción.</p>
            </aside>
          </div>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Tres métodos independientes y resultados explicables.</p></div>
      </footer>
    </main>
  );
}