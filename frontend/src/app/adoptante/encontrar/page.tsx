import Image from "next/image";
import Link from "next/link";
import { SectionDivider } from "@/components/SectionDivider";
import { FavoritesNavLink } from "@/components/adoptante/FavoritesNavLink";

const searchMethods = [
  {
    key: "A",
    title: "Por sus características",
    description: "Filtra los perfiles según edad, sexo, tamaño, salud y otros criterios que buscas.",
    action: "Buscar por características",
    href: "/adoptante/caracteristicas",
    image: "/illustrations/caracteristicas_basicas.png",
    imageWidth: 1536,
    imageHeight: 1024,
  },
  {
    key: "B",
    title: "Por apariencia visual",
    description: "Elige una referencia visual y encuentra perfiles con una apariencia similar.",
    action: "Elegir referencia visual",
    href: "/adoptante/referencia",
    image: "/illustrations/seleccion.png",
    imageWidth: 1448,
    imageHeight: 1086,
  },
  {
    key: "C",
    title: "A partir de una fotografía",
    description: "Sube una imagen para preparar una búsqueda de perfiles con un aspecto visual similar.",
    action: "Buscar con una fotografía",
    href: "/adoptante/fotografia",
    image: "/illustrations/subir_imagen.png",
    imageWidth: 1448,
    imageHeight: 1086,
  },
] as const;

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

export default function FindDogPage() {
  return (
    <main className="adopter-page method-choice-page">
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

      <section className="flow-intro method-choice-intro">
        <div className="page-shell method-choice-intro-grid">
          <div>
            <p className="flow-eyebrow">Recorrido Adoptante</p>
            <h1>¿Cómo quieres encontrar a tu compañero?</h1>
          </div>
          <div className="flow-intro-copy">
            <p>Elige el tipo de búsqueda que mejor representa lo que tienes en mente.</p>
            <div className="flexibility-note"><span aria-hidden="true">i</span>Los resultados siempre proceden del catálogo histórico PetFinder.</div>
          </div>
          <Image
            src="/illustrations/corazon.png"
            alt=""
            aria-hidden="true"
            width={1261}
            height={1247}
            sizes="(max-width: 480px) 165px, (max-width: 760px) 190px, (max-width: 1040px) 220px, 250px"
            className="match-hero-image"
            priority
          />
        </div>
      </section>

      <SectionDivider />

      <section className="method-choice-area">
        <div className="page-shell">
          <header className="method-choice-heading">
            <div><p className="section-kicker">Tres formas independientes de buscar</p><h2>Elige tu punto de partida</h2></div>
            <p>Puedes filtrar por características, buscar por apariencia visual o preparar una búsqueda mediante fotografía.</p>
          </header>

          <div className="method-choice-grid">
            {searchMethods.map((method) => (
              <article className={`method-choice-card method-choice-${method.key.toLocaleLowerCase()}`} key={method.key}>
                <div className="method-choice-card-topline"><span>{method.key}</span><strong>Método de búsqueda</strong></div>
                <Image
                  src={method.image}
                  alt=""
                  aria-hidden="true"
                  width={method.imageWidth}
                  height={method.imageHeight}
                  sizes="(max-width: 760px) 145px, (max-width: 1040px) 160px, 180px"
                />
                <div className="method-choice-card-copy">
                  <h2>{method.title}</h2>
                  <p>{method.description}</p>
                </div>
                <Link href={method.href}>{method.action}<ArrowIcon /></Link>
              </article>
            ))}
          </div>

          <aside className="method-catalog-note">
            <strong>Un único catálogo de resultados</strong>
            <p>Las referencias Tsinghua y las fotografías sirven únicamente para la comparación visual. Las tarjetas mostradas corresponden siempre a perfiles históricos PetFinder.</p>
          </aside>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Tres métodos de búsqueda. Resultados históricos PetFinder.</p></div>
      </footer>
    </main>
  );
}
