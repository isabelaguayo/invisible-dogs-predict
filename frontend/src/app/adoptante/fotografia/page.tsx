"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { DogResultCard } from "@/components/DogResultCard";
import { SectionDivider } from "@/components/SectionDivider";
import { FavoritesNavLink } from "@/components/adoptante/FavoritesNavLink";
import { ADOPTER_PHOTO_ACCEPTED_TYPES, ADOPTER_PHOTO_MAX_BYTES } from "@/lib/adoptante/photoValidation";
import type { AdopterPhotoSearchResponse } from "@/app/api/adoptante/photo-search/route";
import type { AdopterDogResult } from "@/types/adopterResult";

type PhotoReference = {
  file: File;
  url: string;
};

type SearchStatus = "idle" | "loading" | "results" | "empty" | "error";

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

export default function PhotoSearchPage() {
  const [photo, setPhoto] = useState<PhotoReference | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [searchError, setSearchError] = useState("");
  const [dogs, setDogs] = useState<AdopterDogResult[]>([]);
  const [candidateCount, setCandidateCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const objectUrl = photo?.url;
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photo]);

  function selectPhoto(file: File) {
    if (!ADOPTER_PHOTO_ACCEPTED_TYPES.includes(file.type as (typeof ADOPTER_PHOTO_ACCEPTED_TYPES)[number]) || file.size > ADOPTER_PHOTO_MAX_BYTES) {
      setFileError("Utiliza una imagen JPG, PNG o WEBP de hasta 10 MB.");
      return;
    }

    setFileError("");
    setSearchStatus("idle");
    setDogs([]);
    setPhoto({ file, url: URL.createObjectURL(file) });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) selectPhoto(file);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) selectPhoto(file);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !event.currentTarget.contains(nextTarget)) setIsDragging(false);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function removePhoto() {
    setPhoto(null);
    setFileError("");
    setSearchStatus("idle");
    setDogs([]);
  }

  async function runSearch() {
    if (!photo || searchStatus === "loading") return;
    setSearchStatus("loading");
    setSearchError("");

    try {
      const body = new FormData();
      body.append("file", photo.file);
      const response = await fetch("/api/adoptante/photo-search", { method: "POST", body });
      const payload = (await response.json()) as AdopterPhotoSearchResponse;

      if (payload.status === "error") {
        setSearchStatus("error");
        setSearchError(payload.message);
        return;
      }

      setDogs(payload.dogs);
      setCandidateCount(payload.candidateCount);
      setSearchStatus(payload.status);
    } catch {
      setSearchStatus("error");
      setSearchError("No hemos podido analizar la fotografía. Inténtalo de nuevo.");
    }
  }

  const hasResults = searchStatus === "results" || searchStatus === "empty";
  const candidateCountLabel = candidateCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <main className="adopter-page reference-page photo-search-page">
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

      <section className="flow-intro reference-intro">
        <div className="page-shell reference-intro-grid">
          <div>
            <p className="flow-eyebrow">Recorrido Adoptante</p>
            <h1>Busca a partir de una fotografía</h1>
          </div>
          <div className="reference-intro-copy">
            <p>Sube una imagen para buscar perfiles PetFinder con un aspecto visual parecido, calculado con DINOv2 en un servicio local.</p>
            <div className="reference-choice-note">
              <span aria-hidden="true">i</span>
              <p>La fotografía se procesa para calcular un embedding visual y no se conserva una vez analizada.</p>
            </div>
          </div>
          <Image
            src="/illustrations/perro_gracioso.png?v=2"
            alt="Perro como referencia visual"
            width={1024}
            height={1536}
            sizes="(max-width: 480px) 175px, (max-width: 760px) 190px, (max-width: 1040px) 225px, 270px"
            className="reference-hero-image"
            priority
            unoptimized
          />
        </div>
      </section>

      <nav className="method-context-bar page-shell" aria-label="Método de búsqueda elegido">
        <Link href="/adoptante/encontrar"><BackIcon />Cambiar método</Link>
        <span><i aria-hidden="true">C</i>Búsqueda mediante fotografía</span>
      </nav>

      <SectionDivider />

      <section className="reference-area">
        <div className="page-shell">
          <header className="reference-heading">
            <div><p className="section-kicker">Método C · Fotografía</p><h2>Prepara tu referencia</h2></div>
            <p>Selecciona una fotografía donde el perro sea claramente visible y pulsa &ldquo;Buscar perfiles similares&rdquo;.</p>
          </header>

          <div className="reference-options reference-options-single photo-reference-single">
            <article className={`reference-option${photo ? " reference-option-active" : ""}`} aria-labelledby="photo-reference-title">
              <div className="reference-option-topline">
                <span>Fotografía</span>
                <strong>{photo ? "Imagen preparada" : "Referencia propia"}</strong>
              </div>

              <div className="reference-option-intro">
                <div>
                  <h3 id="photo-reference-title">Subir una fotografía</h3>
                  <p>La imagen se compara directamente con los embeddings visuales de los perfiles PetFinder.</p>
                </div>
                <Image src="/illustrations/subir_imagen.png" alt="" aria-hidden="true" width={1448} height={1086} sizes="(max-width: 520px) 130px, 180px" className="reference-method-image" />
              </div>

              <p className="photo-guidance">Utiliza una fotografía donde el perro sea visible y ocupe buena parte de la imagen.</p>
              <label className="visually-hidden" htmlFor="photo-search-file">Seleccionar una fotografía de referencia</label>
              <input ref={fileInputRef} className="visually-hidden" id="photo-search-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />

              <div
                className={`upload-zone${isDragging ? " upload-zone-dragging" : ""}${photo ? " upload-zone-preview" : ""}`}
                onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {photo ? (
                  <div className="photo-preview">
                    <div className="photo-preview-image"><Image src={photo.url} alt="Previsualización de la fotografía seleccionada" fill sizes="(max-width: 920px) 80vw, 660px" unoptimized /></div>
                    <div className="photo-preview-details">
                      <div><span>Fotografía seleccionada</span><strong>{photo.file.name}</strong></div>
                      <div className="photo-preview-actions">
                        <button type="button" onClick={openFilePicker} disabled={searchStatus === "loading"}>Cambiar fotografía</button>
                        <button type="button" onClick={removePhoto} disabled={searchStatus === "loading"}>Eliminar</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <strong>Arrastra una fotografía aquí</strong>
                    <span>o selecciónala desde tu dispositivo</span>
                    <button type="button" onClick={openFilePicker}>Seleccionar fotografía</button>
                    <small>JPG, PNG o WEBP · máx. 10 MB</small>
                  </div>
                )}
              </div>
              {fileError && <p className="file-error" role="alert">{fileError}</p>}
            </article>
          </div>

          {!hasResults && (
            <div className="photo-search-status" aria-live="polite">
              <div>
                <span aria-hidden="true">i</span>
                <p>
                  <strong>{photo ? "Todo listo para analizar tu fotografía." : "Selecciona una fotografía para continuar."}</strong>{" "}
                  {photo
                    ? "Se calculará un embedding visual DINOv2 y se comparará con los 6.474 perfiles PetFinder preparados."
                    : "Sube una imagen para buscar perfiles PetFinder con un aspecto visual parecido."}
                </p>
              </div>
              <button className="results-button" type="button" disabled={!photo || searchStatus === "loading"} onClick={runSearch}>
                {searchStatus === "loading" ? "Analizando la fotografía…" : "Buscar perfiles similares"}
              </button>
            </div>
          )}

          {searchStatus === "error" && (
            <section className="results-reading" aria-live="polite">
              <p className="section-kicker">Búsqueda no disponible</p>
              <div className="results-reading-heading"><span aria-hidden="true">i</span><h2>No hemos podido completar el análisis</h2></div>
              <p>{searchError}</p>
              <button className="results-button" type="button" onClick={runSearch}>Intentar de nuevo</button>
            </section>
          )}

          {hasResults && (
            <>
              <aside className="demo-results-notice" aria-labelledby="photo-search-summary-title">
                <span>Catálogo histórico</span>
                <div>
                  <h2 id="photo-search-summary-title">Referencia: fotografía proporcionada</h2>
                  <p>Los perfiles proceden del catálogo histórico PetFinder preparado para esta demostración y no representan perros actualmente disponibles para adopción.</p>
                </div>
                <p><strong>Fotografía analizada:</strong><br />{photo?.file.name}</p>
              </aside>

              <section className="results-ranking" aria-labelledby="photo-ranking-title">
                <div>
                  <p className="section-kicker">Principio de ordenación</p>
                  <h2 id="photo-ranking-title">Cómo se construye esta vista</h2>
                </div>
                <div className="ranking-sequence" aria-label="Fotografía de referencia, DINOv2, perfiles PetFinder, similitud visual y resultados">
                  <span><strong>Fotografía</strong><small>Referencia propia</small></span>
                  <i aria-hidden="true">→</i>
                  <span><strong>DINOv2</strong><small>Embedding visual 384D</small></span>
                  <i aria-hidden="true">→</i>
                  <span><strong>Perfiles PetFinder</strong><small>6.474 perfiles históricos</small></span>
                  <i aria-hidden="true">→</i>
                  <span><strong>Similitud visual</strong><small>Ordena los perfiles</small></span>
                  <i aria-hidden="true">→</i>
                  <span><strong>Resultados</strong><small>Vista ordenada</small></span>
                </div>
              </section>

              <section className="results-reading" aria-labelledby="photo-reading-title">
                <div className="results-reading-heading"><span aria-hidden="true">i</span><h2 id="photo-reading-title">Cómo leer los resultados</h2></div>
                <div className="results-reading-grid">
                  <div><span>01</span><strong>Catálogo PetFinder</strong><p>Todos los resultados son perfiles históricos PetFinder.</p></div>
                  <div><span>02</span><strong>Similitud visual</strong><p>Describe parecido visual entre tu fotografía y la imagen del perfil. No es probabilidad de raza, compatibilidad ni probabilidad de adopción.</p></div>
                  <div><span>03</span><strong>Indicador complementario</strong><p>Aporta contexto sobre perfiles que podrían necesitar mayor visibilidad.</p></div>
                </div>
              </section>

              {searchStatus === "empty" ? (
                <section className="results-reading" aria-live="polite">
                  <p className="section-kicker">0 candidatos</p>
                  <div className="results-reading-heading"><span aria-hidden="true">i</span><h2>No se han encontrado perfiles comparables</h2></div>
                  <p>Prueba con otra fotografía.</p>
                </section>
              ) : (
                <>
                  <header className="results-list-heading">
                    <div>
                      <p className="section-kicker">Resultados de tu búsqueda · {candidateCountLabel} perfiles comparados</p>
                      <h2>{dogs.length} perfiles históricos</h2>
                    </div>
                    <div className="results-order"><span>Ordenados por</span><strong>Similitud visual</strong></div>
                  </header>
                  <div className="dog-results-grid">
                    {dogs.map((dog) => (
                      <DogResultCard dog={dog} key={dog.profile.petId} profileHref={`/adoptante/perro/${dog.profile.petId}`} />
                    ))}
                  </div>
                </>
              )}

              <div className="results-footer-area">
                <div className="results-modify-actions">
                  <button type="button" onClick={removePhoto}><BackIcon />Cambiar fotografía</button>
                </div>
                <aside className="historical-results-note">
                  <strong>Prototipo desarrollado con datos históricos.</strong>
                  <p>Los perfiles mostrados proceden del catálogo histórico preparado. No deben interpretarse como animales actualmente disponibles para adopción.</p>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Búsqueda visual mediante fotografía, procesada en local.</p></div>
      </footer>
    </main>
  );
}
