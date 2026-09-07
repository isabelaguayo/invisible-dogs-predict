"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DogResultCard } from "@/components/DogResultCard";
import { SectionDivider } from "@/components/SectionDivider";
import { FavoritesNavLink } from "@/components/adoptante/FavoritesNavLink";
import { useAdopterFavoritePetIds } from "@/hooks/useAdopterFavorites";
import type { AdopterFavoritesResponse } from "@/app/api/adoptante/favorites/route";
import type { AdopterDogResult } from "@/types/adopterResult";

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />
    </svg>
  );
}

function HeartOutlineIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M12 20.4S4 16 4 9.7A4.1 4.1 0 0 1 8.1 5.6c1.7 0 3.1.9 3.9 2.2.8-1.3 2.2-2.2 3.9-2.2A4.1 4.1 0 0 1 20 9.7c0 6.3-8 10.7-8 10.7Z" />
    </svg>
  );
}

function FavoritesHeader() {
  return (
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
  );
}

function FavoritesEmptyState() {
  return (
    <div className="favorites-empty-state">
      <span aria-hidden="true"><HeartOutlineIcon /></span>
      <h2>Aún no tienes perfiles favoritos</h2>
      <p>Marca el corazón de los perfiles que quieras volver a consultar.</p>
      <Link className="results-button favorites-empty-cta" href="/adoptante/encontrar">Buscar perfiles</Link>
    </div>
  );
}

type FavoritesFetchResult = { key: string; dogs: AdopterDogResult[]; error: boolean };

export default function AdopterFavoritesPage() {
  const petIds = useAdopterFavoritePetIds();
  const petIdsKey = petIds.join(",");
  // Every setState call happens only inside the effect's async callbacks —
  // never synchronously in the effect body. "Loading" is derived by
  // comparing the last-resolved key to the current one, so no separate
  // loading flag needs to be set at the top of the effect.
  const [result, setResult] = useState<FavoritesFetchResult | null>(null);

  useEffect(() => {
    if (petIds.length === 0) return;
    let cancelled = false;

    fetch("/api/adoptante/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petIds }),
    })
      .then((response) => response.json() as Promise<AdopterFavoritesResponse>)
      .then((data) => {
        if (cancelled) return;
        setResult(
          data.status === "ok"
            ? { key: petIdsKey, dogs: data.dogs, error: false }
            : { key: petIdsKey, dogs: [], error: true },
        );
      })
      .catch(() => {
        if (!cancelled) setResult({ key: petIdsKey, dogs: [], error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [petIds, petIdsKey]);

  const isCurrent = result?.key === petIdsKey;
  const loading = petIds.length > 0 && !isCurrent;
  const hasError = isCurrent && result!.error;
  const dogs = isCurrent && !result!.error ? result!.dogs : [];

  return (
    <main className="adopter-page results-page">
      <FavoritesHeader />

      <section className="flow-intro reference-intro">
        <div className="page-shell reference-intro-grid">
          <div>
            <p className="flow-eyebrow">Recorrido Adoptante</p>
            <h1>Tus perfiles favoritos</h1>
          </div>
          <div className="reference-intro-copy">
            <p>Consulta de nuevo los perfiles que has guardado durante tu búsqueda.</p>
            <div className="reference-choice-note">
              <span aria-hidden="true">i</span>
              <p>Tus favoritos se guardan en este navegador.</p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="results-area">
        <div className="page-shell">
          {petIds.length === 0 ? (
            <FavoritesEmptyState />
          ) : loading ? (
            <p className="favorites-loading">Cargando tus perfiles favoritos…</p>
          ) : hasError ? (
            <p className="favorites-loading">No hemos podido cargar tus favoritos. Inténtalo de nuevo.</p>
          ) : dogs.length === 0 ? (
            <FavoritesEmptyState />
          ) : (
            <>
              <header className="results-list-heading">
                <div>
                  <p className="section-kicker">Guardados en este navegador · {dogs.length} {dogs.length === 1 ? "perfil" : "perfiles"}</p>
                  <h2>Perfiles favoritos</h2>
                </div>
                <div className="results-order">
                  <span>Orden</span>
                  <strong>Más reciente primero</strong>
                </div>
              </header>
              <div className="dog-results-grid">
                {dogs.map((dog) => (
                  <DogResultCard
                    dog={dog}
                    key={dog.profile.petId}
                    profileHref={`/adoptante/perro/${dog.profile.petId}`}
                    variant="favorite"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Tus favoritos se guardan solo en este navegador.</p></div>
      </footer>
    </main>
  );
}
