import { getPetfinderHistoricalDescription } from "../lib/tfm/descriptions.ts";
import { adopterProfiles } from "../lib/adoptante/artifacts.ts";
import { presentPetfinderName } from "../lib/presentation/petfinderName.ts";
import type { AdopterProfile } from "../types/adopterSearch.ts";

export type ProtectoraRiskLevel = "Bajo" | "Medio" | "Alto";

export type ProtectoraPetfinderSourceProfile = {
  PetID: string;
  nombre_app: string;
  Age: number;
  edad_anos: number;
  sexo_app: string;
  tamano_app: string;
  pelo_app: string;
  salud_app: string;
  esterilizado_app: string;
  vacunado_app: string;
  desparasitado_app: string;
  raza_principal_app: string;
  raza_secundaria_app: string;
  color_1_app: string;
  color_2_app: string;
  color_3_app: string;
  Description: string;
  PhotoAmt: number;
  VideoAmt: number;
  prob_adopcion_lenta_petfinder_final: number;
  nivel_riesgo_relativo: ProtectoraRiskLevel;
  indice_completitud_ficha: number;
  nivel_completitud_ficha: string;
};

export type ProtectoraPetfinderProfile = {
  source: ProtectoraPetfinderSourceProfile;
  id: string;
  name: string;
  age: string;
  sex: string;
  size: string;
  hairLength: string;
  healthStatus: string;
  sterilized: string;
  vaccinated: string;
  dewormed: string;
  breed: string;
  color: string;
  description: string;
  risk: ProtectoraRiskLevel;
  completeness: number;
  imagePath: string;
};

const PROTECTORA_PETFINDER_IDS = ["485bebd4f", "a9085cdde", "c3a2d4d83", "ad2423b1f", "fff4a6420", "c749028bb"];

const MALE_PRESENTATION_NAMES = [
  "Max", "Rocky", "Toby", "Bruno", "Leo", "Simba", "Milo", "Duke", "Thor", "Bobby",
  "Rex", "Oliver", "Benji", "Teo", "Nico", "Lucky", "Tango", "Chester", "Balu", "Kiko",
] as const;

const FEMALE_PRESENTATION_NAMES = [
  "Luna", "Nala", "Kira", "Maya", "Lola", "Duna", "Mia", "Noa", "Gala", "Lia",
  "Nina", "Alma", "Sasha", "Kiara", "Vega", "Leia", "Roma", "Olivia", "Mila", "Cora",
] as const;

function sourceFromAdopterProfile(profile: AdopterProfile): ProtectoraPetfinderSourceProfile {
  return {
    Description: getPetfinderHistoricalDescription(profile.petId) ?? "",
    PetID: profile.petId,
    nombre_app: profile.name,
    Age: profile.ageMonths,
    edad_anos: profile.ageMonths / 12,
    sexo_app: profile.sex,
    tamano_app: profile.size,
    pelo_app: profile.coat,
    salud_app: profile.health,
    esterilizado_app: profile.sterilized,
    vacunado_app: profile.vaccinated,
    desparasitado_app: profile.dewormed,
    raza_principal_app: profile.primaryBreed ?? "",
    raza_secundaria_app: profile.secondaryBreed ?? "",
    color_1_app: profile.colors[0] ?? "",
    color_2_app: profile.colors[1] ?? "",
    color_3_app: profile.colors[2] ?? "",
    PhotoAmt: profile.photoCount,
    VideoAmt: profile.videoCount,
    prob_adopcion_lenta_petfinder_final: profile.riskProbability,
    nivel_riesgo_relativo: profile.riskLevel,
    indice_completitud_ficha: profile.completenessIndex,
    nivel_completitud_ficha: profile.completenessLevel,
  };
}

// Historical six-profile subset retained only for backwards compatibility and
// for the hand-reviewed Spanish descriptions used in the original prototype.
export const PROTECTORA_PETFINDER_SOURCE_PROFILES: readonly ProtectoraPetfinderSourceProfile[] =
  PROTECTORA_PETFINDER_IDS.map((petId) => {
    const profile = adopterProfiles.find((candidate) => candidate.petId === petId);
    if (!profile) throw new Error(`Missing Protectora profile: ${petId}`);
    const source = sourceFromAdopterProfile(profile);
    if (!source.Description) throw new Error(`Missing historical description: ${petId}`);
    return source;
  });

const PROFILE_DESCRIPTIONS_ES: Readonly<Record<string, string>> = {
  "485bebd4f": "Sophie es una hembra adulta de más de 6 años, de pelo marrón y grandes orejas. Es una perra dócil, muy orientada a las personas y de carácter maduro. Disfruta descansando junto a ellas y tiene carácter de perro faldero. Ladra cuando ve a personas desconocidas, por lo que se mantiene alerta y actúa como buena guardiana. Sigue una dieta basada íntegramente en pienso. Le gusta disponer de un lugar blando para dormir y espera a sus paseos diarios para hacer sus necesidades, sin ensuciar. No debería permanecer enjaulada ni atada, salvo temporalmente; es una perra amante de la libertad.",
  "a9085cdde": "Tom es un perro muy cariñoso e inteligente, con un temperamento excelente. Es muy inteligente y leal a su cuidador, reconoce muy bien su nombre, obedece órdenes y entra en su jaula cuando se le indica. Es muy limpio y no orina ni defeca en la jaula. Se mantiene cercano a su cuidador y es un excelente perro guardián; avisa cuando llega una persona desconocida.",
  "c3a2d4d83": "Hawk fue encontrado merodeando cerca de una clínica gubernamental en mayo y fue rescatado de inmediato. Estaba sano, es extremadamente amistoso y le encanta bañarse. Al ser beagle, necesita ejercicio. Debe alimentarse únicamente con comida para perros, sin arroz, huesos ni otros alimentos humanos, ya que tiende a buscar restos que caen al suelo.",
  "ad2423b1f": "Cindi es una perra muy amistosa. Su anterior cuidador ya no podía seguir haciéndose cargo de ella.",
  "fff4a6420": "Zander es muy adorable y mimoso. Es activo, sano y juguetón. También es tranquilo y está contento cuando dispone de un juguete con el que entretenerse. Es un gran compañero.",
  "c749028bb": "Koldie fue rescatada en Subang Jaya unos ocho meses antes. Ya había sido llevada al veterinario, estaba libre de garrapatas y tenía un ligero sobrepeso.",
};

