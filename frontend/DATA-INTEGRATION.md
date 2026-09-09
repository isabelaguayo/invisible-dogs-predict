# Integración con GitHub — 9 de septiembre de 2026

## Fuente de verdad y sincronización

- Repositorio: `isabelaguayo/invisible-dogs-predict`.
- Rama activa: `documentacion-tfm`.
- Commit base: `1fe0bcff9a1fa13b86f5d028b05a526f839b6aef` (`Add PetFinder raw images`).
- `git fetch origin documentacion-tfm` y cambio a la rama con seguimiento remoto.
  Comprobación final por `git ls-remote`: el mismo commit seguía siendo la punta.
- Se conservaron los cambios previos de la web; no se hizo commit, push o despliegue.
- La conclusión anterior sobre ausencia de Austin correspondía a `main` y queda
  corregida. Austin sí existe en la rama solicitada.
- Se inventarió el árbol completo de Git, incluidos los punteros LFS. Se descargaron
  selectivamente los contenidos necesarios, no las decenas de miles de imágenes
  ni los Parquet de entrenamiento. Un puntero LFS no se trató como dato ausente.

## Inventario revisado

| Carpeta | Contenido encontrado / uso |
| --- | --- |
| `data/raw/austin/` | Dos snapshots CSV de entradas y salidas del 10-08-2026, versionados en LFS. Inventariados; no es necesario recomponer el dataset. |
| `data/processed/austin/` | `invisible_dogs_dataset_preparado.csv`: descargado y verificado por SHA-256, 93.803 registros y 55 columnas. No se recalcularon scores. |
| `data/raw/tsinghua/` | Siete Parquet LFS: seis de entrenamiento y uno de validación. Se reutilizan sus representaciones ya generadas. |
| `data/raw_petfinder/` | 163.864 archivos: cinco CSV, 72.776 JPG y 91.083 JSON de metadatos/sentimiento. Inventario de Git; únicamente se materializaron doce fotos nuevas requeridas por la vista inicial. |
| `data/processed/` | Dataset Austin y cuatro CSV PetFinder: base, enriched, enriched_completo y enriched_scored. Se descargó el último: 8.132 registros, descripciones y score final. |
| `outputs/` | 86 archivos: 70 CSV, nueve NPZ, tres PNG, un PKL, dos JSON y README. Incluye métricas Austin, interpretabilidad, regresión, resultados PetFinder, representaciones visuales y validación Tsinghua/testing. |
| `artifacts/` | Once archivos: tres modelos finales PKL, cuatro NPZ, dos CSV de búsqueda y configuración JSON, además del README. Los PKL se inventariaron sin deserializarlos ni ejecutarlos. |
| `frontend/` | 196 archivos versionados en el commit base. Revisados páginas, componentes, datos, hooks, servicios de datos, endpoints, pruebas, assets y configuración. |
| `notebooks/`, `docs/` | Nueve notebooks y documentación como referencia semántica. No se ejecutaron notebooks. |

Modelos Austin encontrados: `artifacts/models/modelo_final_invisible_dogs.pkl` y
`modelo_regresion_estancia_complementario.pkl`. Modelo PetFinder final:
`modelo_complementario_petfinder_final.pkl`.

## Correspondencia entre fuentes y web

