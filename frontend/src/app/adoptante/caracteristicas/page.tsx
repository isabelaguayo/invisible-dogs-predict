"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ColorSwatch } from "@/components/PreferenceIllustrations";
import { SectionDivider } from "@/components/SectionDivider";
import { FavoritesNavLink } from "@/components/adoptante/FavoritesNavLink";
import {
  adopterCharacteristicsOnly,
  createAdopterHref,
  parseAdopterSearchState,
} from "@/lib/adoptante/query";
import type { AdopterFilterKey, AdopterSearchState } from "@/types/adopterSearch";

type PreferenceValue = NonNullable<AdopterSearchState[AdopterFilterKey]>;

type PreferenceOption = {
  label: string;
  value?: PreferenceValue;
};

type PreferenceField = {
  key: AdopterFilterKey;
  label: string;
  hint?: string;
  options: PreferenceOption[];
};

type PreferenceIllustration = {
  src: string;
  width: number;
  height: number;
};

const INDIFFERENT = "Indiferente";

function options(...values: Array<[label: string, value?: PreferenceValue]>) {
  return values.map(([label, value]) => ({ label, value }));
}

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
      { key: "age", label: "Edad", options: options([INDIFFERENT], ["Cachorro", "Cachorro"], ["Joven", "Joven"], ["Adulto", "Adulto"], ["Senior", "Senior"]) },
      { key: "sex", label: "Sexo", options: options([INDIFFERENT], ["Hembra", "Hembra"], ["Macho", "Macho"]) },
      { key: "size", label: "Tamaño adulto", options: options([INDIFFERENT], ["Pequeño", "Pequeño"], ["Mediano", "Mediano"], ["Grande", "Grande"], ["Muy grande", "Extra grande"]) },
      { key: "coat", label: "Pelo", options: options([INDIFFERENT], ["Corto", "Corto"], ["Medio", "Medio"], ["Largo", "Largo"]) },
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
        options: options([INDIFFERENT], ["Saludable", "Saludable"], ["Necesidades leves", "Lesión leve"], ["Necesidades relevantes", "Lesión grave"]),
      },
      { key: "sterilized", label: "Esterilización", options: options([INDIFFERENT], ["Sí", "Sí"], ["No", "No"], ["No consta", "No consta"]) },
      { key: "vaccinated", label: "Vacunación", options: options([INDIFFERENT], ["Sí", "Sí"], ["No", "No"], ["No consta", "No consta"]) },
      { key: "dewormed", label: "Desparasitación", options: options([INDIFFERENT], ["Sí", "Sí"], ["No", "No"], ["No consta", "No consta"]) },
    ],
  },
  {
    number: "03",
    title: "Aspecto",
    description: "Indica un color solo si es relevante para tu búsqueda.",
    illustration: {
      src: "/illustrations/aspecto.png",
      width: 1254,
      height: 1254,
    },
    fields: [
      {
        key: "color",
        label: "Color",
        hint: "Puedes indicar un color preferido o dejarlo como indiferente.",
        options: options([INDIFFERENT], ["Negro", "Black"], ["Blanco", "White"], ["Marrón", "Brown"], ["Crema", "Cream"], ["Dorado", "Golden"], ["Gris", "Gray"], ["Amarillo", "Yellow"]),
      },
    ],
  },
];

const labels = preferenceGroups
  .flatMap((group) => group.fields)
  .reduce<Record<AdopterFilterKey, string>>(
    (state, field) => ({ ...state, [field.key]: field.label }),
    {} as Record<AdopterFilterKey, string>,
  );

function displayPreferenceValue(key: AdopterFilterKey, value: PreferenceValue) {
  return preferenceGroups
    .flatMap((group) => group.fields)
    .find((field) => field.key === key)
    ?.options.find((option) => option.value === value)?.label ?? String(value);
}

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

function FindDogContent({ initialSearchState }: { initialSearchState: AdopterSearchState }) {
  const [preferences, setPreferences] = useState<AdopterSearchState>(
    adopterCharacteristicsOnly(initialSearchState),
  );

  const selectedPreferences = useMemo(
    () =>
      (Object.entries(preferences) as Array<[AdopterFilterKey, PreferenceValue]>),
    [preferences],
  );

  function selectPreference(key: AdopterFilterKey, value?: PreferenceValue) {
    setPreferences((current) => {
      const next = { ...current };
      if (value === undefined) delete next[key];
      else Object.assign(next, { [key]: value });
      return next;
    });
  }

  function clearPreferences() {
    setPreferences({});
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
            <FavoritesNavLink />
            <Link className="back-home" href="/"><BackIcon />Inicio</Link>
          </div>
        </div>
      </header>

      <section className="flow-intro">
        <div className="page-shell flow-intro-grid">
          <div>
            <p className="flow-eyebrow">Recorrido Adoptante</p>
            <h1>Busca por características</h1>
          </div>
          <div className="flow-intro-copy">
            <p>Filtra los perfiles históricos PetFinder según la edad, el sexo, el tamaño, la salud y otros criterios importantes para ti.</p>
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

      <nav className="method-context-bar page-shell" aria-label="Método de búsqueda elegido">
        <Link href="/adoptante/encontrar"><BackIcon />Cambiar método</Link>
        <span><i aria-hidden="true">A</i>Búsqueda por características</span>
      </nav>

      <SectionDivider />

      <section className="preferences-area">
        <div className="page-shell preferences-layout">
          <div className="preferences-main">
            <div className="preferences-heading">
              <div><p className="section-kicker">Método A · Características</p><h2>¿Qué estás buscando?</h2></div>
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
                            const selected = preferences[field.key] === option.value;
                            return (
                              <button
                                className="preference-chip"
                                type="button"
                                key={option.label}
                                aria-pressed={selected}
                                onClick={() => selectPreference(field.key, option.value)}
                              >
                                {field.key === "color" && option.value !== undefined && <ColorSwatch color={option.label} />}
                                <span className="chip-indicator" aria-hidden="true" />
                                {option.label}
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
              <p>Perfiles disponibles</p>
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
                    <li key={key}><span>{labels[key]}</span><strong>{displayPreferenceValue(key, value)}</strong></li>
                  ))}
                </ul>
              )}
              <button className="clear-preferences" type="button" onClick={clearPreferences} disabled={selectedPreferences.length === 0}>
                Limpiar preferencias
              </button>
            </div>

            <div className="flow-order" aria-label="Orden del proceso">
              <span>Preferencias</span><i aria-hidden="true" /><span>Perfiles compatibles</span><i aria-hidden="true" /><span>Resultados</span>
            </div>

            <Link className="continue-button" href={createAdopterHref(
              "/adoptante/resultados",
              { ...preferences, searchMode: "characteristics" },
            )}>
              Ver perfiles compatibles <ArrowIcon />
            </Link>
          </aside>
        </div>
      </section>

      <footer className="flow-footer">
        <div className="page-shell"><span>InvisibleDogs Predict</span><p>Filtros estructurados sobre perfiles históricos PetFinder.</p></div>
      </footer>
    </main>
  );
}

function FindDogPageState() {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const state = parseAdopterSearchState(searchParams);
  return <FindDogContent initialSearchState={state} key={query} />;
}

export default function FindDogPage() {
  return <Suspense><FindDogPageState /></Suspense>;
}
