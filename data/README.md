# Datos

Esta carpeta reúne los conjuntos de datos utilizados en el TFM y los archivos derivados necesarios para su trazabilidad y reproducibilidad.

## Estructura

```text
data/
├── raw/
│   ├── austin/
│   └── tsinghua/
├── raw_petfinder/
└── processed/
    └── austin/
```

## Austin Animal Center

El modelo principal utiliza datos de entradas y salidas del Austin Animal Center obtenidos a través del City of Austin Open Data Portal.

Se conservan en `data/raw/austin/` los snapshots de entradas y salidas utilizados y en `data/processed/austin/` el dataset preparado para la modelización. Estos archivos se gestionan mediante Git LFS cuando corresponde.

## PetFinder.my

El análisis complementario utiliza los datos de la competición **PetFinder.my Adoption Prediction** de Kaggle, incluyendo variables estructuradas y, en los análisis que lo requieren, información textual, visual, metadatos y sentimiento.

Los archivos base se almacenan en `data/raw_petfinder/`. Su inclusión en este repositorio se realiza conforme al permiso de uso y entrega del TFM indicado por la autora del proyecto.

El notebook principal asociado es `notebooks/05_petfinder_analisis_complementario.ipynb`.

## Tsinghua Dogs

El conjunto **Tsinghua Dogs** se utiliza para validación externa y recuperación visual. La versión empleada procede de `giacomov/tsinghua_dogs` en Hugging Face.

Los siete archivos Parquet utilizados se conservan en `data/raw/tsinghua/` y se gestionan mediante Git LFS. Los artefactos derivados de representación visual se conservan en `outputs/tsinghua_visual/` y `artifacts/`.

## Reproducibilidad

Para cada conjunto se documentan, cuando aplica:

- fuente y versión o fecha de descarga;
- archivos utilizados;
- notebook o script responsable de su transformación;
- artefactos derivados;
- localización dentro del repositorio;
- gestión mediante Git LFS para archivos de gran tamaño.
