# Resultados

Esta carpeta reúne resultados derivados del desarrollo experimental del TFM que se conservan de forma independiente a los notebooks para facilitar la revisión, trazabilidad y reproducibilidad.

## Estructura actual

```text
outputs/
├── metrics/              # Evaluación del modelo principal de clasificación
├── interpretability/     # Invisible Dog Score, SHAP, perfiles y análisis de errores
├── regression/           # Modelización complementaria de duración de estancia
└── testing/              # Validación funcional e integración final
```

## Contenido

### `metrics/`
Incluye comparación de modelos base y candidatos finales, evaluación sobre test, calibración por deciles, métricas Top-K, análisis de umbrales operativos y controles de fuga temporal.

### `interpretability/`
Incluye resultados del Invisible Dog Score, métricas con intervalos de confianza, calibración y ganancia acumulada, importancia de variables de CatBoost y LightGBM, SHAP global y local, perfiles por bandas de riesgo y ejemplos de aciertos, falsos positivos y falsos negativos.

### `regression/`
Incluye comparación de modelos de regresión, análisis de errores, importancia de variables, severidad estimada de estancia y comparación entre el enfoque de clasificación y el enfoque complementario de regresión.

### `testing/`
Incluye el informe final de validación e integración y su resumen ejecutivo. El resultado final documentado es de 132 pruebas superadas, sin fallos ni bloqueos críticos, con resultado global `GO`.

## Criterio de versionado

Se incluyen aquí CSV y JSON derivados que aportan evidencia científica o funcional directa. Los artefactos binarios necesarios para inferencia, como modelos serializados o embeddings, se almacenarán en `artifacts/` y se gestionarán mediante Git LFS cuando corresponda.

Los paths absolutos que puedan aparecer dentro del informe de testing reflejan el entorno local en el que se ejecutó la validación original; no constituyen rutas necesarias para reproducir el proyecto desde este repositorio.
