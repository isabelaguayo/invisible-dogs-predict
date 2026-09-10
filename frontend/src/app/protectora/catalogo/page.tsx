import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/protectora/LogoutButton";
import { adopterProfiles } from "@/lib/adoptante/artifacts";
import { createAdopterDogResult } from "@/lib/adoptante/presentation";
import type { AdopterDogResult } from "@/types/adopterResult";
import type { ProtectoraRiskLevel } from "@/data/protectoraPetfinderProfiles";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;
const RISK_ORDER: Record<ProtectoraRiskLevel, number> = { Alto: 3, Medio: 2, Bajo: 1 };

type CatalogSearchParams = Record<string, string | string[] | undefined>;
type CatalogPageProps = { searchParams: Promise<CatalogSearchParams> };
type CatalogSort = "risk-desc" | "risk-asc" | "completeness-asc" | "completeness-desc" | "name";

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("es-ES");
}

function buildCatalogHref({
  query,
  risk,
  sort,
  page,
}: {
  query: string;
  risk: string;
  sort: CatalogSort;
  page: number;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (risk !== "Todos") params.set("riesgo", risk);
  if (sort !== "risk-desc") params.set("orden", sort);
  if (page > 1) params.set("pagina", String(page));
  const suffix = params.toString();
  return suffix ? `/protectora/catalogo?${suffix}` : "/protectora/catalogo";
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

function CatalogHeader() {
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

function CatalogCard({ dog }: { dog: AdopterDogResult["profile"] }) {
  return (
    <article className="protector-review-card">
      <div className="protector-review-photo" style={{ aspectRatio: "16 / 9", height: "auto" }}>
        {dog.photoUrl ? (
          <Image
            className="protector-review-image"
            src={dog.photoUrl}
            alt={`Fotografía de ${dog.displayName}`}
            width={640}
            height={360}
            sizes="(max-width: 760px) 100vw, 50vw"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: dog.objectPosition }}
          />
        ) : (
          <div style={{ display: "grid", width: "100%", height: "100%", placeItems: "center", color: "var(--purple-700)", fontWeight: 700 }}>
            Fotografía no disponible
          </div>
        )}
      </div>
      <div className="protector-review-body">
        <div className="protector-review-title">
          <div><p>Perfil analizado</p><h3>{dog.displayName}</h3></div>
          <span>{dog.breedLabel}</span>
        </div>
        <p className="protector-review-meta">{dog.ageLabel} <i aria-hidden="true">·</i> {dog.sex} <i aria-hidden="true">·</i> {dog.size}</p>
        <dl>
          <div><dt>Riesgo complementario</dt><dd>{dog.riskLevel}</dd></div>
          <div><dt>Completitud de ficha</dt><dd>{dog.completenessPercent} %</dd></div>
        </dl>
        <div className="protector-review-track" role="progressbar" aria-label={`Completitud de la ficha de ${dog.displayName}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={dog.completenessPercent}>
          <span style={{ width: `${dog.completenessPercent}%` }} />
        </div>
        <p className="protector-review-context">Abre la ficha para revisar su información y consultar acciones concretas orientadas a mejorar su presentación y visibilidad.</p>
        <Link className="protector-review-action" href={`/protectora/perro/${dog.petId}`}>Revisar perfil y acciones</Link>
      </div>
    </article>
  );
}

export default async function ProtectoraCatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const query = readParam(params.q).trim();
  const riskParam = readParam(params.riesgo);
  const risk: ProtectoraRiskLevel | "Todos" = ["Bajo", "Medio", "Alto"].includes(riskParam)
    ? riskParam as ProtectoraRiskLevel
    : "Todos";
  const sortParam = readParam(params.orden);
  const sort: CatalogSort = ["risk-desc", "risk-asc", "completeness-asc", "completeness-desc", "name"].includes(sortParam)
    ? sortParam as CatalogSort
    : "risk-desc";

  const catalog = adopterProfiles.map((profile) => createAdopterDogResult(profile).profile);
  const normalizedQuery = normalize(query);
  const filtered = catalog.filter((dog) => {
    if (risk !== "Todos" && dog.riskLevel !== risk) return false;
    if (!normalizedQuery) return true;
    const haystack = normalize(`${dog.displayName} ${dog.sourceName} ${dog.breedLabel} ${dog.petId} ${dog.sex} ${dog.size}`);
    return haystack.includes(normalizedQuery);
  });

  filtered.sort((first, second) => {
    if (sort === "name") return first.displayName.localeCompare(second.displayName, "es");
    if (sort === "completeness-asc") return first.completenessPercent - second.completenessPercent;
    if (sort === "completeness-desc") return second.completenessPercent - first.completenessPercent;
    const riskDirection = sort === "risk-asc" ? 1 : -1;
    const byLevel = (RISK_ORDER[first.riskLevel] - RISK_ORDER[second.riskLevel]) * riskDirection;
    if (byLevel !== 0) return byLevel;
    return (first.riskProbability - second.riskProbability) * riskDirection;
  });

  const requestedPage = Math.max(1, Number.parseInt(readParam(params.pagina), 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const visibleDogs = filtered.slice(start, start + PAGE_SIZE);
  const firstVisible = filtered.length === 0 ? 0 : start + 1;
  const lastVisible = Math.min(start + PAGE_SIZE, filtered.length);

  return (
    <main className="protector-page">
      <CatalogHeader />

      <section className="protector-overview" style={{ paddingTop: "54px" }}>
        <div className="page-shell">
          <header className="protector-section-heading" style={{ marginBottom: "30px" }}>
            <div>
              <p className="section-kicker">Explorador de perfiles</p>
              <h1 style={{ margin: 0, fontSize: "var(--heading-md)", letterSpacing: "-0.04em", lineHeight: 1.08 }}>Explora los 6.474 perfiles históricos</h1>
            </div>
            <p>Busca cualquier perfil histórico, filtra por nivel de riesgo y ordénalo para acceder a su ficha y a las acciones recomendadas de visibilidad.</p>
          </header>

          <form method="get" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "end", marginBottom: "24px", padding: "20px", border: "1px solid rgba(91, 42, 134, 0.12)", borderRadius: "18px", background: "#fff" }}>
            <label style={{ display: "grid", gap: "7px", flex: "1 1 280px", fontSize: "0.82rem", fontWeight: 680 }}>
              Buscar perfil
              <input name="q" defaultValue={query} placeholder="Nombre, raza o PetID" style={{ minHeight: "44px", padding: "0 13px", border: "1px solid rgba(91, 42, 134, 0.18)", borderRadius: "10px", background: "#fff", color: "var(--purple-950)", font: "inherit" }} />
            </label>
            <label style={{ display: "grid", gap: "7px", flex: "1 1 180px", fontSize: "0.82rem", fontWeight: 680 }}>
              Riesgo
              <select name="riesgo" defaultValue={risk} style={{ minHeight: "44px", padding: "0 13px", border: "1px solid rgba(91, 42, 134, 0.18)", borderRadius: "10px", background: "#fff", color: "var(--purple-950)", font: "inherit" }}>
                <option>Todos</option>
                <option>Alto</option>
                <option>Medio</option>
                <option>Bajo</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: "7px", flex: "1 1 230px", fontSize: "0.82rem", fontWeight: 680 }}>
              Ordenar por
              <select name="orden" defaultValue={sort} style={{ minHeight: "44px", padding: "0 13px", border: "1px solid rgba(91, 42, 134, 0.18)", borderRadius: "10px", background: "#fff", color: "var(--purple-950)", font: "inherit" }}>
                <option value="risk-desc">Mayor riesgo primero</option>
                <option value="risk-asc">Menor riesgo primero</option>
                <option value="completeness-asc">Menor completitud primero</option>
                <option value="completeness-desc">Mayor completitud primero</option>
                <option value="name">Nombre A–Z</option>
              </select>
            </label>
            <button type="submit" className="protector-review-action" style={{ minHeight: "44px", cursor: "pointer" }}>Aplicar</button>
            <Link href="/protectora/catalogo" className="protector-header-overview" style={{ minHeight: "44px", display: "inline-flex", alignItems: "center", paddingInline: "8px" }}>Limpiar</Link>
          </form>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "22px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
            <p style={{ margin: 0 }}><strong style={{ color: "var(--purple-950)" }}>{filtered.length.toLocaleString("es-ES")}</strong> perfiles encontrados · mostrando {firstVisible.toLocaleString("es-ES")}–{lastVisible.toLocaleString("es-ES")}</p>
            <Link href="/protectora" className="protector-header-overview"><BackIcon /> Volver al resumen</Link>
          </div>

          {visibleDogs.length > 0 ? (
            <div className="protector-review-grid">
              {visibleDogs.map((dog) => <CatalogCard dog={dog} key={dog.petId} />)}
            </div>
          ) : (
            <div style={{ padding: "34px", border: "1px solid rgba(91, 42, 134, 0.12)", borderRadius: "18px", background: "#fff", textAlign: "center" }}>
              <h2 style={{ marginTop: 0 }}>No se han encontrado perfiles</h2>
              <p style={{ color: "var(--text-muted)" }}>Prueba con otro nombre, raza, PetID o nivel de riesgo.</p>
              <Link className="protector-review-action" href="/protectora/catalogo">Ver todos los perfiles</Link>
            </div>
          )}

          {filtered.length > PAGE_SIZE && (
            <nav aria-label="Paginación del explorador de perfiles" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginTop: "32px", marginBottom: "40px" }}>
              {page > 1 ? (
                <Link className="protector-review-action" href={buildCatalogHref({ query, risk, sort, page: page - 1 })}>← Anterior</Link>
              ) : <span />}
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Página {page.toLocaleString("es-ES")} de {totalPages.toLocaleString("es-ES")}</span>
              {page < totalPages ? (
                <Link className="protector-review-action" href={buildCatalogHref({ query, risk, sort, page: page + 1 })}>Siguiente →</Link>
              ) : <span />}
            </nav>
          )}
        </div>
      </section>

      <footer className="flow-footer protector-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Explorador de perfiles · Revisión y acciones de visibilidad bajo criterio profesional.</p></div>
      </footer>
    </main>
  );
}
