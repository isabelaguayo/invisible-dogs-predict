# Datos

Esta carpeta documenta los conjuntos de datos utilizados en el TFM y los archivos derivados necesarios para reproducibilidad, respetando las condiciones de uso y redistribución de cada fuente.

## Austin Animal Center

El modelo principal utiliza datos de entradas y salidas del Austin Animal Center obtenidos a través del City of Austin Open Data Portal. La política del portal indica que, salvo indicación contraria en los metadatos, sus datasets se ofrecen sin restricciones y en dominio público.

En el repositorio se conservarán mediante Git LFS los snapshots y/o derivados finales necesarios para reproducir la preparación de datos y la modelización. Se mantendrá la atribución al City of Austin y al Austin Animal Center.

## PetFinder.my

El análisis complementario utiliza los datos de la competición **PetFinder.my Adoption Prediction** de Kaggle, con variables estructuradas, texto, imágenes y metadatos asociados.

Las reglas de la competición permiten su uso para investigación académica y educación, pero restringen la publicación o redistribución de los datos de la competición a personas que no hayan aceptado dichas reglas. Por este motivo, el repositorio no distribuirá el dataset bruto ni archivos derivados que reproduzcan registros individuales de PetFinder.

La reproducibilidad de esta parte se apoya en los notebooks, el código de preparación, las métricas agregadas y la documentación necesaria para que un usuario autorizado pueda obtener los datos desde Kaggle y regenerar los derivados.

## Tsinghua Dogs

El conjunto **Tsinghua Dogs** se utiliza para validación externa y recuperación visual. La versión utilizada está disponible en Hugging Face en `giacomov/tsinghua_dogs` y se distribuye bajo licencia **CC BY 4.0**.

Debido a que el conjunto bruto ocupa varios GB, no se replica completo en este repositorio. Se documenta su fuente y se conservan únicamente los artefactos derivados necesarios para el análisis, junto con la atribución correspondiente.

## Reproducibilidad

Para cada conjunto se documentará:

- fuente y versión o fecha de descarga;
- condiciones de uso o licencia aplicables;
- archivos utilizados;
- notebook o script responsable de su transformación;
- artefactos derivados;
- localización dentro del repositorio;
- hash cuando esté disponible.
