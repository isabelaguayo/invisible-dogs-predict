import Image from "next/image";
import Link from "next/link";
import { SectionDivider } from "@/components/SectionDivider";

const steps = [
  { number: "01", title: "Preferencias", description: "El adoptante define qué características busca." },
  { number: "02", title: "Similitud", description: "DINOv2 identifica perros visualmente similares a su referencia." },
  { number: "03", title: "Visibilidad", description: "El riesgo se incorpora como información complementaria para dar visibilidad a quienes podrían necesitarla más." },
];

const paths = [
  {
    eyebrow: "Adoptante",
    title: "Encuentra tu mejor match.",
    description: "Descubre perros compatibles con tus preferencias y explora nuevas posibilidades mediante similitud visual.",
    items: ["Preferencias", "Búsqueda visual", "Favoritos y comparación"],
    cta: "Descubrir mi match",
    href: "/adoptante/encontrar",
    className: "journey-adopter",
  },
  {
    eyebrow: "Protectora",
    title: "Detecta quién podría necesitar más atención.",
    description: "Una lectura operativa para comprender el riesgo y reforzar la visibilidad de los perfiles que más pueden beneficiarse de ella.",
    items: ["Riesgo", "Completitud de fichas", "Priorización"],
    cta: "Descubrir recorrido",
    href: "/protectora/login",
    className: "journey-shelter",
  },
];

const researchSources = [
  { index: "01", name: "Austin", role: "Predicción de larga estancia" },
  { index: "02", name: "PetFinder", role: "Datos, fotografías y adopción lenta" },
  { index: "03", name: "Tsinghua", role: "Validación y referencias visuales" },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="m5 10 3 3 7-7" />
    </svg>
  );
}

function StructuredIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 5h14M5 12h14M5 19h9" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.4" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 17 4.5-4.5 3 3 3-4 4.5 5.5" />
    </svg>
  );
}

