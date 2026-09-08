# InvisibleDogs Predict

**InvisibleDogs Predict** es el proyecto desarrollado como Trabajo Fin de Máster para analizar y modelizar el riesgo de larga estancia de perros en refugios animales, incorporando técnicas de Machine Learning, interpretabilidad, análisis textual y recuperación visual mediante representaciones profundas.

## Demo

La aplicación web está desplegada en Azure App Service:

https://invisibledogs-predict-dfacg2ene0hrhmba.spaincentral-01.azurewebsites.net/

## Estructura del repositorio

```text
invisible-dogs-predict/
├── frontend/      # Aplicación web Next.js
├── services/      # Servicios Python de inferencia
├── scripts/       # Generación y preparación de artefactos
├── notebooks/     # Desarrollo experimental y científico del TFM
├── data/          # Datos procesados y documentación de fuentes
├── artifacts/     # Modelos, embeddings y configuraciones reproducibles
├── outputs/       # Métricas y resultados derivados
├── docs/          # Documentación complementaria
└── .github/       # Automatización de despliegue
```

## Notebooks

La secuencia experimental del TFM se organiza en nueve notebooks, desde la preparación y análisis exploratorio de los datos hasta la validación e integración del sistema y el desarrollo del MVP. La carpeta `notebooks/` documenta el orden recomendado de ejecución.

## Datos y reproducibilidad

Los datos derivados y artefactos de tamaño razonable se incorporan al repositorio. Para conjuntos de datos originales de gran volumen o cuya redistribución deba realizarse desde su fuente original, `data/README.md` documenta la procedencia, versión utilizada y forma de obtención.

Los modelos y artefactos binarios de mayor tamaño se gestionarán mediante Git LFS cuando corresponda.

## Seguridad

El repositorio no contiene credenciales ni secretos de despliegue. Las variables de entorno necesarias se documentan mediante archivos de ejemplo, sin valores reales.

## Estado

La rama `documentacion-tfm` se utiliza para organizar la entrega académica y completar la trazabilidad entre datos, notebooks, modelos, resultados y aplicación antes de incorporar estos cambios a `main`.
