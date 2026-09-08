# Datos

Esta carpeta documenta los conjuntos de datos utilizados en el TFM y albergará los derivados que sea razonable versionar directamente en GitHub.

## Austin Animal Center

Se utilizaron snapshots de entradas y salidas del Austin Animal Center obtenidos en agosto de 2026, junto con un dataset procesado generado durante la preparación de datos. Los snapshots originales y los derivados procesados se incorporarán al repositorio cuando su tamaño lo permita, usando Git LFS cuando corresponda.

## PetFinder.my

El proyecto utiliza datos históricos de PetFinder.my, incluyendo variables estructuradas, texto, imágenes y metadatos derivados. Los artefactos procesados relevantes para reproducibilidad se incorporarán al repositorio. El conjunto bruto completo de imágenes no se duplicará aquí si su tamaño o condiciones de redistribución lo desaconsejan; en ese caso se documentará la fuente original y el procedimiento exacto de obtención.

## Tsinghua Dogs

El conjunto Tsinghua Dogs se utiliza para validación externa y recuperación visual. Debido a que los archivos brutos ocupan varios GB, el repositorio conservará los artefactos derivados necesarios —índices, embeddings, prototipos y catálogos— y documentará la fuente original y el procedimiento de descarga del dataset bruto.

## Reproducibilidad

Para cada conjunto se documentará:

- fuente y versión o fecha de descarga;
- archivos utilizados;
- notebook o script responsable de su transformación;
- artefactos derivados;
- localización dentro del repositorio;
- hash cuando esté disponible.
