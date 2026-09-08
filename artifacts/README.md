# Artefactos del modelo

Esta carpeta reúne los artefactos necesarios para reproducir y ejecutar las distintas partes de InvisibleDogs Predict.

Estructura prevista:

```text
artifacts/
├── models/       # Modelos serializados finales
├── embeddings/   # Embeddings y prototipos visuales
└── configs/      # Configuraciones y manifiestos de runtime
```

Los archivos binarios de mayor tamaño se gestionarán mediante Git LFS cuando corresponda. Los modelos y artefactos incorporados aquí deben corresponder a las versiones finales utilizadas en los notebooks y/o en los servicios de inferencia.
