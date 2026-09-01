import Image from "next/image";
import Link from "next/link";
import { DogResultCard, type DogResult } from "@/components/DogResultCard";

// DEMO_RESULTS: datos exclusivamente ilustrativos para validar la interfaz.
const DEMO_RESULTS: DogResult[] = [
  { id: "nala", name: "Nala", age: "Adulto", sex: "Hembra", size: "Mediano", breed: "Mixed Breed", similarity: 92, risk: "Alto", completeness: 88 },
  { id: "bruno", name: "Bruno", age: "Joven", sex: "Macho", size: "Grande", breed: "Labrador Retriever", similarity: 89, risk: "Medio", completeness: 94 },
  { id: "kira", name: "Kira", age: "Adulto", sex: "Hembra", size: "Pequeño", breed: "Shih Tzu", similarity: 86, risk: "Bajo", completeness: 91 },
  { id: "toby", name: "Toby", age: "Senior", sex: "Macho", size: "Mediano", breed: "Beagle Mix", similarity: 82, risk: "Alto", completeness: 76 },
  { id: "coco", name: "Coco", age: "Joven", sex: "Hembra", size: "Pequeño", breed: "Poodle Mix", similarity: 78, risk: "Medio", completeness: 83 },
  { id: "milo", name: "Milo", age: "Adulto", sex: "Macho", size: "Grande", breed: "German Shepherd Mix", similarity: 74, risk: "Bajo", completeness: 69 },
];

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

export default function AdopterResultsPage() {
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
            <p>Primero se tienen en cuenta tus preferencias y, dentro de los candidatos compatibles, la referencia elegida permite ordenar los perfiles por similitud visual.</p>
            <div><span aria-hidden="true">i</span>La similitud visual describe parecido en la imagen. No mide personalidad ni compatibilidad total.</div>
          </div>
          <Image
            className="results-hero-image"
            src="/illustrations/descubrir.png"
            alt=""
            width={1024}
            height={1536}
            priority
            sizes="(max-width: 760px) 180px, (max-width: 1040px) 210px, 260px"
          />
        </div>
      </section>

      <nav className="flow-progress page-shell" aria-label="Progreso del recorrido Adoptante">
        <ol>
          <li className="progress-step progress-complete"><span aria-hidden="true">✓</span><strong>Preferencias</strong></li>
          <li className="progress-step progress-complete"><span aria-hidden="true">✓</span><strong>Referencia visual</strong></li>
          <li className="progress-step progress-active" aria-current="step"><span>03</span><strong>Resultados</strong></li>
        </ol>
      </nav>

      <section className="results-area">
        <div className="page-shell">
          <aside className="demo-results-notice" aria-labelledby="demo-results-title">
            <span>Vista de demostración</span>
            <div>
              <h2 id="demo-results-title">Perfiles y métricas ilustrativos</h2>
              <p>Los perfiles y métricas mostrados en esta pantalla son ilustrativos y se utilizan únicamente para validar la experiencia de usuario. La versión final se conectará al catálogo histórico preparado.</p>
            </div>
            <p>Los animales mostrados no deben interpretarse como actualmente disponibles para adopción.</p>
          </aside>

          <section className="results-ranking" aria-labelledby="ranking-title">
            <div>
              <p className="section-kicker">Principio de ordenación</p>
              <h2 id="ranking-title">Cómo se construye esta vista</h2>
            </div>
            <div className="ranking-sequence" aria-label="Preferencias, candidatos compatibles, similitud visual y resultados">
              <span><strong>Preferencias</strong><small>Definen la búsqueda</small></span>
              <i aria-hidden="true">→</i>
              <span><strong>Candidatos compatibles</strong><small>Conjunto filtrado</small></span>
              <i aria-hidden="true">→</i>
              <span><strong>Similitud visual</strong><small>Ordena los perfiles</small></span>
              <i aria-hidden="true">→</i>
              <span><strong>Resultados</strong><small>Vista ordenada</small></span>
            </div>
          </section>

          <section className="results-reading" aria-labelledby="reading-results-title">
            <div className="results-reading-heading"><span aria-hidden="true">i</span><h2 id="reading-results-title">Cómo leer los resultados</h2></div>
            <div className="results-reading-grid">
              <div><span>01</span><strong>Preferencias</strong><p>Definen qué perfiles entran en la búsqueda.</p></div>
              <div><span>02</span><strong>Similitud visual</strong><p>Ordena los candidatos según parecido con tu referencia.</p></div>
              <div><span>03</span><strong>Riesgo complementario</strong><p>Aporta contexto sobre perfiles que podrían necesitar mayor visibilidad.</p></div>
            </div>
          </section>

          <header className="results-list-heading">
            <div><p className="section-kicker">Resultados de tu búsqueda</p><h2>6 perfiles de demostración</h2></div>
            <div className="results-order"><span>Ordenados por</span><strong>Similitud visual</strong></div>
          </header>

          <div className="dog-results-grid">
            {DEMO_RESULTS.map((dog) => <DogResultCard dog={dog} key={dog.id} />)}
          </div>

          <div className="results-footer-area">
            <div className="results-modify-actions">
              <Link href="/adoptante/encontrar"><BackIcon />Modificar preferencias</Link>
              <Link href="/adoptante/referencia"><BackIcon />Cambiar referencia visual</Link>
            </div>
            <aside className="historical-results-note">
              <strong>Prototipo desarrollado con datos históricos.</strong>
              <p>Los seis perfiles actuales son ilustrativos. Los animales mostrados en futuras demostraciones no deben interpretarse como actualmente disponibles para adopción.</p>
            </aside>
          </div>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Preferencias, referencia visual y resultados explicables.</p></div>
      </footer>
    </main>
  );
}