function StepIcon({ name }: { name: string }) {
  if (name === "Preferencias") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h10M18 7h2M10 17h10M4 17h2M14 4v6M10 14v6" />
      </svg>
    );
  }
  if (name === "Similitud") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 5 5M8.5 10.5h4M10.5 8.5v4" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V9M10 19V5M16 19v-7M22 19V3M2 19h22" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="page-shell header-inner">
          <a className="brand-link" href="#inicio" aria-label="InvisibleDogs Predict, inicio">
            <Image src="/brand/idog-predict-logo-compacto.png" alt="" width={1448} height={1086} priority className="brand-mark" />
            <span className="brand-name">InvisibleDogs <strong>Predict</strong></span>
          </a>
          <nav className="main-nav" aria-label="Navegación principal">
            <a href="#inicio">Inicio</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#sobre-el-proyecto">Sobre el proyecto</a>
          </nav>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="page-shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow-badge"><span aria-hidden="true" />IA para adopción responsable</div>
            <h1>Tecnología para hacer visibles<span> a quienes más lo necesitan.</span></h1>
            <p className="hero-description">InvisibleDogs Predict combina predicción de larga estancia, búsqueda visual inteligente y modelado multimodal para ayudar a identificar perros que podrían necesitar una mayor visibilidad.</p>
            <div className="hero-actions" aria-label="Recorridos disponibles">
              <Link className="button button-primary" href="/adoptante/encontrar">Quiero adoptar<ArrowIcon /></Link>
              <Link className="button button-secondary" href="/protectora/login">Soy una protectora</Link>
            </div>
            <p className="technology-line">
              <span>Inteligencia Artificial</span><i aria-hidden="true" /><span>DINOv2</span><i aria-hidden="true" /><span>Modelado Multimodal</span>
            </p>
          </div>

          <div className="hero-visual" aria-label="Representación de inteligencia artificial aplicada al análisis canino">
            <div className="visual-orbit orbit-one" aria-hidden="true" />
            <div className="visual-orbit orbit-two" aria-hidden="true" />
            <div className="data-pill data-pill-top" aria-hidden="true"><span />DINOv2</div>
            <div className="data-pill data-pill-bottom" aria-hidden="true"><span />Análisis multimodal</div>
            <div className="hero-image-wrap">
              <Image src="/brand/invisibledogs-predict-logo-completo.png" alt="Símbolo de InvisibleDogs Predict: un perro integrado con visualizaciones de datos" width={1254} height={1254} priority className="hero-image" />
            </div>
            <div className="demo-card" aria-label="Ejemplo visual ficticio de una futura ficha de resultado">
              <div className="demo-label">Vista de demostración</div>
              <div className="demo-profile">
                <span className="demo-avatar" aria-hidden="true">A</span>
                <div><strong>Akira</strong><span>Perfil de ejemplo · 3 años</span></div>
              </div>
              <div className="demo-metric"><span>Similitud visual</span><strong>87 %</strong></div>
              <div className="demo-metric"><span>Riesgo relativo</span><strong className="risk-high">Alto</strong></div>
            </div>
            <div className="visual-dots" aria-hidden="true"><span /><span /><span /><span /><span /></div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="section how-section" id="como-funciona">
        <div className="page-shell">
          <div className="section-heading">
            <p className="section-kicker">Cómo funciona</p>
            <h2>Cómo funciona InvisibleDogs Predict</h2>
            <p>Preferencias, similitud visual y riesgo se utilizan como dimensiones complementarias para facilitar el descubrimiento y mejorar la visibilidad.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step" key={step.number}>
                <div className="step-marker"><span className="step-number">{step.number}</span><StepIcon name={step.title} /></div>
                <div><h3>{step.title}</h3><p>{step.description}</p></div>
              </article>
            ))}
          </div>

          <div className="how-multimodal-strip">
            <p>Datos estructurados, texto e imagen se analizan de forma complementaria para enriquecer la interpretación de los perfiles.</p>
            <div className="how-multimodal-chips" aria-hidden="true">
              <span><StructuredIcon />Datos estructurados</span>
              <span className="how-multimodal-op">+</span>
              <span><TextIcon />Texto</span>
              <span className="how-multimodal-op">+</span>
              <span><ImageIcon />Imagen</span>
              <span className="how-multimodal-op how-multimodal-arrow"><ArrowIcon /></span>
              <strong>Análisis multimodal</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section journeys-section" id="recorridos">
        <div className="page-shell">
          <div className="section-heading heading-row">
            <div><p className="section-kicker">Dos recorridos, un propósito</p><h2>Diseñado para conectar perspectivas.</h2></div>
            <p>Adoptantes y protectoras utilizan la misma tecnología desde perspectivas distintas, con un propósito común: mejorar las oportunidades de los perros que podrían pasar desapercibidos.</p>
          </div>
          <div className="journeys-grid">
            {paths.map((path) => (
              <article className={`journey ${path.className}`} key={path.eyebrow}>
                <p className="journey-eyebrow">{path.eyebrow}</p>
                <h3>{path.title}</h3>
                <p className="journey-description">{path.description}</p>
                <ul>{path.items.map((item) => <li key={item}><CheckIcon />{item}</li>)}</ul>
                {path.href ? (
                  <Link className="journey-link" href={path.href}>{path.cta} <ArrowIcon /></Link>
                ) : (
                  <span className="journey-link">{path.cta} <ArrowIcon /></span>
                )}
                <div className="journey-decoration" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section research-section" id="sobre-el-proyecto">
        <div className="page-shell research-grid">
          <div className="research-copy">
            <p className="section-kicker">Base científica</p>
            <h2>Austin responde al problema.<span> PetFinder y Tsinghua ayudan a convertirlo en una herramienta.</span></h2>
            <p>Tres fuentes con funciones distintas y una separación metodológica clara: predecir, demostrar y validar.</p>
          </div>
          <div className="research-network" aria-label="Fuentes científicas conectadas con InvisibleDogs Predict">
            <div className="research-hub"><span aria-hidden="true" />InvisibleDogs Predict</div>
            <div className="research-list">
              {researchSources.map((source) => (
                <div className="research-item" key={source.name}>
                  <span>{source.index}</span><div><h3>{source.name}</h3><p>{source.role}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="final-cta-title">
        <div className="page-shell final-cta-inner">
          <div className="cta-orbit cta-orbit-one" aria-hidden="true" />
          <div className="cta-orbit cta-orbit-two" aria-hidden="true" />
          <p className="cta-kicker">InvisibleDogs Predict</p>
          <h2 id="final-cta-title">Dos formas de utilizar una misma tecnología.</h2>
          <p>Descubre perros compatibles contigo o explora herramientas para mejorar la visibilidad de quienes podrían necesitar más atención.</p>
          <div className="cta-actions">
            <Link className="button cta-primary" href="/adoptante/encontrar">Descubrir mi match <ArrowIcon /></Link>
            <Link className="button cta-secondary" href="/protectora/login">Soy una protectora</Link>
          </div>
        </div>
      </section>

      <section className="academic-note" aria-label="Aviso académico">
        <div className="page-shell note-inner">
          <span className="note-mark" aria-hidden="true">i</span>
          <p><strong>Prototipo desarrollado con datos históricos.</strong>Los animales mostrados en futuras demostraciones no deben interpretarse como actualmente disponibles para adopción.</p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="page-shell footer-inner">
          <div className="footer-brand"><Image src="/brand/idog-predict-logo-compacto.png" alt="" width={1448} height={1086} /><span>InvisibleDogs Predict</span></div>
          <p className="footer-meta">TFM · Máster Data Science, Big Data &amp; Business Analytics · 2025–2026</p>
        </div>
      </footer>
    </main>
  );
}
