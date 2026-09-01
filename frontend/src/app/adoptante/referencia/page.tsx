"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { SectionDivider } from "@/components/SectionDivider";
import { visualReferenceBreeds, type VisualReferenceBreed } from "@/data/visualReferenceBreeds";

type ReferenceMethod = "breed" | "photo" | null;

type PhotoReference = {
  file: File;
  url: string;
};

const featuredBreeds = [
  "Shih Tzu",
  "Labrador Retriever",
  "Golden Retriever",
  "Poodle",
  "German Shepherd",
  "Beagle",
  "French Bulldog",
  "Siberian Husky",
  "Chihuahua",
  "Border Collie",
];

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 10 * 1024 * 1024;

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

function breedInitials(breed: string) {
  return breed
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}

export default function VisualReferencePage() {
  const [method, setMethod] = useState<ReferenceMethod>(null);
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PhotoReference | null>(null);
  const [breedQuery, setBreedQuery] = useState("");
  const [selectedSearchBreed, setSelectedSearchBreed] = useState<VisualReferenceBreed | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const breedSearchRef = useRef<HTMLInputElement>(null);

  const breedSuggestions = useMemo(() => {
    const normalizedQuery = breedQuery.trim().toLocaleLowerCase();
    if (!normalizedQuery) return [];

    return visualReferenceBreeds
      .filter((breed) => breed.displayName.toLocaleLowerCase().includes(normalizedQuery))
      .slice(0, 7);
  }, [breedQuery]);

  useEffect(() => {
    const objectUrl = photo?.url;

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photo]);

  function chooseBreed(breed: string, searchBreed: VisualReferenceBreed | null = null) {
    setPhoto(null);
    setFileError("");
    setSelectedBreed(breed);
    setSelectedSearchBreed(searchBreed);
    setBreedQuery("");
    setSuggestionsOpen(false);
    setMethod("breed");
  }

  function selectPhoto(file: File) {
    if (!acceptedImageTypes.includes(file.type) || file.size > maxFileSize) {
      setFileError("Utiliza una imagen JPG, PNG o WEBP de hasta 10 MB.");
      return;
    }

    setSelectedBreed(null);
    setSelectedSearchBreed(null);
    setBreedQuery("");
    setSuggestionsOpen(false);
    setFileError("");
    setPhoto({ file, url: URL.createObjectURL(file) });
    setMethod("photo");
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
    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      setIsDragging(false);
    }
  }

  function removePhoto() {
    setPhoto(null);
    setFileError("");
    setMethod(null);
  }

  function clearBreedSearch() {
    setBreedQuery("");
    setSuggestionsOpen(false);
    breedSearchRef.current?.focus();
  }

  function removeSearchedBreed() {
    setSelectedBreed(null);
    setSelectedSearchBreed(null);
    setMethod(null);
    breedSearchRef.current?.focus();
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  const canContinue = Boolean(selectedBreed || photo);

  return (
    <main className="adopter-page reference-page">
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

      <section className="flow-intro reference-intro">
        <div className="page-shell reference-intro-grid">
          <div>
            <p className="flow-eyebrow">Recorrido Adoptante</p>
            <h1>Elige tu referencia visual</h1>
          </div>
          <div className="reference-intro-copy">
            <p>Selecciona una raza de referencia o sube una fotografía para descubrir perros visualmente similares entre los candidatos compatibles con tus preferencias.</p>
            <div className="reference-choice-note">
              <span aria-hidden="true">1</span>
              <p>Puedes elegir una referencia de raza o una fotografía. Utilizaremos solo una de las dos opciones.</p>
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

      <nav className="flow-progress page-shell" aria-label="Progreso del recorrido Adoptante">
        <ol>
          <li className="progress-step progress-complete"><span aria-hidden="true">✓</span><strong>Preferencias</strong></li>
          <li className="progress-step progress-active" aria-current="step"><span>02</span><strong>Referencia visual</strong></li>
          <li className="progress-step"><span>03</span><strong>Resultados</strong></li>
        </ol>
      </nav>

      <SectionDivider />

      <section className="reference-area">
        <div className="page-shell">
          <header className="reference-heading">
            <div>
              <p className="section-kicker">Paso 2 · Referencia visual</p>
              <h2>Elige una forma de referencia</h2>
            </div>
            <p>Selecciona una raza o utiliza una fotografía. Al cambiar de método, sustituiremos la referencia anterior.</p>
          </header>

          <div className="reference-options">
            <article
              className={`reference-option${method === "breed" ? " reference-option-active" : ""}${method === "photo" ? " reference-option-secondary" : ""}`}
              aria-labelledby="breed-reference-title"
            >
              <div className="reference-option-topline">
                <span>Opción A</span>
                <strong>{method === "breed" ? "Método elegido" : "Referencia de raza"}</strong>
              </div>

              <div className="reference-option-intro">
                <div>
                  <h3 id="breed-reference-title">Elegir una referencia de raza</h3>
                  <p>Selecciona una de las razas destacadas o busca otra referencia visual disponible. Más adelante se utilizará para encontrar perros con rasgos visuales similares.</p>
                </div>
                <Image
                  src="/illustrations/seleccion.png"
                  alt=""
                  aria-hidden="true"
                  width={1448}
                  height={1086}
                  sizes="(max-width: 520px) 130px, (max-width: 1040px) 150px, 180px"
                  className="reference-method-image"
                />
              </div>

              <div className="featured-breeds-heading">
                <h4>Razas destacadas</h4>
                <p>Accesos rápidos a referencias visuales habituales.</p>
              </div>

              <div className="breed-grid" role="group" aria-label="Raza de referencia visual">
                {featuredBreeds.map((breed) => {
                  const selected = selectedBreed === breed;
                  return (
                    <button
                      className="breed-choice"
                      type="button"
                      key={breed}
                      aria-pressed={selected}
                      onClick={() => chooseBreed(breed)}
                    >
                      <span className="breed-initial" aria-hidden="true">{breedInitials(breed)}</span>
                      <span>{breed}</span>
                      <i aria-hidden="true">{selected ? "✓" : ""}</i>
                    </button>
                  );
                })}
              </div>

              <div className="breed-search">
                <label htmlFor="breed-search">Buscar otra raza</label>
                <p id="breed-search-help">Busca entre las referencias visuales disponibles.</p>
                <div className="breed-search-field">
                  <input
                    ref={breedSearchRef}
                    id="breed-search"
                    type="search"
                    value={breedQuery}
                    onChange={(event) => {
                      setBreedQuery(event.target.value);
                      setSuggestionsOpen(Boolean(event.target.value.trim()));
                    }}
                    onFocus={() => {
                      if (breedQuery.trim()) setSuggestionsOpen(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setSuggestionsOpen(false);
                        event.currentTarget.blur();
                      }
                    }}
                    placeholder="Escribe el nombre de una raza"
                    autoComplete="off"
                    aria-describedby="breed-search-help"
                  />
                  {breedQuery && <button type="button" onClick={clearBreedSearch}>Limpiar</button>}
                </div>

                {selectedSearchBreed && (
                  <div className="searched-breed-selection" aria-live="polite">
                    <div>
                      <span>Referencia seleccionada</span>
                      <strong>{selectedSearchBreed.displayName}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={removeSearchedBreed}
                      aria-label={"Eliminar " + selectedSearchBreed.displayName + " como referencia visual"}
                    >
                      ×
                    </button>
                  </div>
                )}

                {suggestionsOpen && breedQuery.trim() && (
                  <div className="breed-suggestions" id="breed-suggestions" aria-live="polite">
                    {breedSuggestions.length > 0 ? (
                      <ul>
                        {breedSuggestions.map((breed) => (
                          <li key={breed.id}>
                            <button
                              type="button"
                              aria-pressed={selectedBreed === breed.displayName}
                              onClick={() => chooseBreed(breed.displayName, breed)}
                            >
                              <span className="breed-initial" aria-hidden="true">{breedInitials(breed.displayName)}</span>
                              <span>{breed.displayName}</span>
                              <small>Seleccionar</small>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="breed-empty">No encontramos ninguna referencia con ese nombre.</p>
                    )}
                  </div>
                )}
              </div>
            </article>

            <div className="reference-or" aria-hidden="true"><span>O</span></div>

            <article
              className={`reference-option${method === "photo" ? " reference-option-active" : ""}${method === "breed" ? " reference-option-secondary" : ""}`}
              aria-labelledby="photo-reference-title"
            >
              <div className="reference-option-topline">
                <span>Opción B</span>
                <strong>{method === "photo" ? "Método elegido" : "Fotografía propia"}</strong>
              </div>

              <div className="reference-option-intro">
                <div>
                  <h3 id="photo-reference-title">Subir una fotografía</h3>
                  <p>Utiliza una imagen como referencia para buscar perros visualmente similares.</p>
                </div>
                <Image
                  src="/illustrations/subir_imagen.png"
                  alt=""
                  aria-hidden="true"
                  width={1448}
                  height={1086}
                  sizes="(max-width: 520px) 130px, (max-width: 1040px) 150px, 180px"
                  className="reference-method-image"
                />
              </div>

              <p className="photo-guidance">Para obtener una referencia más clara, utiliza una fotografía donde el perro sea visible y ocupe buena parte de la imagen.</p>

              <label className="visually-hidden" htmlFor="visual-reference-file">Seleccionar una fotografía de referencia</label>
              <input
                ref={fileInputRef}
                className="visually-hidden"
                id="visual-reference-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />

              <div
                className={`upload-zone${isDragging ? " upload-zone-dragging" : ""}${photo ? " upload-zone-preview" : ""}`}
                onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {photo ? (
                  <div className="photo-preview">
                    <div className="photo-preview-image">
                      <Image src={photo.url} alt="Previsualización de la fotografía seleccionada" fill sizes="(max-width: 920px) 80vw, 430px" unoptimized />
                    </div>
                    <div className="photo-preview-details">
                      <div><span>Fotografía seleccionada</span><strong>{photo.file.name}</strong></div>
                      <div className="photo-preview-actions">
                        <button type="button" onClick={openFilePicker}>Cambiar fotografía</button>
                        <button type="button" onClick={removePhoto}>Eliminar</button>
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

          <div className="reference-support-grid">
            <section className="visual-search-note" aria-labelledby="visual-search-title">
              <div className="visual-search-heading">
                <span aria-hidden="true">i</span>
                <div>
                  <p>Tecnología visual basada en DINOv2</p>
                  <h2 id="visual-search-title">Búsqueda por similitud visual</h2>
                </div>
              </div>
              <p>En la siguiente etapa, la referencia elegida se comparará visualmente con los perros compatibles con tus preferencias.</p>
              <div className="visual-search-sequence" aria-label="Preferencias, después referencia visual y finalmente perros similares">
                <strong>Preferencias</strong><i aria-hidden="true">→</i><strong>Referencia visual</strong><i aria-hidden="true">→</i><strong>Perros similares</strong>
              </div>
              <small>La similitud visual describe parecido en la imagen; no mide personalidad ni compatibilidad total.</small>
            </section>

            <aside className="reference-sidebar" aria-label="Resumen de la referencia visual">
              <div className="reference-summary" aria-live="polite">
                <div className="reference-summary-heading"><h2>Tu referencia</h2><span>{canContinue ? "1" : "0"}</span></div>
                {!canContinue && <p>Todavía no has elegido una referencia visual.</p>}
                {selectedBreed && (
                  <div className="reference-summary-value"><span>Referencia de raza</span><strong>{selectedBreed}</strong></div>
                )}
                {photo && (
                  <div className="reference-summary-value"><span>Fotografía seleccionada</span><strong>{photo.file.name}</strong></div>
                )}
              </div>

              <Link className="back-preferences" href="/adoptante/encontrar"><BackIcon />Volver a preferencias</Link>
              {canContinue ? (
                <Link className="results-button" href="/adoptante/resultados">Continuar a resultados <ArrowIcon /></Link>
              ) : (
                <button className="results-button" type="button" disabled>Continuar a resultados <ArrowIcon /></button>
              )}
            </aside>
          </div>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Preferencias estructuradas y una única referencia visual.</p></div>
      </footer>
    </main>
  );
}
