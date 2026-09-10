import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/protectora/LoginForm";
import { sanitizeProtectoraNextPath } from "@/lib/protectora/auth";

type ProtectoraLoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

function LoginHeader() {
  return (
    <header className="flow-header">
      <div className="page-shell flow-header-inner">
        <Link className="brand-link" href="/" aria-label="InvisibleDogs Predict, volver al inicio">
          <Image src="/brand/idog-predict-logo-compacto.png" alt="" width={1448} height={1086} priority className="brand-mark" />
          <span className="brand-name">InvisibleDogs <strong>Predict</strong></span>
        </Link>
        <div className="flow-header-actions">
          <Link className="back-home" href="/"><BackIcon />Inicio</Link>
        </div>
      </div>
    </header>
  );
}

export default async function ProtectoraLoginPage({ searchParams }: ProtectoraLoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeProtectoraNextPath(params.next ?? null);

  return (
    <div className="adopter-page">
      <LoginHeader />
      <section className="protectora-login-area">
        <div className="page-shell protectora-login-shell">
          <div className="protectora-login-intro">
            <p className="flow-eyebrow">Área profesional</p>
            <h1>Acceso para protectoras</h1>
            <p>Accede al área profesional de InvisibleDogs Predict.</p>
          </div>
          <div className="protectora-login-card">
            <LoginForm nextPath={nextPath} />
            <p className="protectora-login-demo-note">Acceso profesional: utiliza la credencial proporcionada.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
