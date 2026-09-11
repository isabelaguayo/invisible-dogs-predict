# InvisibleDogs Predict

**InvisibleDogs Predict** es un sistema desarrollado como Trabajo Fin de Máster para analizar el riesgo de larga estancia de perros en refugios animales y apoyar su visibilidad mediante técnicas de Machine Learning, interpretabilidad, análisis textual y recuperación visual con representaciones profundas.

## Aplicación web

La aplicación está publicada en Azure App Service:

https://invisibledogs-predict-dfacg2ene0hrhmba.spaincentral-01.azurewebsites.net/

La web ofrece dos recorridos principales:

- **Adoptante**: búsqueda de perfiles por características, apariencia o similitud visual; consulta de resultados, fichas y favoritos.
- **Protectora**: análisis global de perfiles históricos, detección de perfiles con mayor riesgo complementario de adopción lenta, explorador de perfiles, revisión individual y acciones orientadas a mejorar su visibilidad.

La búsqueda por fotografía utiliza un servicio de inferencia **DINOv2** desplegado de forma independiente.

## Estructura del repositorio

```text
invisible-dogs-predict/
├── frontend/      # Aplicación web Next.js
├── services/      # Servicios Python de inferencia
├── scripts/       # Preparación y generación de datos para la web
├── notebooks/     # Desarrollo experimental y científico del TFM
├── data/          # Datos originales, procesados y documentación de fuentes
├── artifacts/     # Modelos, embeddings e índices reproducibles
├── outputs/       # Métricas y resultados derivados
├── docs/          # Documentación complementaria
└── .github/       # Automatización de compilación y publicación
```

## Desarrollo científico

La secuencia experimental se organiza en **nueve notebooks**, desde la preparación y caracterización de los datos hasta la modelización, interpretabilidad, regresión, análisis complementario PetFinder, análisis visual, validación externa, pruebas de integración y desarrollo de la aplicación.

El orden recomendado se documenta en `notebooks/README.md`.

## Fuentes de datos

El proyecto trabaja con tres fuentes principales:

- **Austin Animal Center**: base del modelo principal de riesgo de larga estancia.
- **PetFinder.my**: análisis complementario, perfiles históricos y datos estructurados, textuales y visuales utilizados por la aplicación.
- **Tsinghua Dogs**: validación externa y recuperación visual por similitud.

La procedencia y organización de cada conjunto se describen en `data/README.md`.

## Modelos y artefactos

Los modelos serializados, embeddings e índices utilizados por el sistema se conservan en `artifacts/`. Los resultados experimentales y métricas se almacenan en `outputs/`.

Los archivos de gran tamaño que lo requieren se gestionan mediante **Git LFS**.

## Frontend e inferencia visual

La aplicación web se encuentra en `frontend/` y está desarrollada con Next.js. La documentación específica de ejecución, pruebas y estructura funcional está disponible en `frontend/README.md`.

El servicio de inferencia DINOv2 se encuentra en `services/dinov2-inference/` y se utiliza para procesar imágenes de consulta en la búsqueda por fotografía.

## Reproducibilidad y trazabilidad

El repositorio conserva los notebooks, datasets procesados, modelos, embeddings, resultados y proyecciones de datos necesarias para mantener la trazabilidad entre el desarrollo científico y la aplicación.

`frontend/DATA-INTEGRATION.md` documenta la correspondencia entre las fuentes científicas y los elementos consumidos por la web.

## Seguridad

El repositorio no contiene credenciales reales ni secretos de publicación. Las variables necesarias para ejecutar la aplicación se describen mediante archivos de ejemplo sin valores de producción.

## Ramas

- `main`: versión actual de la aplicación y del proyecto.
- `documentacion-tfm`: rama destinada a mantener la trazabilidad y documentación asociada a la entrega académica.
