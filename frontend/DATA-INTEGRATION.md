# Integración de datos y trazabilidad web

Este documento describe cómo **InvisibleDogs Predict** conecta los resultados científicos versionados en el repositorio con la aplicación web.

Su objetivo es mantener una separación clara entre las fuentes originales, los datasets procesados, los modelos, los artefactos derivados y la información presentada en los recorridos de Adoptante y Protectora.

## Fuentes científicas

### Austin Animal Center

Austin constituye la base del modelo principal de riesgo de larga estancia. Los datos originales se conservan en `data/raw/austin/`, el dataset preparado en `data/processed/austin/` y los resultados derivados en `outputs/metrics/`, `outputs/interpretability/` y `outputs/regression/`.

El modelo principal y el modelo complementario de regresión se almacenan en `artifacts/models/`.

### PetFinder.my

PetFinder se utiliza como análisis complementario y como fuente de los perfiles históricos presentados en la aplicación.

Los datos originales se almacenan en `data/raw_petfinder/` y los datasets procesados en `data/processed/`. El modelo complementario PetFinder se conserva en `artifacts/models/modelo_complementario_petfinder_final.pkl` y sus resultados de evaluación en `outputs/petfinder/`.

### Tsinghua Dogs

Tsinghua Dogs se utiliza para validación externa y recuperación visual. Los Parquet originales se conservan en `data/raw/tsinghua/`, mientras que los embeddings, prototipos e índices derivados se encuentran en `outputs/tsinghua_visual/` y `artifacts/`.

## Correspondencia entre datos y aplicación

| Elemento de la web | Fuente principal |
| --- | --- |
| Métricas científicas de Home | Resultados versionados del modelo principal Austin y del análisis complementario PetFinder |
| Perfiles históricos | Datos PetFinder procesados y proyecciones preparadas para el frontend |
| Riesgo complementario PetFinder | Score y bandas derivados del modelo complementario PetFinder |
| Completitud de ficha | Información estructurada disponible en los perfiles PetFinder |
| Descripciones | Campo histórico `Description` de PetFinder, con resumen estructurado cuando no existe texto disponible |
| Fotografías | Imágenes históricas PetFinder publicadas para los perfiles utilizados por la web |
| Referencias visuales | Catálogo y prototipos Tsinghua Dogs |
| Similitud por referencia | Embeddings Tsinghua y PetFinder ya generados |
| Similitud por fotografía | Embedding calculado por el servicio DINOv2 y comparación con representaciones PetFinder |
| Interpretación individual de riesgo | Explicaciones PetFinder disponibles en los artefactos específicos del frontend |

## Recorrido Adoptante

El área Adoptante trabaja con perfiles históricos PetFinder y ofrece tres formas principales de búsqueda:

- características básicas;
- apariencia y referencia visual;
- fotografía de consulta mediante DINOv2.

Los resultados reutilizan el mismo catálogo de perfiles y mantienen separada la similitud visual del riesgo complementario de adopción lenta.

La similitud describe parecido en la representación visual y no se interpreta como medida de personalidad, comportamiento o compatibilidad total.

## Recorrido Protectora

La Vista Protectora utiliza el conjunto histórico PetFinder preparado para la aplicación y permite:

- consultar métricas agregadas;
- revisar la distribución del riesgo complementario;
- analizar la completitud de las fichas;
- priorizar perfiles con mayor riesgo estimado;
- explorar los perfiles disponibles;
- abrir fichas individuales y consultar acciones de mejora de visibilidad.

Las acciones recomendadas se apoyan en elementos modificables de presentación, información y difusión. No se presentan como relaciones causales ni como garantía de reducción del tiempo de adopción.

Cuando existe una explicación individual del modelo, la ficha muestra los factores disponibles. Si no existe una explicación específica para un perfil, no se generan factores artificiales.

## Separación entre Austin y PetFinder

El modelo principal Austin y el modelo complementario PetFinder cumplen funciones distintas.

Los resultados globales de Austin se utilizan como evidencia científica del desarrollo principal del proyecto, pero no se aplican directamente a registros PetFinder aislados. Las fichas PetFinder utilizan su propio modelo complementario y sus propios datos derivados.

Esta separación evita mezclar contratos de datos, métricas o explicaciones pertenecientes a modelos diferentes.

## Búsqueda visual

La recuperación visual reutiliza representaciones ya generadas y versionadas:

- prototipos visuales Tsinghua;
- embeddings de perfiles PetFinder;
- índice de búsqueda visual;
- catálogo de referencias.

Para una fotografía subida por el usuario, el servicio ubicado en `services/dinov2-inference/` calcula la representación DINOv2 de la imagen de consulta. El frontend compara esa representación con los vectores PetFinder disponibles y devuelve los perfiles con mayor similitud.

## Datos preparados para el frontend

`frontend/server-data/` contiene proyecciones derivadas de los datos científicos necesarias para que la aplicación pueda responder sin cargar directamente los datasets de trabajo completos ni los modelos serializados en cada petición.

Los scripts de preparación seleccionan y transforman información ya existente; no sustituyen el entrenamiento ni la evaluación científica documentados en los notebooks.

## Principios de trazabilidad

La aplicación mantiene los siguientes criterios:

- las métricas mostradas proceden de resultados versionados;
- los perfiles conservan un identificador que permite relacionarlos con su fuente PetFinder;
- los modelos, embeddings y resultados permanecen separados de las capas de presentación;
- no se inventan explicaciones individuales cuando no existe un artefacto que las sustente;
- las transformaciones destinadas a la web no modifican los resultados científicos originales.

## Alcance de los datos históricos

Los animales mostrados pertenecen a registros históricos. La presencia de un perfil en InvisibleDogs Predict no implica disponibilidad actual para adopción.

La aplicación utiliza estos datos para demostrar el funcionamiento del sistema de análisis, búsqueda y priorización manteniendo explícita la naturaleza histórica de las fuentes.