| Elemento | Fuente efectiva |
| --- | --- |
| Home, tarjeta histórica | Sophie, edad, riesgo y completitud de `frontend/server-data/adoptante/petfinderProfiles.v1.json`; sustituye la tarjeta ficticia Akira/87 %. |
| Home, base científica Austin | `outputs/interpretability/metricas_invisible_dog_score_test.csv`: ROC AUC de test 0,8593. |
| Protectora, contexto Austin | El mismo CSV, `resumen_bandas_riesgo_test.csv` y `metricas_topk_invisible_dog_score_test.csv`: cohorte de 18.752 registros, recall 67,56 % y precisión Top 10 % 61,03 %. |
| Fichas Protectora, contexto Austin | Rendimiento de test del modelo principal, identificado expresamente como resultado global, no como predicción del perro PetFinder. |
| Home y Protectora, modelo PetFinder | `outputs/petfinder/resultados_modelo_final_petfinder_test.csv`: ensemble texto + estructurado, ROC AUC test 0,7384. No se utiliza el ranking antiguo de `ranking_petfinder_adopcion_lenta.csv`. |
| Protectora: KPI, distribución de riesgo, completitud, matriz, revisión y fichas | Catálogo compartido de 6.474 perfiles, manteniendo la selección histórica de seis PetID y los gráficos existentes. Métricas contrastadas con `data/processed/petfinder_dogs_enriched_scored.csv` y `artifacts/visual_search/invisible_dogs_petfinder_search_index.csv`. |
| Explicaciones individuales de riesgo PetFinder | `frontend/server-data/protectora/petfinderProtectoraExplanations.v2.json`, conservado. No se sustituyen por SHAP Austin ni por métricas globales. |
| Descripciones Protectora | `Description` del CSV procesado, con las traducciones españolas existentes conservadas como presentación. Ya no se mantienen copias manuales de las descripciones inglesas en TypeScript. |
| Adoptante: filtros, resultados, favoritos, fichas | Catálogo existente, validado contra los datos de GitHub. Los 6.474 perfiles son individuales; los 7.938 del índice visual también incluyen fichas de grupos, por lo que no se amplía indiscriminadamente el catálogo. |
| Adoptante: texto de las fichas | `PetID` + `Description` de `data/processed/petfinder_dogs_enriched_scored.csv`. 6.473 descripciones originales no vacías, identificadas como históricas y en su idioma de origen. Una ficha sin texto conserva el resumen estructurado. |
| Fotografías | 69 fotos del catálogo previo + seis de Protectora + doce de `data/raw_petfinder/train_images/` para la búsqueda inicial por características. Las 87 coinciden con el SHA-256 de sus originales LFS. |
| Tsinghua: referencias | Catálogo de 130 razas y `artifacts/visual_search/invisible_dogs_search_config.json`; cantidad real utilizada también en Home. |
| Similitud por raza | `artifacts/embeddings/tsinghua_dinov2_breed_prototypes.npz` y `petfinder_dinov2_embeddings.npz`, ya representados por los F32 existentes del frontend. Se verificó igualdad exacta de los 130 prototipos y de los 6.474 vectores/IDs seleccionados. |
| Similitud por fotografía | Servicio DINOv2 existente para la imagen de consulta; comparación con los vectores PetFinder ya generados. Sin entrenamiento ni reconstrucción del índice. |
| Nubes de palabras | PNG editoriales existentes y sus términos/pesos del script previo. Se conserva el diseño y se aclara que el tamaño no representa frecuencias ni pesos del modelo. |

El notebook 08 diferencia explícitamente el modelo principal Austin de las fichas
PetFinder usadas por el MVP. También documenta que Austin necesita un dataset
analítico compatible; no acepta aplicar directamente su contrato a un registro
crudo aislado de PetFinder. Se mantiene esa separación y el orden actual de las
recomendaciones, sin introducir un score combinado ni un nuevo flujo.

## Adaptación eficiente, sin nuevos cálculos científicos

`scripts/prepare-tfm-web-data.py` selecciona columnas y filas existentes y comprueba
su identidad con el commit fijado. Produce dos proyecciones JSON para la web:

- `tfmSources.v1.json`: valores de los CSV/JSON, procedencia y hashes (unos 13 KB).
- `petfinderDescriptions.v1.json`: descripciones existentes por PetID (2,23 MB).

Copia doce JPG originales, 302.924 bytes en total, a una carpeta pública separada.
No ejecuta modelos, calcula SHAP, crea embeddings, reconstruye índices ni genera
figuras. Las únicas operaciones numéricas de presentación son sumar recuentos de
bandas y convertir proporciones a porcentajes. El paquete standalone incluye los
datos importados en sus bundles; no necesita los grandes CSV, NPZ originales o PKL.

## Archivos modificados o añadidos respecto al commit base

Código y pruebas:

- `frontend/src/app/page.tsx`
- `frontend/src/app/protectora/page.tsx`
- `frontend/src/app/protectora/perro/[id]/page.tsx`
- `frontend/src/app/adoptante/perro/[id]/page.tsx`
- `frontend/src/data/protectoraPetfinderProfiles.ts`
- `frontend/src/lib/adoptante/presentation.ts`
- `frontend/src/lib/tfm/results.ts` (nuevo)
- `frontend/src/lib/tfm/descriptions.ts` (nuevo)
- `frontend/tests/protectora-explanations.test.mjs`
- `frontend/tests/protectora-shared-data.test.mjs` (nuevo)
- `scripts/prepare-tfm-web-data.py` (nuevo)

