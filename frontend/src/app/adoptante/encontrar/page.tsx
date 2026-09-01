"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ColorSwatch } from "@/components/PreferenceIllustrations";
import { SectionDivider } from "@/components/SectionDivider";

type PreferenceKey =
  | "age"
  | "gender"
  | "size"
  | "fur"
  | "health"
  | "sterilized"
  | "vaccinated"
  | "dewormed"
  | "breed"
  | "color";

type PreferenceField = {
  key: PreferenceKey;
  label: string;
  hint?: string;
  options: string[];
};

type PreferenceIllustration = {
  src: string;
  width: number;
  height: number;
};

const INDIFFERENT = "Indiferente";

const preferenceGroups: Array<{
  number: string;
  title: string;
  description: string;
  illustration: PreferenceIllustration;
  fields: PreferenceField[];
}> = [
  {
    number: "01",
    title: "Características básicas",
    description: "El punto de partida para definir el perfil que tienes en mente.",
    illustration: {
      src: "/illustrations/caracteristicas_basicas.png",
      width: 1536,
      height: 1024,
    },
    fields: [
      { key: "age", label: "Edad", options: [INDIFFERENT, "Cachorro", "Joven", "Adulto", "Senior"] },
      { key: "gender", label: "Sexo", options: [INDIFFERENT, "Hembra", "Macho"] },
      { key: "size", label: "Tamaño adulto", options: [INDIFFERENT, "Pequeño", "Mediano", "Grande", "Muy grande"] },
      { key: "fur", label: "Pelo", options: [INDIFFERENT, "Corto", "Medio", "Largo"] },
    ],
  },
  {
    number: "02",
    title: "Cuidados y salud",
    description: "Puedes indicar si alguno de estos aspectos es importante en tu búsqueda.",
    illustration: {
      src: "/illustrations/salud.png",
      width: 1448,
      height: 1086,
    },
    fields: [
      {
        key: "health",
        label: "Estado de salud",
        hint: "Indica si este aspecto es importante para ti.",
        options: [INDIFFERENT, "Saludable", "Necesidades leves", "Necesidades relevantes"],
      },
      { key: "sterilized", label: "Esterilización", options: [INDIFFERENT, "Sí", "No", "No consta"] },
      { key: "vaccinated", label: "Vacunación", options: [INDIFFERENT, "Sí", "No", "No consta"] },
      { key: "dewormed", label: "Desparasitación", options: [INDIFFERENT, "Sí", "No", "No consta"] },
    ],
  },
  {
    number: "03",
    title: "Aspecto",
    description: "Añade preferencias de raza o color solo si son relevantes para ti.",
    illustration: {
      src: "/illustrations/aspecto.png",
      width: 1254,
      height: 1254,
    },
    fields: [
      {
        key: "breed",
        label: "Raza",
        hint: "Elige una raza solo si forma parte de tus preferencias.",
        // MOCK: estas opciones se reemplazarán por el catálogo real de razas.
        options: [INDIFFERENT, "Shih Tzu", "Labrador Retriever", "Poodle", "German Shepherd", "Golden Retriever", "Mixed Breed"],
      },
      {
        key: "color",
        label: "Color",
        hint: "Puedes indicar un color preferido o dejarlo como indiferente.",
        // MOCK: selección visual provisional basada en ejemplos del catálogo.
        options: [INDIFFERENT, "Negro", "Blanco", "Marrón", "Crema", "Dorado", "Gris"],
      },
    ],
  },
];

const initialPreferences = preferenceGroups
  .flatMap((group) => group.fields)
  .reduce<Record<PreferenceKey, string>>(
    (state, field) => ({ ...state, [field.key]: INDIFFERENT }),
    {} as Record<PreferenceKey, string>,
  );

const labels = preferenceGroups
  .flatMap((group) => group.fields)
  .reduce<Record<PreferenceKey, string>>(
    (state, field) => ({ ...state, [field.key]: field.label }),
    {} as Record<PreferenceKey, string>,
  );

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

