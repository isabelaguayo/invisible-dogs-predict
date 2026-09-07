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

// Selección 1:1 de los seis registros históricos PetFinder validados para Protectora.
// Las adaptaciones de presentación se realizan después de esta colección fuente.
export const PROTECTORA_PETFINDER_SOURCE_PROFILES: readonly ProtectoraPetfinderSourceProfile[] = [
  {
    PetID: "485bebd4f",
    nombre_app: "Sophie",
    Age: 72,
    edad_anos: 6.0,
    sexo_app: "Hembra",
    tamano_app: "Mediano",
    pelo_app: "Corto",
    salud_app: "Saludable",
    esterilizado_app: "Sí",
    vacunado_app: "Sí",
    desparasitado_app: "Sí",
    raza_principal_app: "Labrador Retriever",
    raza_secundaria_app: "Mixed Breed",
    color_1_app: "Golden",
    color_2_app: "Yellow",
    color_3_app: "",
    Description: "Please click on Sophie's pictures for a clearer view! _____________________________________________________ Introducing Sophie! • Female adult, 6+ years, brown-haired with gorgeous big ears. • A gentle dog, very people orientated. • Mature personality, enjoys laying around with her people, perfect \"lap\" dog character. Will bark is she sees strangers (alert and good watch dog). • She's fully on a kibble diet. Sophie enjoys a soft sleeping spot and waits for her daily walks before going for potty (never makes a mess). _____________________________________________________ PLEASE READ (Note for potential owners): • Sophie should not be caged or leashed (unless temporarily). She's a freedom loving dog. _____________________________________________________ Please drop me a call if you feel that you may be just the right person to give Sophie a home. Thank you!",
    PhotoAmt: 6.0,
    VideoAmt: 0,
    prob_adopcion_lenta_petfinder_final: 0.7042473401390461,
    nivel_riesgo_relativo: "Alto",
    indice_completitud_ficha: 0.95,
    nivel_completitud_ficha: "Alta",
  },
  {
    PetID: "a9085cdde",
    nombre_app: "Tom",
    Age: 36,
    edad_anos: 3.0,
    sexo_app: "Macho",
    tamano_app: "Grande",
    pelo_app: "Corto",
    salud_app: "Saludable",
    esterilizado_app: "No consta",
    vacunado_app: "No consta",
    desparasitado_app: "No consta",
    raza_principal_app: "Rottweiler",
    raza_secundaria_app: "Mixed Breed",
    color_1_app: "Black",
    color_2_app: "",
    color_3_app: "",
    Description: "Tom is a very lovely & intelligent good boy. He is looking for a forever loving home. He has a wonderful temperament. He is very intelligent & loyalty to his owner. He knows his name very very well whenever you call him name Tom. He will obey orders and go to cage when asked to. He very clean and will not dirty his cage with pee & poo. He is obedient & close to his master. He is an excellent guard dog. He will make a good watch dog for your home. He will alert you when stranger arrive. Every dog deserve a good & loving forever home.....Pls give him a chance to prove how grateful he is to you when you adopt him. Pls call or whatsapp me if you are a serious pets lover & really wanna give him a loving forever home. I'm very sad to put him for urgent adoption Reason For Adoption: Relocation to Sabah very soon",
    PhotoAmt: 1.0,
    VideoAmt: 0,
    prob_adopcion_lenta_petfinder_final: 0.6681842888051919,
    nivel_riesgo_relativo: "Alto",
    indice_completitud_ficha: 0.5,
    nivel_completitud_ficha: "Media",
  },
  {
    PetID: "c3a2d4d83",
    nombre_app: "Hawk",
    Age: 42,
    edad_anos: 3.5,
    sexo_app: "Macho",
    tamano_app: "Mediano",
    pelo_app: "Corto",
    salud_app: "Saludable",
    esterilizado_app: "No",
    vacunado_app: "No",
    desparasitado_app: "No",
    raza_principal_app: "Beagle",
    raza_secundaria_app: "",
    color_1_app: "Brown",
    color_2_app: "",
    color_3_app: "",
    Description: "***** Found Hawk loitering nearby a Government Clinic in May and promptly rescued him , healthy , extremely friendly and loves his bath ! Rescuing too many dogs and needing to give him up for adoption to a good home No breeder and no apartment as Beagles are known to be needing exercise If you cannot exercise him twice a day , please adopt a Poodle instead Only strictly dog food , no rice or bones or other human food as he is known to scavenge for drop downs No visitors , I will arrange to visit you instead No SMS please , just call me Thank you",
    PhotoAmt: 5.0,
    VideoAmt: 0,
    prob_adopcion_lenta_petfinder_final: 0.5509309960499141,
    nivel_riesgo_relativo: "Medio",
    indice_completitud_ficha: 0.95,
    nivel_completitud_ficha: "Alta",
  },
  {
    PetID: "ad2423b1f",
    nombre_app: "Cindi",
    Age: 12,
    edad_anos: 1.0,
    sexo_app: "Hembra",
    tamano_app: "Grande",
    pelo_app: "Medio",
    salud_app: "Saludable",
    esterilizado_app: "No consta",
    vacunado_app: "No",
    desparasitado_app: "No",
    raza_principal_app: "German Shepherd Dog",
    raza_secundaria_app: "Mixed Breed",
    color_1_app: "Black",
    color_2_app: "Brown",
    color_3_app: "",
    Description: "Cindi is a very friendly dog. Gonna let her go because of me no longer can take care of her.",
    PhotoAmt: 1.0,
    VideoAmt: 0,
    prob_adopcion_lenta_petfinder_final: 0.5731234981606569,
    nivel_riesgo_relativo: "Medio",
    indice_completitud_ficha: 0.7000000000000001,
    nivel_completitud_ficha: "Media",
  },
  {
    PetID: "fff4a6420",
    nombre_app: "Zander",
    Age: 2,
    edad_anos: 0.16666666666666666,
    sexo_app: "Macho",
    tamano_app: "Mediano",
    pelo_app: "Corto",
    salud_app: "Saludable",
    esterilizado_app: "No",
    vacunado_app: "No",
    desparasitado_app: "Sí",
    raza_principal_app: "Golden Retriever",
    raza_secundaria_app: "Mixed Breed",
    color_1_app: "Brown",
    color_2_app: "",
    color_3_app: "",
    Description: "Zander is super cute and cuddly. Active, healthy and playful. He is also quiet and is happy when given a toy to play with. Makes a great companion.",
    PhotoAmt: 4.0,
    VideoAmt: 0,
    prob_adopcion_lenta_petfinder_final: 0.3048679134396509,
    nivel_riesgo_relativo: "Bajo",
    indice_completitud_ficha: 0.95,
    nivel_completitud_ficha: "Alta",
  },
  {
    PetID: "c749028bb",
    nombre_app: "Koldie",
    Age: 72,
    edad_anos: 6.0,
    sexo_app: "Hembra",
    tamano_app: "Grande",
    pelo_app: "Medio",
    salud_app: "Saludable",
    esterilizado_app: "No consta",
    vacunado_app: "Sí",
    desparasitado_app: "Sí",
    raza_principal_app: "Golden Retriever",
    raza_secundaria_app: "",
    color_1_app: "Cream",
    color_2_app: "",
    color_3_app: "",
    Description: "rescued in subang jaya about eight months ago, already send to the vet, tick free and slightly over weight. Reasons for giving up bcoz unable to take care of five rescued dogs include two senior with hip disorder and I'll be working soon....",
    PhotoAmt: 1.0,
    VideoAmt: 0,
    prob_adopcion_lenta_petfinder_final: 0.4485774566959155,
    nivel_riesgo_relativo: "Bajo",
    indice_completitud_ficha: 0.7000000000000001,
    nivel_completitud_ficha: "Media",
  },
];

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
