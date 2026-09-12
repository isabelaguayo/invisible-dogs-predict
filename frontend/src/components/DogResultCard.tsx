"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { AdopterDogResult } from "@/types/adopterResult";
import { useAdopterFavorite } from "@/hooks/useAdopterFavorites";
import { presentPetfinderVisibleName } from "@/lib/presentation/petfinderName";

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}>
      <path d="M12 20.4S4 16 4 9.7A4.1 4.1 0 0 1 8.1 5.6c1.7 0 3.1.9 3.9 2.2.8-1.3 2.2-2.2 3.9-2.2A4.1 4.1 0 0 1 20 9.7c0 6.3-8 10.7-8 10.7Z" />
    </svg>
  );
}

export function DogResultCard({
  dog,
  profileHref,
  variant = "search",
}: {
  dog: AdopterDogResult;
  profileHref: string;
  /** "favorite": card shown on /adoptante/favoritos — no similarity/context claim (favorites can come from A, B or C, and that context isn't stored), no "por qué te lo mostramos" toggle. */
  variant?: "search" | "favorite";
}) {
  const { isFavorite, toggle } = useAdopterFavorite(dog.profile.petId);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const { profile, search } = dog;
  const visibleName = presentPetfinderVisibleName(
    profile.sourceName,
    profile.petId,
    profile.sex,
    [profile.primaryBreed, profile.secondaryBreed],
  );
  const explanationId = `result-explanation-${profile.petId}`;
  const hasVisualSimilarity = variant === "search" && search.similarityPercent !== undefined && search.rank !== undefined;
  const visualBarWidth = hasVisualSimilarity
    ? Math.min(100, Math.max(0, search.similarityPercent!))
    : undefined;

  return (
    <article
      className="dog-result-card"
      data-pet-id={profile.petId}
      data-rank={search.rank}
      data-result-mode={variant === "favorite" ? "favorite" : hasVisualSimilarity ? "similarity" : "compatible"}
    >
      <div className="result-photo">
        {profile.photoUrl ? (
          <Image
            src={profile.photoUrl}
            alt={`Fotografía de ${visibleName}`}
            fill
            sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1040px) 50vw, 33vw"
            style={{ objectFit: "cover", objectPosition: profile.objectPosition }}
          />
        ) : (
          <div className="result-photo-placeholder" aria-label={`Fotografía no disponible para el perfil de ${visibleName}`}>
            <span aria-hidden="true">{visibleName.charAt(0) || "?"}</span>
            <p>Fotografía no disponible</p>
            <small>No incluida en esta revisión</small>
          </div>
        )}
        <button
          className="favorite-button"
          type="button"
          aria-label={isFavorite ? `Quitar ${visibleName} de favoritos` : `Añadir ${visibleName} a favoritos`}
          aria-pressed={isFavorite}
          onClick={toggle}
        >
          <HeartIcon active={isFavorite} />
        </button>
      </div>

      <div className="result-card-body">
        <header className="result-dog-heading">
          <div><p>{variant === "favorite" ? "Favorito" : hasVisualSimilarity ? `Resultado ${search.rank}` : "Perfil compatible"}</p><h3>{visibleName}</h3></div>
          <span>{profile.breedLabel}</span>
        </header>

        <p className="result-dog-meta">{profile.ageLabel} <i aria-hidden="true">·</i> {profile.sex} <i aria-hidden="true">·</i> {profile.size}</p>

        {variant === "favorite" ? null : hasVisualSimilarity ? (
          <section className="similarity-metric" aria-label={`Similitud visual de ${visibleName}: ${search.similarityPercent} por ciento`}>
            <div><span>Similitud visual</span><strong>{search.similarityPercent} %</strong></div>
            <div className="metric-track" role="progressbar" aria-label="Similitud visual" aria-valuemin={0} aria-valuemax={100} aria-valuenow={visualBarWidth}>
              <span style={{ width: `${visualBarWidth}%` }} />
            </div>
          </section>
        ) : (
          <section className="compatible-profile-note" aria-label={`${visibleName} cumple las preferencias seleccionadas`}>
            <span aria-hidden="true">✓</span>
            <div><strong>Compatible con tus preferencias</strong><small>Sin puntuación de similitud visual</small></div>
          </section>
        )}

        <div className="secondary-metrics">
          <section className="risk-metric">
            <div className="metric-label">
              <span>Riesgo complementario</span>
              <span className="metric-info" tabIndex={0} role="note" aria-label="Indicador complementario de riesgo de adopción lenta. No mide compatibilidad con el adoptante." title="Indicador complementario de riesgo de adopción lenta. No mide compatibilidad con el adoptante.">i</span>
            </div>
            <strong className={`risk-level risk-${profile.riskLevel.toLocaleLowerCase()}`}>{profile.riskLevel}</strong>
          </section>

          <section className="completeness-metric">
            <div className="metric-label">
              <span>Completitud de ficha</span>
              <span className="metric-info" tabIndex={0} role="note" aria-label="Indica cuánta información contiene la ficha; no evalúa al perro.">i</span>
            </div>
            <div className="completeness-value"><strong>{profile.completenessPercent} %</strong></div>
            <div className="completeness-track" role="progressbar" aria-label="Completitud de ficha" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profile.completenessPercent}>
              <span style={{ width: `${profile.completenessPercent}%` }} />
            </div>
          </section>
        </div>

        {variant !== "favorite" && (
          <>
            <button className="result-explanation-toggle" type="button" aria-expanded={explanationOpen} aria-controls={explanationId} onClick={() => setExplanationOpen((current) => !current)}>
              Por qué te lo mostramos <span aria-hidden="true">{explanationOpen ? "−" : "+"}</span>
            </button>

            {explanationOpen && (
              <div className="result-explanation" id={explanationId}>
                <p>{hasVisualSimilarity
                  ? "Este perfil pertenece al catálogo histórico PetFinder y se ordena según su similitud visual respecto a la referencia Tsinghua elegida."
                  : "Este perfil cumple los filtros estructurados que has seleccionado. No se ha calculado similitud visual."}</p>
                {hasVisualSimilarity && profile.riskLevel === "Alto" && <p>Además, presenta un riesgo relativo alto de adopción lenta, mostrado separadamente como contexto adicional.</p>}
              </div>
            )}
          </>
        )}

        <Link className="view-profile-button" href={profileHref}>Ver ficha</Link>
      </div>
    </article>
  );
}
