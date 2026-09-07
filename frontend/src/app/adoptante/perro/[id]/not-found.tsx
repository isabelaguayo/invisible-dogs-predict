import Image from "next/image";
import Link from "next/link";

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

export default function AdopterProfileNotFound() {
  return (
    <main className="adopter-page dog-profile-page">
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

      <section className="profile-not-found">
        <div className="page-shell profile-not-found-inner">
          <p className="section-kicker">Ficha individual Adoptante</p>
          <h1>Perfil no encontrado</h1>
          <p>El identificador solicitado no corresponde a ninguno de los 6.474 perfiles históricos PetFinder disponibles.</p>
          <Link className="profile-primary-link" href="/adoptante/encontrar"><BackIcon />Buscar en Adoptante</Link>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Catálogo histórico PetFinder.</p></div>
      </footer>
    </main>
  );
}