const BREED_PRESENTATION_ES: Readonly<Record<string, string>> = {
  "Mixed Breed": "Mestizo",
  "German Shepherd Dog": "Pastor alemán",
};

const COLOR_PRESENTATION_ES: Readonly<Record<string, string>> = {
  Black: "Negro",
  White: "Blanco",
  Brown: "Marrón",
  Cream: "Crema",
  Golden: "Dorado",
  Yellow: "Amarillo",
  Gray: "Gris",
  Grey: "Gris",
};

function formatAge(edadAnos: number) {
  const totalMonths = Math.round(edadAnos * 12);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (totalMonths === 0) return "Edad no determinada";
  if (years === 0) return `${months} ${months === 1 ? "mes" : "meses"}`;
  if (months === 0) return `${years} ${years === 1 ? "año" : "años"}`;
  return `${years} ${years === 1 ? "año" : "años"} y ${months} ${months === 1 ? "mes" : "meses"}`;
}

function joinInformed(values: readonly string[], separator: string) {
  return values.filter((value) => value.trim().length > 0).join(separator);
}

function presentKnownValue(value: string, mapping: Readonly<Record<string, string>>) {
  return mapping[value] ?? value;
}

function stablePresentationName(petId: string, names: readonly string[]) {
  let hash = 0;
  for (const character of petId) {
    hash = ((hash * 31) + character.charCodeAt(0)) >>> 0;
  }
  return names[hash % names.length];
}

function presentProtectoraName(source: ProtectoraPetfinderSourceProfile) {
  const historicalName = presentPetfinderName(source.nombre_app, source.PetID);
  if (historicalName !== "Sin nombre") return historicalName;

  const names = source.sexo_app === "Macho"
    ? MALE_PRESENTATION_NAMES
    : FEMALE_PRESENTATION_NAMES;
  return stablePresentationName(source.PetID, names);
}

function presentBreed(source: ProtectoraPetfinderSourceProfile) {
  return joinInformed(
    [source.raza_principal_app, source.raza_secundaria_app].map((breed) =>
      presentKnownValue(breed, BREED_PRESENTATION_ES),
    ),
    " / ",
  );
}

function buildStructuredDescription(source: ProtectoraPetfinderSourceProfile) {
  const name = presentProtectoraName(source);
  const subject = source.sexo_app === "Macho" ? "un macho" : "una hembra";
  const breed = presentBreed(source);
  const breedClause = breed ? `registra la raza ${breed}` : "no registra una raza específica";
  return `${name} es ${subject}, de ${formatAge(source.edad_anos)}, tamaño ${source.tamano_app.toLocaleLowerCase()} y pelo ${source.pelo_app.toLocaleLowerCase()}. Su ficha ${breedClause} y consta como ${source.salud_app.toLocaleLowerCase()}.`;
}

function toProtectoraProfile(
  source: ProtectoraPetfinderSourceProfile,
  options?: { useStructuredDescription?: boolean; imagePath?: string },
): ProtectoraPetfinderProfile {
  return {
    source,
    id: source.PetID,
    name: presentProtectoraName(source),
    age: formatAge(source.edad_anos),
    sex: source.sexo_app,
    size: source.tamano_app,
    hairLength: source.pelo_app,
    healthStatus: source.salud_app,
    sterilized: source.esterilizado_app,
    vaccinated: source.vacunado_app,
    dewormed: source.desparasitado_app,
    breed: presentBreed(source),
    color: joinInformed(
      [source.color_1_app, source.color_2_app, source.color_3_app].map((color) =>
        presentKnownValue(color, COLOR_PRESENTATION_ES),
      ),
      " / ",
    ),
    description: options?.useStructuredDescription
      ? buildStructuredDescription(source)
      : PROFILE_DESCRIPTIONS_ES[source.PetID] ?? buildStructuredDescription(source),
    risk: source.nivel_riesgo_relativo,
    completeness: Math.round(source.indice_completitud_ficha * 100),
    imagePath: options?.imagePath ?? `/images/petfinder/protectora/${source.PetID}-1.jpg`,
  };
}

export const PROTECTORA_PETFINDER_PROFILES: readonly ProtectoraPetfinderProfile[] =
  PROTECTORA_PETFINDER_SOURCE_PROFILES.map((source) => toProtectoraProfile(source));

export function getProtectoraPetfinderProfileById(id: string) {
  const historicalSelection = PROTECTORA_PETFINDER_PROFILES.find((profile) => profile.id === id);
  if (historicalSelection) return historicalSelection;

  const profile = adopterProfiles.find((candidate) => candidate.petId === id);
  if (!profile) return undefined;

  return toProtectoraProfile(sourceFromAdopterProfile(profile), {
    useStructuredDescription: true,
    imagePath: `/images/petfinder/catalog/${profile.petId}-1.jpg`,
  });
}
