# Datos

Esta carpeta reúne los conjuntos de datos utilizados en **InvisibleDogs Predict** y los archivos derivados necesarios para mantener la trazabilidad y reproducibilidad del proyecto.

## Estructura actual

```text
data/
├── raw/
│   ├── austin/                 # Snapshots originales de Austin Animal Center
│   └── tsinghua/               # Parquet de Tsinghua Dogs
├── raw_petfinder/              # Datos originales PetFinder.my
└── processed/
    ├── austin/                 # Dataset preparado para el modelo principal
    ├── petfinder_dogs_base.csv
    ├── petfinder_dogs_enriched.csv
    ├── petfinder_dogs_enriched_completo.csv
    └── petfinder_dogs_enriched_scored.csv
```

## Austin Animal Center

El modelo principal utiliza datos de entradas y salidas del Austin Animal Center obtenidos a través del City of Austin Open Data Portal.

En `data/raw/austin/` se conservan los snapshots de entradas y salidas empleados, mientras que `data/processed/austin/` contiene el dataset preparado para la modelización.

## PetFinder.my

El análisis complementario utiliza los datos de la competición **PetFinder.my Adoption Prediction** de Kaggle, incluyendo variables estructuradas y, en los análisis que lo requieren, texto, imágenes, metadatos y sentimiento.

Los archivos originales se almacenan en `data/raw_petfinder/`. Los datasets derivados utilizados para análisis, scoring y consumo posterior se conservan en `data/processed/`.

El notebook principal asociado es `notebooks/05_petfinder_analisis_complementario.ipynb`.

## Tsinghua Dogs

El conjunto **Tsinghua Dogs** se utiliza para validación externa y recuperación visual. La versión empleada procede de `giacomov/tsinghua_dogs` en Hugging Face.

Los siete archivos Parquet utilizados se conservan en `data/raw/tsinghua/`. Las representaciones y resultados derivados se almacenan en `outputs/tsinghua_visual/` y `artifacts/`.

## Reproducibilidad

Para cada fuente se mantiene, cuando corresponde:

- procedencia y versión o fecha de descarga;
- archivos originales utilizados;
- datasets procesados;
- notebook o script responsable de la transformación;
- artefactos y resultados derivados;
- localización dentro del repositorio;
- gestión mediante **Git LFS** para archivos de gran tamaño.

Los datos de gran volumen que lo requieren se versionan mediante Git LFS para mantener el repositorio manejable sin perder trazabilidad.
