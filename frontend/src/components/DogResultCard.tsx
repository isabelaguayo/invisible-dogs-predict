"use client";

import { useState } from "react";

export type RiskLevel = "Bajo" | "Medio" | "Alto";

export type DogResult = {
  id: string;
  name: string;
  age: string;
  sex: string;
  size: string;
  breed: string;
  similarity: number;
  risk: RiskLevel;
  completeness: number;
};

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}>
      <path d="M12 20.4S4 16 4 9.7A4.1 4.1 0 0 1 8.1 5.6c1.7 0 3.1.9 3.9 2.2.8-1.3 2.2-2.2 3.9-2.2A4.1 4.1 0 0 1 20 9.7c0 6.3-8 10.7-8 10.7Z" />
    </svg>
  );
}

export function DogResultCard({ dog }: { dog: DogResult }) {
  const [favorite, setFavorite] = useState(false);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const explanationId = `result-explanation-${dog.id}`;

  return (
    <article className="dog-result-card">
      <div className="result-photo">
        <div className="result-photo-placeholder" aria-label={`Espacio reservado para la fotografía del perfil de ${dog.name}`}>
          <span aria-hidden="true">{dog.name[0]}</span>
          <p>Fotografía del perfil</p>
          <small>Vista ilustrativa</small>
        </div>
        <button
          className="favorite-button"
          type="button"
          aria-label={favorite ? `Quitar a ${dog.name} de favoritos` : `Añadir a ${dog.name} a favoritos`}
          aria-pressed={favorite}
          onClick={() => setFavorite((current) => !current)}
        >
          <HeartIcon active={favorite} />
        </button>
      </div>

      <div className="result-card-body">
        <header className="result-dog-heading">
          <div><p>Perfil ilustrativo</p><h3>{dog.name}</h3></div>
          <span>{dog.breed}</span>
        </header>

        <p className="result-dog-meta">{dog.age} <i aria-hidden="true">·</i> {dog.sex} <i aria-hidden="true">·</i> {dog.size}</p>

        <section className="similarity-metric" aria-label={`Similitud visual de ${dog.name}: ${dog.similarity} por ciento`}>
          <div><span>Similitud visual</span><strong>{dog.similarity} %</strong></div>
          <div className="metric-track" role="progressbar" aria-label="Similitud visual" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dog.similarity}>
            <span style={{ width: `${dog.similarity}%` }} />
          </div>
        </section>

        <div className="secondary-metrics">
          <section className="risk-metric">
            <div className="metric-label">
              <span>Riesgo complementario</span>
              <span
                className="metric-info"
                tabIndex={0}
                role="note"
                aria-label="Score complementario de riesgo de adopción lenta. No mide compatibilidad con el adoptante."
                title="Score complementario de riesgo de adopción lenta. No mide compatibilidad con el adoptante."
              >i</span>
            </div>
            <strong className={`risk-level risk-${dog.risk.toLocaleLowerCase()}`}>{dog.risk}</strong>
          </section>

          <section className="completeness-metric">
            <div className="metric-label">
              <span>Completitud de ficha</span>
              <span className="metric-info" tabIndex={0} role="note" aria-label="Indica cuánta información contiene la ficha; no evalúa al perro.">i</span>
            </div>
            <div className="completeness-value"><strong>{dog.completeness} %</strong></div>
            <div className="completeness-track" role="progressbar" aria-label="Completitud de ficha" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dog.completeness}>
              <span style={{ width: `${dog.completeness}%` }} />
            </div>
          </section>
        </div>

        <button
          className="result-explanation-toggle"
          type="button"
          aria-expanded={explanationOpen}
          aria-controls={explanationId}
          onClick={() => setExplanationOpen((current) => !current)}
        >
          Por qué te lo mostramos <span aria-hidden="true">{explanationOpen ? "−" : "+"}</span>
        </button>

        {explanationOpen && (
          <div className="result-explanation" id={explanationId}>
            <p>Este perfil forma parte del conjunto compatible con tus preferencias y se ordena según su similitud visual respecto a la referencia elegida.</p>
            {dog.risk === "Alto" && <p>Además, presenta un riesgo relativo alto de adopción lenta, mostrado separadamente como contexto adicional.</p>}
          </div>
        )}

        <button className="view-profile-button" type="button">Ver perfil</button>
      </div>
    </article>
  );
}
