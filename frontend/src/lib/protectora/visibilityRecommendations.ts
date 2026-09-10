import type { ProtectoraPetfinderProfile } from "@/data/protectoraPetfinderProfiles";

export type VisibilityRecommendation = {
  action: string;
  reason: string;
};

function isMissing(value: string | null | undefined) {
  const normalized = value?.trim().toLocaleLowerCase() ?? "";
  return normalized.length === 0 || normalized === "no consta";
}

export function getVisibilityRecommendations(
  dog: ProtectoraPetfinderProfile,
): VisibilityRecommendation[] {
  const recommendations: VisibilityRecommendation[] = [];
  const description = dog.source.Description?.trim() ?? "";
  const photoCount = Number(dog.source.PhotoAmt) || 0;
  const videoCount = Number(dog.source.VideoAmt) || 0;

  const missingStructuredFields = [
    ["estado de salud", dog.healthStatus],
    ["esterilización", dog.sterilized],
    ["vacunación", dog.vaccinated],
    ["desparasitación", dog.dewormed],
  ].filter(([, value]) => isMissing(value));

  if (!description) {
    recommendations.push({
      action: "Crear una descripción más completa y orientada a la adopción",
      reason: "La fuente histórica no contiene una descripción disponible. Explicar de forma clara carácter, rutinas, convivencia, necesidades y puntos fuertes —solo cuando la protectora pueda confirmarlos— ayuda a que una persona adoptante entienda mejor el perfil.",
    });
  } else if (description.length < 220) {
    recommendations.push({
      action: "Ampliar la descripción del perfil",
      reason: "La descripción histórica es breve. Añadir información útil y verificable sobre el día a día, adaptación al hogar, nivel de actividad y necesidades puede hacer el perfil más informativo y diferenciable.",
    });
  } else {
    recommendations.push({
      action: "Reforzar el inicio de la descripción",
      reason: "La ficha ya dispone de contenido. Conviene que las primeras líneas sinteticen de forma atractiva y fiel los rasgos, necesidades y puntos fuertes más relevantes para que lo esencial se entienda rápidamente.",
    });
  }

  if (photoCount <= 1) {
    recommendations.push({
      action: "Añadir más fotografías y variar los encuadres",
      reason: `La ficha histórica registra ${photoCount} ${photoCount === 1 ? "fotografía" : "fotografías"}. Mostrar primer plano, cuerpo completo y alguna situación cotidiana puede facilitar una presentación visual más completa.`,
    });
  } else if (photoCount <= 3) {
    recommendations.push({
      action: "Ampliar la variedad de fotografías",
      reason: `La ficha histórica registra ${photoCount} fotografías. Incorporar imágenes complementarias con distintos encuadres y contextos puede ayudar a mostrar mejor al perro sin depender de una sola imagen principal.`,
    });
  } else {
    recommendations.push({
      action: "Revisar la fotografía principal y el orden de la galería",
      reason: `La ficha ya dispone de ${photoCount} fotografías. Seleccionar como portada la imagen más clara y representativa y ordenar el resto para aportar variedad puede mejorar la primera impresión del perfil.`,
    });
  }

  if (videoCount === 0) {
    recommendations.push({
      action: "Incorporar un vídeo breve si la protectora dispone de él",
      reason: "La ficha histórica no registra vídeos. Un clip corto puede aportar contexto visual sobre movimiento e interacción que una fotografía no muestra, siempre sin atribuir comportamientos que no hayan sido observados.",
    });
  } else {
    recommendations.push({
      action: "Dar mayor protagonismo al vídeo disponible",
      reason: `La ficha registra ${videoCount} ${videoCount === 1 ? "vídeo" : "vídeos"}. Colocarlo en una posición visible y acompañarlo de un texto descriptivo puede complementar la información visual del perfil.`,
    });
  }

  if (missingStructuredFields.length > 0) {
    const labels = missingStructuredFields.map(([label]) => label).join(", ");
    recommendations.push({
      action: "Completar los datos estructurados pendientes",
      reason: `En los campos revisables no consta información sobre ${labels}. Si la protectora dispone de esos datos, incorporarlos reduce ambigüedad y facilita que el perfil pueda encontrarse y evaluarse con más contexto.`,
    });
  } else if (dog.completeness < 90) {
    recommendations.push({
      action: "Revisar los componentes que todavía reducen la completitud",
      reason: `Los campos estructurados principales mostrados están informados, pero la completitud global es del ${dog.completeness} %. Conviene revisar otros elementos de la ficha histórica no desglosados en esta vista y completar únicamente aquellos para los que exista información fiable.`,
    });
  } else {
    recommendations.push({
      action: "Mantener la ficha actualizada y coherente",
      reason: `La completitud es alta (${dog.completeness} %). Aun así, revisar periódicamente que texto, fotografías, cuidados y datos estructurados sigan siendo coherentes evita que un perfil completo quede desactualizado o pierda capacidad de comunicar bien.`,
    });
  }

  if (dog.risk === "Alto") {
    recommendations.push({
      action: "Priorizar este perfil en las acciones de difusión",
      reason: "El perfil se encuentra en el nivel Alto de riesgo complementario de adopción lenta. Darle mayor presencia en destacados, publicaciones y rotaciones de difusión puede aumentar su exposición, aunque el modelo no permite afirmar que esa acción vaya a reducir causalmente el tiempo de adopción.",
    });
  } else if (dog.risk === "Medio") {
    recommendations.push({
      action: "Reforzar la frecuencia de difusión del perfil",
      reason: "El nivel Medio indica que conviene mantener una vigilancia activa de su visibilidad. Alternar publicaciones, renovar la imagen principal y volver a destacar el perfil puede evitar que pierda presencia frente a otros anuncios.",
    });
  } else {
    recommendations.push({
      action: "Mantener una visibilidad activa y periódica",
      reason: "Aunque el nivel relativo sea Bajo, ningún perfil debería quedar sin acciones de visibilidad. Mantener contenido actualizado y una difusión periódica ayuda a que continúe siendo fácil de descubrir por posibles adoptantes.",
    });
  }

  return recommendations;
}