export default function FindDogPage() {
  const [preferences, setPreferences] = useState(initialPreferences);

  const selectedPreferences = useMemo(
    () =>
      (Object.entries(preferences) as Array<[PreferenceKey, string]>).filter(
        ([, value]) => value !== INDIFFERENT,
      ),
    [preferences],
  );

  function selectPreference(key: PreferenceKey, value: string) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function clearPreferences() {
    setPreferences(initialPreferences);
  }

  return (
    <main className="adopter-page">
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

      <section className="flow-intro">
        <div className="page-shell flow-intro-grid">
          <div>
            <p className="flow-eyebrow">Recorrido Adoptante</p>
            <h1>Encuentra tu match</h1>
          </div>
          <div className="flow-intro-copy">
            <p>Cuéntanos qué estás buscando. Utilizaremos tus preferencias para reducir los candidatos antes de aplicar la búsqueda visual.</p>
            <div className="flexibility-note"><span aria-hidden="true">i</span>No necesitas completar todos los criterios. Puedes dejar cualquier preferencia como “Indiferente”.</div>
          </div>
          <Image
            src="/illustrations/corazon.png"
            alt=""
            aria-hidden="true"
            width={1261}
            height={1247}
            sizes="(max-width: 480px) 180px, (max-width: 760px) 200px, (max-width: 1040px) 220px, 270px"
            className="match-hero-image"
            priority
          />
        </div>
      </section>

      <nav className="flow-progress page-shell" aria-label="Progreso del recorrido Adoptante">
        <ol>
          <li className="progress-step progress-active" aria-current="step"><span>01</span><strong>Preferencias</strong></li>
          <li className="progress-step"><span>02</span><strong>Referencia visual</strong></li>
          <li className="progress-step"><span>03</span><strong>Resultados</strong></li>
        </ol>
      </nav>

      <SectionDivider />

      <section className="preferences-area">
        <div className="page-shell preferences-layout">
          <div className="preferences-main">
            <div className="preferences-heading">
              <div><p className="section-kicker">Paso 1 · Preferencias</p><h2>¿Qué estás buscando?</h2></div>
              <p>Selecciona únicamente aquello que realmente sea importante para ti.</p>
            </div>

            <form className="preferences-form">
              {preferenceGroups.map((group) => (
                <section className="preference-group" key={group.number} aria-labelledby={`group-${group.number}`}>
                  <header className="preference-group-heading">
                    <span>{group.number}</span>
                    <div><h3 id={`group-${group.number}`}>{group.title}</h3><p>{group.description}</p></div>
                    <Image
                      src={group.illustration.src}
                      alt=""
                      aria-hidden="true"
                      width={group.illustration.width}
                      height={group.illustration.height}
                      sizes="(max-width: 760px) 118px, (max-width: 1040px) 135px, 150px"
                      className="preference-section-image"
                    />
                  </header>
                  <div className={`fields-grid fields-${group.fields.length}`}>
                    {group.fields.map((field) => (
                      <fieldset className="preference-field" key={field.key}>
                        <legend>{field.label}</legend>
                        {field.hint && <p className="field-hint">{field.hint}</p>}
                        <div className="chips" role="group" aria-label={`Preferencia de ${field.label}`}>
                          {field.options.map((option) => {
                            const selected = preferences[field.key] === option;
                            return (
                              <button
                                className="preference-chip"
                                type="button"
                                key={option}
                                aria-pressed={selected}
                                onClick={() => selectPreference(field.key, option)}
                              >
                                {field.key === "color" && option !== INDIFFERENT && <ColorSwatch color={option} />}
                                <span className="chip-indicator" aria-hidden="true" />
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </section>
              ))}
            </form>
          </div>

          <aside className="preferences-aside" aria-label="Resumen de la búsqueda">
            <div className="catalog-count">
              <p>Catálogo de demostración</p>
              <strong>6.474</strong>
              <span>perfiles individuales históricos</span>
              <small>El número de candidatos compatibles se actualizará según tus preferencias.</small>
            </div>

            <div className="preference-summary" aria-live="polite">
              <div className="summary-heading"><h2>Tus preferencias</h2><span>{selectedPreferences.length}</span></div>
              {selectedPreferences.length === 0 ? (
                <p className="empty-summary">Todavía no has aplicado ningún criterio.</p>
              ) : (
                <ul>
                  {selectedPreferences.map(([key, value]) => (
                    <li key={key}><span>{labels[key]}</span><strong>{value}</strong></li>
                  ))}
                </ul>
              )}
              <button className="clear-preferences" type="button" onClick={clearPreferences} disabled={selectedPreferences.length === 0}>
                Limpiar preferencias
              </button>
            </div>

            <div className="flow-order" aria-label="Orden del proceso">
              <span>Preferencias</span><i aria-hidden="true" /><span>Referencia visual</span><i aria-hidden="true" /><span>Resultados</span>
            </div>

            <Link className="continue-button" href="/adoptante/referencia">
              Continuar a referencia visual <ArrowIcon />
            </Link>
          </aside>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Primero preferencias estructuradas. Después, búsqueda visual.</p></div>
      </footer>
    </main>
  );
}
