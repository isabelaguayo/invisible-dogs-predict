# Resultados

Esta carpeta reúne resultados derivados del desarrollo experimental del TFM que se conservan de forma independiente a los notebooks para facilitar la revisión, trazabilidad y reproducibilidad.

## Estructura actual

```text
outputs/
├── metrics/              # Evaluación del modelo principal de clasificación
├── interpretability/     # Invisible Dog Score, SHAP, perfiles y análisis de errores
├── regression/           # Modelización complementaria de duración de estancia
├── testing/              # Validación funcional e integración final
├── petfinder/            # Resultados del análisis complementario PetFinder
└── tsinghua_visual/      # Validación externa y recuperación visual
```

## Contenido

### `metrics/`
Incluye comparación de modelos base y candidatos finales, evaluación sobre test, calibración por deciles, métricas Top-K, análisis de umbrales operativos y controles de fuga temporal.

### `interpretability/`
Incluye resultados del Invisible Dog Score, métricas con intervalos de confianza, calibración y ganancia acumulada, importancia de variables, SHAP global y local, perfiles por bandas de riesgo y ejemplos de errores.

### `regression/`
Incluye comparación de modelos de regresión, análisis de errores, importancia de variables, severidad estimada de estancia y comparación con el enfoque de clasificación.

### `testing/`
Incluye el informe final de validación e integración y su resumen ejecutivo.

### `petfinder/`
Incluye resultados agregados y evidencias del análisis complementario de PetFinder: selección de modelos, métricas sobre test, calibración, Top-K y bandas del score final. Los datasets de mayor tamaño y caches intermedias se conservan en `data/` o se gestionan separadamente cuando requieren Git LFS.

### `tsinghua_visual/`
Incluye índices reproducibles de train/validation, embeddings CLIP y DINOv2, prototipos de raza, catálogo de razas y configuración del buscador visual. Los `.npz` se gestionan mediante Git LFS.

## Criterio de versionado

Se incluyen CSV y JSON derivados que aportan evidencia científica o funcional directa. Los artefactos binarios necesarios para inferencia, como modelos serializados o embeddings, se almacenan en `artifacts/` o en su carpeta experimental correspondiente y se gestionan mediante Git LFS cuando aplica.
