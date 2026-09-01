export type RiskLevel = "Bajo" | "Medio" | "Alto";

export type DemoDog = {
  id: string;
  name: string;
  age: string;
  sex: string;
  size: string;
  breed: string;
  similarity: number;
  risk: RiskLevel;
  completeness: number;
  hairLength: string;
  color: string;
  healthStatus: string;
  sterilized: "Sí" | "No" | "No consta";
  vaccinated: "Sí" | "No" | "No consta";
  dewormed: "Sí" | "No" | "No consta";
  description: string;
};

// Datos exclusivamente ilustrativos para validar la experiencia de usuario.
export const DEMO_DOGS: readonly DemoDog[] = [
  {
    id: "nala",
    name: "Nala",
    age: "Adulto",
    sex: "Hembra",
    size: "Mediano",
    breed: "Mixed Breed",
    similarity: 92,
    risk: "Alto",
    completeness: 88,
    hairLength: "Medio",
    color: "Dorado y crema",
    healthStatus: "Saludable",
    sterilized: "Sí",
    vaccinated: "Sí",
    dewormed: "Sí",
    description: "Nala es una perra adulta de tamaño mediano. Su ficha reúne información sobre sus características generales, cuidados y estado de salud.",
  },
  {
    id: "bruno",
    name: "Bruno",
    age: "Joven",
    sex: "Macho",
    size: "Grande",
    breed: "Labrador Retriever",
    similarity: 89,
    risk: "Medio",
    completeness: 94,
    hairLength: "Corto",
    color: "Dorado",
    healthStatus: "Saludable",
    sterilized: "Sí",
    vaccinated: "Sí",
    dewormed: "Sí",
    description: "Bruno es un perro joven de tamaño grande. Su ficha recoge sus características generales y la información disponible sobre cuidados y salud.",
  },
  {
    id: "kira",
    name: "Kira",
    age: "Adulto",
    sex: "Hembra",
    size: "Pequeño",
    breed: "Shih Tzu",
    similarity: 86,
    risk: "Bajo",
    completeness: 91,
    hairLength: "Largo",
    color: "Blanco y marrón",
    healthStatus: "Necesidades leves",
    sterilized: "Sí",
    vaccinated: "Sí",
    dewormed: "No consta",
    description: "Kira es una perra adulta de tamaño pequeño. Su ficha resume sus rasgos físicos y los datos disponibles sobre cuidados y estado de salud.",
  },
  {
    id: "toby",
    name: "Toby",
    age: "Senior",
    sex: "Macho",
    size: "Mediano",
    breed: "Beagle Mix",
    similarity: 82,
    risk: "Alto",
    completeness: 76,
    hairLength: "Corto",
    color: "Tricolor",
    healthStatus: "Necesidades relevantes",
    sterilized: "Sí",
    vaccinated: "No consta",
    dewormed: "Sí",
    description: "Toby es un perro senior de tamaño mediano. Su ficha presenta información general sobre sus características, cuidados registrados y estado de salud.",
  },
  {
    id: "coco",
    name: "Coco",
    age: "Joven",
    sex: "Hembra",
    size: "Pequeño",
    breed: "Poodle Mix",
    similarity: 78,
    risk: "Medio",
    completeness: 83,
    hairLength: "Medio",
    color: "Crema",
    healthStatus: "Saludable",
    sterilized: "No",
    vaccinated: "Sí",
    dewormed: "Sí",
    description: "Coco es una perra joven de tamaño pequeño. Su ficha agrupa información sobre sus características generales y los cuidados de salud registrados.",
  },
  {
    id: "milo",
    name: "Milo",
    age: "Adulto",
    sex: "Macho",
    size: "Grande",
    breed: "German Shepherd Mix",
    similarity: 74,
    risk: "Bajo",
    completeness: 69,
    hairLength: "Medio",
    color: "Negro y marrón",
    healthStatus: "Saludable",
    sterilized: "No consta",
    vaccinated: "Sí",
    dewormed: "No consta",
    description: "Milo es un perro adulto de tamaño grande. Su ficha reúne los datos disponibles sobre características físicas, cuidados y estado de salud.",
  },
];

export function getDemoDogById(id: string) {
  return DEMO_DOGS.find((dog) => dog.id === id);
}