Datos y documentación:

- `frontend/server-data/tfm/tfmSources.v1.json` (nuevo)
- `frontend/server-data/tfm/petfinderDescriptions.v1.json` (nuevo)
- `frontend/DATA-INTEGRATION.md` (nuevo)
- Doce JPG nuevos en `frontend/public/images/petfinder/historical/`:
  `000a290e4-1.jpg`, `000fb9572-1.jpg`, `00156db4a-1.jpg`, `0038234c6-1.jpg`,
  `0038c9343-1.jpg`, `004a26127-1.jpg`, `0058586f1-1.jpg`, `005bb92d8-1.jpg`,
  `0063bd7e0-1.jpg`, `00648f96f-1.jpg`, `006610fe3-1.jpg`, `00709d75b-1.jpg`.

Se mantienen estilos, estructura de páginas, navegación, CTA, autenticación,
configuración Next, publicación Azure y servicio de inferencia. Los artefactos
científicos versionados permanecen intactos.

## Validación realizada

- `npm test`: 198 pruebas, todas aprobadas (8 Home, 113 Adoptante, 77 Protectora).
- `npm run build`: compilación, TypeScript y prerenderizado correctos.
- `npx eslint src tests scripts next.config.ts eslint.config.mjs postcss.config.mjs`:
  sin errores ni avisos. El lint global tiene el problema previo de incluir el
  JavaScript compilado de `deploy`; no se cambió su configuración.
- Validación contra GitHub: cero discrepancias de PetID, foto, score final o
  condición individual en los 6.474 perfiles. Igualdad exacta NPZ/F32 y SHA-256
  de las 87 imágenes con sus punteros LFS del commit.
- Servidor de producción `standalone`, con sus assets públicos y estáticos:
  Home, login, entradas de Adoptante, filtros y búsqueda por raza responden 200.
  Protectora y sus seis fichas responden con sesión; sin sesión redirigen.
- Verificados rechazo de credenciales incorrectas, 18 fichas Adoptante y favoritos
  con fotos reales, 404 de perfil inexistente, expiración de cookie en logout,
  validación de archivo ausente y respuesta real de DINOv2 con 12 resultados.
- 117 recursos gráficos públicos responden correctamente; las doce nuevas fotos
  pasan por el optimizador Next. Las dos nubes diferidas se decodifican en navegador.
- Chromium sobre standalone: ambos CTA Home, elección de características, selección
  de raza, login → matriz → ficha → logout, favorito persistente y subida de foto
  con 12 resultados. Sin errores de ejecución. Home y ficha real comprobadas a
  390 px sin desbordamiento horizontal; revisión visual de Protectora en escritorio.

## Partes ilustrativas y límites reales

- Las nubes son editoriales. No hay exportación independiente de sus frecuencias
  científicas en los outputs de esta rama; no se extraen ni regeneran resultados
  desde las salidas embebidas de los notebooks, que se usan solo como referencia.
- Los animales son históricos. No hay disponibilidad actual ni sistema de gestión
  de una protectora real; la autenticación existente de revisión se conserva.
- Las imágenes completas sí existen en GitHub/LFS. Solo se publican las requeridas
  por los escenarios preparados, 87 en total. Otras fichas conservan el estado de
  foto no disponible. La prueba de URL pública `media.githubusercontent.com` dio
  404: no se introducen URLs rotas ni se presupone acceso anónimo en producción.
- Una descripción original está vacía y utiliza el fallback estructurado.
- Austin está conectado mediante sus resultados históricos de test. No se recalcula
  inferencia ni se aplica a los perros PetFinder; incorporar animales Austin como
  nuevas fichas requeriría otro contrato/recorrido, fuera de conservar las páginas.
- Las explicaciones específicas PetFinder disponibles en el contrato de la web
  cubren seis perfiles. No se inventan explicaciones para los demás.
- El servicio DINOv2 estaba operativo durante las pruebas; la consulta por foto
  sigue dependiendo de que ese servicio esté disponible en el entorno publicado.
- `demoDogs.ts` permanece sin consumidores. Su colección ficticia no alimenta la web.

Sin commit ni push. Resultado pendiente de revisión de la usuaria.
