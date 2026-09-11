# Artefactos del modelo

Esta carpeta reúne los artefactos necesarios para reproducir y ejecutar las distintas partes de **InvisibleDogs Predict**.

## Estructura actual

```text
artifacts/
├── models/         # Modelos serializados finales
├── embeddings/     # Embeddings y prototipos visuales
└── visual_search/  # Índices, catálogo de razas y configuración de búsqueda visual
```

## `models/`

Contiene los modelos finales utilizados en los análisis principales y complementarios:

- modelo principal de clasificación de larga estancia;
- modelo complementario de regresión de duración de estancia;
- modelo complementario PetFinder.

## `embeddings/`

Incluye representaciones visuales y prototipos utilizados en la recuperación por similitud, entre ellos los embeddings PetFinder y Tsinghua generados con DINOv2.

## `visual_search/`

Agrupa los recursos necesarios para construir y consultar el buscador visual, como el catálogo de razas, el índice de perfiles PetFinder y la configuración asociada.

## Versionado

Los artefactos binarios y archivos de gran tamaño se gestionan mediante **Git LFS** cuando corresponde. Los modelos y representaciones aquí versionados deben mantener correspondencia con los notebooks, resultados y servicios de inferencia del proyecto.
