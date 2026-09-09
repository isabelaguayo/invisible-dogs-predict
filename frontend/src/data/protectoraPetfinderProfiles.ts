import { getPetfinderHistoricalDescription } from "../lib/tfm/descriptions.ts";
import { adopterProfiles } from "../lib/adoptante/artifacts.ts";

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

// Shared fields use the prepared PetFinder catalog; preserve the historical selection.
export const PROTECTORA_PETFINDER_SOURCE_PROFILES: readonly ProtectoraPetfinderSourceProfile[] =
  PROTECTORA_PETFINDER_IDS.map((petId) => {
    const description = getPetfinderHistoricalDescription(petId);
    if (!description) throw new Error(`Missing historical description: ${petId}`);
    const profile = adopterProfiles.find((candidate) => candidate.petId === petId);
    if (!profile) throw new Error(`Missing Protectora profile: ${petId}`);
    return {
      Description: description,
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

function toProtectoraProfile(source: ProtectoraPetfinderSourceProfile): ProtectoraPetfinderProfile {
  return {
    source,
    id: source.PetID,
    name: source.nombre_app,
    age: formatAge(source.edad_anos),
    sex: source.sexo_app,
    size: source.tamano_app,
    hairLength: source.pelo_app,
    healthStatus: source.salud_app,
    sterilized: source.esterilizado_app,
    vaccinated: source.vacunado_app,
    dewormed: source.desparasitado_app,
    breed: joinInformed(
      [source.raza_principal_app, source.raza_secundaria_app].map((breed) =>
        presentKnownValue(breed, BREED_PRESENTATION_ES),
      ),
      " / ",
    ),
    color: joinInformed(
      [source.color_1_app, source.color_2_app, source.color_3_app].map((color) =>
        presentKnownValue(color, COLOR_PRESENTATION_ES),
      ),
      " / ",
    ),
    description: PROFILE_DESCRIPTIONS_ES[source.PetID] ?? source.Description,
    risk: source.nivel_riesgo_relativo,
    completeness: Math.round(source.indice_completitud_ficha * 100),
    imagePath: `/images/petfinder/protectora/${source.PetID}-1.jpg`,
  };
}

export const PROTECTORA_PETFINDER_PROFILES: readonly ProtectoraPetfinderProfile[] =
  PROTECTORA_PETFINDER_SOURCE_PROFILES.map(toProtectoraProfile);

export function getProtectoraPetfinderProfileById(id: string) {
  return PROTECTORA_PETFINDER_PROFILES.find((profile) => profile.id === id);
}
