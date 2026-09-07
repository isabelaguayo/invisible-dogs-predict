import Image from "next/image";
import Link from "next/link";

export default function AdopterResultsLoading() {
  return (
    <main className="adopter-page results-page" aria-busy="true">
      <header className="flow-header">
        <div className="page-shell flow-header-inner">
          <Link className="brand-link" href="/" aria-label="InvisibleDogs Predict, volver al inicio">
            <Image src="/brand/idog-predict-logo-compacto.png" alt="" width={1448} height={1086} priority className="brand-mark" />
            <span className="brand-name">InvisibleDogs <strong>Predict</strong></span>
          </Link>
          <div className="flow-header-actions">
            <span className="flow-context"><i aria-hidden="true" />Recorrido Adoptante</span>
          </div>
        </div>
      </header>
      <section className="results-area">
        <div className="page-shell">
          <aside className="demo-results-notice" aria-live="polite">
            <span>Procesando</span>
            <div>
              <h2>Buscando perfiles históricos</h2>
              <p>Estamos aplicando el método elegido al catálogo histórico PetFinder.</p>
            </div>
            <p>La comparación DINOv2 solo se utiliza cuando la búsqueda parte de una referencia visual.</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
