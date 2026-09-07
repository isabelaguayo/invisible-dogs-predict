"use client";

import Image from "next/image";
import Link from "next/link";
import { KeyboardEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionDivider } from "@/components/SectionDivider";
import { FavoritesNavLink } from "@/components/adoptante/FavoritesNavLink";
import {
  alphabeticalVisualReferenceBreeds,
  filterVisualReferenceBreeds,
  getVisualReferenceBreed,
  visualReferenceBreeds,
  type VisualReferenceBreed,
} from "@/data/visualReferenceBreeds";
import { createAdopterHref, parseAdopterSearchState } from "@/lib/adoptante/query";
import type { AdopterSearchState } from "@/types/adopterSearch";

const featuredBreedNames = [
  "Shih Tzu",
  "Labrador Retriever",
  "Golden Retriever",
  "German Shepherd",
  "Beagle",
  "French Bulldog",
  "Siberian Husky",
  "Chihuahua",
  "Border Collie",
];

const featuredBreeds = featuredBreedNames.flatMap((name) => {
  const breed = visualReferenceBreeds.find((candidate) => candidate.displayName === name);
  return breed ? [breed] : [];
});

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

function VisualReferenceContent({ initialSearchState }: { initialSearchState: AdopterSearchState }) {
  const initialBreed = initialSearchState.referenceType === "breed"
    && initialSearchState.prototypeLabel !== undefined
    ? getVisualReferenceBreed(initialSearchState.prototypeLabel)
    : undefined;
  const [selectedBreed, setSelectedBreed] = useState<string | null>(initialBreed?.displayName ?? null);
  const [selectedPrototypeLabel, setSelectedPrototypeLabel] = useState<number | null>(initialBreed?.label ?? null);
  const [breedQuery, setBreedQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const breedSearchRef = useRef<HTMLInputElement>(null);
  const breedSearchContainerRef = useRef<HTMLDivElement>(null);

  const breedSuggestions = useMemo(() => {
    return filterVisualReferenceBreeds(breedQuery);
  }, [breedQuery]);

  const selectedVisualReference = useMemo(() => (
    selectedPrototypeLabel === null
      ? null
      : visualReferenceBreeds.find((breed) => breed.label === selectedPrototypeLabel) ?? null
  ), [selectedPrototypeLabel]);

  useEffect(() => {
    if (!suggestionsOpen || breedSuggestions.length === 0) return;
    document.getElementById(`visual-reference-option-${breedSuggestions[activeSuggestionIndex]?.label}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeSuggestionIndex, breedSuggestions, suggestionsOpen]);

  function chooseBreed(breed: VisualReferenceBreed) {
    setSelectedBreed(breed.displayName);
    setSelectedPrototypeLabel(breed.label);
    setBreedQuery("");
    setSuggestionsOpen(false);
  }

  function clearBreedSearch() {
    setBreedQuery("");
    setSuggestionsOpen(true);
    setActiveSuggestionIndex(0);
    breedSearchRef.current?.focus();
  }

  function removeBreedReference() {
    setSelectedBreed(null);
    setSelectedPrototypeLabel(null);
    breedSearchRef.current?.focus();
  }

  function openBreedSelector() {
    const selectedIndex = selectedPrototypeLabel === null
      ? 0
      : breedSuggestions.findIndex((breed) => breed.label === selectedPrototypeLabel);
    setActiveSuggestionIndex(Math.max(0, selectedIndex));
    setSuggestionsOpen(true);
  }

  function handleBreedSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setSuggestionsOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!suggestionsOpen) {
        openBreedSelector();
        return;
      }

      setActiveSuggestionIndex((current) => {
        if (breedSuggestions.length === 0) return 0;
        const direction = event.key === "ArrowDown" ? 1 : -1;
        return (current + direction + breedSuggestions.length) % breedSuggestions.length;
      });
      return;
    }

    if (event.key === "Enter" && suggestionsOpen) {
      const activeBreed = breedSuggestions[activeSuggestionIndex];
      if (activeBreed) {
        event.preventDefault();
        chooseBreed(activeBreed);
      }
    }
  }

  const hasReference = selectedPrototypeLabel !== null;
  const resultsState: AdopterSearchState = selectedPrototypeLabel === null
    ? { searchMode: "breed" }
    : {
        searchMode: "breed",
        referenceType: "breed",
        prototypeLabel: selectedPrototypeLabel,
      };

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
            <FavoritesNavLink />
            <Link className="back-home" href="/"><BackIcon />Inicio</Link>
          </div>
        </div>
      </header>

      <section className="flow-intro reference-intro">
        <div className="page-shell reference-intro-grid">
          <div>
            <p className="flow-eyebrow">Recorrido Adoptante</p>
            <h1>Busca por apariencia visual</h1>
          </div>
          <div className="reference-intro-copy">
            <p>Elige una referencia visual Tsinghua para ordenar los 6.474 perfiles históricos PetFinder según su parecido.</p>
            <div className="reference-choice-note">
              <span aria-hidden="true">1</span>
              <p>La referencia solo guía la comparación visual: no es una probabilidad de raza ni una medida de compatibilidad.</p>
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
        <span><i aria-hidden="true">B</i>Búsqueda por apariencia visual</span>
      </nav>

      <SectionDivider />

      <section className="reference-area">
        <div className="page-shell">
          <header className="reference-heading">
            <div>
              <p className="section-kicker">Método B · Apariencia visual</p>
              <h2>Elige una referencia visual</h2>
            </div>
            <p>Las 130 opciones proceden del catálogo visual Tsinghua. Los resultados seguirán siendo perfiles PetFinder.</p>
          </header>

          <div className="reference-options reference-options-single">
            <article
              className={`reference-option${hasReference ? " reference-option-active" : ""}`}
              aria-labelledby="breed-reference-title"
            >
              <div className="reference-option-topline">
                <span>Opción A</span>
                <strong>{hasReference ? "Referencia elegida" : "Referencia visual"}</strong>
              </div>

              <div className="reference-option-intro">
                <div>
                  <h3 id="breed-reference-title">Elegir una referencia visual</h3>
                  <p>Selecciona una referencia destacada o busca entre las 130 disponibles para encontrar perfiles PetFinder con un aspecto visual parecido.</p>
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
                <h4>Referencias destacadas</h4>
                <p>Accesos rápidos a referencias visuales habituales.</p>
              </div>

              <div className="breed-grid" role="group" aria-label="Referencia visual">
                {featuredBreeds.map((breed) => {
                  const selected = selectedPrototypeLabel === breed.label;
                  return (
                    <button
                      className="breed-choice"
                      type="button"
                      key={breed.label}
                      aria-pressed={selected}
                      onClick={() => chooseBreed(breed)}
                    >
                      <span className="breed-initial" aria-hidden="true">{breedInitials(breed.displayName)}</span>
                      <span>{breed.displayName}</span>
                      <i aria-hidden="true">{selected ? "✓" : ""}</i>
                    </button>
                  );
                })}
              </div>

              <div
                className="breed-search"
                ref={breedSearchContainerRef}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsOpen(false);
                }}
              >
                <label htmlFor="breed-search">Buscar otra referencia visual</label>
                <p id="breed-search-help">Explora las referencias visuales disponibles y selecciona la que mejor represente el aspecto que buscas.</p>
                <div className="breed-search-field">
                  <input
                    ref={breedSearchRef}
                    id="breed-search"
                    type="search"
                    value={breedQuery}
                    onChange={(event) => {
                      setBreedQuery(event.target.value);
                      setActiveSuggestionIndex(0);
                      setSuggestionsOpen(true);
                    }}
                    onFocus={openBreedSelector}
                    onClick={openBreedSelector}
                    onKeyDown={handleBreedSearchKeyDown}
                    placeholder={selectedVisualReference?.displayName ?? "Busca o selecciona una referencia"}
                    autoComplete="off"
                    aria-describedby="breed-search-help"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={suggestionsOpen}
                    aria-controls="breed-suggestions"
                    aria-activedescendant={
                      suggestionsOpen && breedSuggestions[activeSuggestionIndex]
                        ? `visual-reference-option-${breedSuggestions[activeSuggestionIndex].label}`
                        : undefined
                    }
                  />
                  <div className="breed-search-actions">
                    {breedQuery && (
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={clearBreedSearch}
                      >
                        Limpiar
                      </button>
                    )}
                    <button
                      className="breed-search-toggle"
                      type="button"
                      aria-label={suggestionsOpen ? "Cerrar referencias visuales" : "Abrir referencias visuales"}
                      tabIndex={-1}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        if (suggestionsOpen) {
                          setSuggestionsOpen(false);
                        } else {
                          openBreedSelector();
                          breedSearchRef.current?.focus();
                        }
                      }}
                    >
                      <span aria-hidden="true">⌄</span>
                    </button>
                  </div>

                  {suggestionsOpen && (
                    <div className="breed-suggestions" id="breed-suggestions">
                      {breedSuggestions.length > 0 ? (
                        <ul role="listbox" aria-label="Referencias visuales Tsinghua">
                          {breedSuggestions.map((breed, index) => (
                            <li
                              id={`visual-reference-option-${breed.label}`}
                              key={breed.id}
                              role="option"
                              aria-selected={selectedPrototypeLabel === breed.label}
                              data-prototype-label={breed.label}
                              data-active={activeSuggestionIndex === index}
                              onMouseDown={(event) => event.preventDefault()}
                              onMouseMove={() => setActiveSuggestionIndex(index)}
                              onClick={() => chooseBreed(breed)}
                            >
                              <span className="breed-initial" aria-hidden="true">{breedInitials(breed.displayName)}</span>
                              <span>{breed.displayName}</span>
                              <small>{selectedPrototypeLabel === breed.label ? "Seleccionada" : "Seleccionar"}</small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="breed-empty">No encontramos ninguna referencia con ese nombre.</p>
                      )}
                    </div>
                  )}
                </div>

                <p className="breed-search-count" aria-live="polite">
                  {suggestionsOpen
                    ? `${breedSuggestions.length} ${breedSuggestions.length === 1 ? "referencia disponible" : "referencias disponibles"}`
                    : `${alphabeticalVisualReferenceBreeds.length} referencias visuales disponibles`}
                </p>

                {selectedVisualReference && (
                  <div className="searched-breed-selection" aria-live="polite">
                    <div>
                      <span>Referencia seleccionada</span>
                      <strong>{selectedVisualReference.displayName}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={removeBreedReference}
                      aria-label={"Eliminar " + selectedVisualReference.displayName + " como referencia visual"}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
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
              <p>El prototipo elegido se compara con los embeddings de los perfiles PetFinder para ordenarlos por parecido visual.</p>
              <div className="visual-search-sequence" aria-label="Referencia visual Tsinghua, comparación con PetFinder y resultados PetFinder">
                <strong>Referencia Tsinghua</strong><i aria-hidden="true">→</i><strong>Comparación PetFinder</strong><i aria-hidden="true">→</i><strong>Resultados PetFinder</strong>
              </div>
              <small>La similitud visual describe parecido en la imagen; no mide personalidad ni compatibilidad total.</small>
            </section>

            <aside className="reference-sidebar" aria-label="Resumen de la referencia visual">
              <div className="reference-summary" aria-live="polite">
                <div className="reference-summary-heading"><h2>Tu referencia</h2><span>{hasReference ? "1" : "0"}</span></div>
                {!hasReference && <p>Elige una de las 130 referencias visuales para iniciar esta búsqueda.</p>}
                {selectedBreed && (
                  <div className="reference-summary-value"><span>Referencia visual</span><strong>{selectedBreed}</strong></div>
                )}
              </div>

              <Link className="back-preferences" href="/adoptante/encontrar"><BackIcon />Cambiar método</Link>
              {hasReference ? (
                <Link className="results-button" href={createAdopterHref("/adoptante/resultados", resultsState)}>Ver perfiles similares <ArrowIcon /></Link>
              ) : (
                <button className="results-button" type="button" disabled>Elige una referencia <ArrowIcon /></button>
              )}
            </aside>
          </div>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Tsinghua como referencia visual. PetFinder como catálogo de resultados.</p></div>
      </footer>
    </main>
  );
}

function VisualReferencePageState() {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const state = parseAdopterSearchState(searchParams);
  return <VisualReferenceContent initialSearchState={state} key={query} />;
}

export default function VisualReferencePage() {
  return <Suspense><VisualReferencePageState /></Suspense>;
}
