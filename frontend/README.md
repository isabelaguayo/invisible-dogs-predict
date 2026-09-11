# Frontend · InvisibleDogs Predict

Aplicación web de **InvisibleDogs Predict**, desarrollada con Next.js para presentar los resultados científicos del proyecto y ofrecer recorridos diferenciados para adoptantes y protectoras.

## Funcionalidades principales

### Adoptante

- búsqueda de perfiles por características básicas;
- búsqueda por apariencia y referencia visual;
- búsqueda por fotografía mediante DINOv2;
- resultados ordenados y fichas individuales;
- sistema de favoritos en el navegador.

### Protectora

- resumen del conjunto histórico PetFinder;
- distribución del riesgo complementario de adopción lenta;
- revisión de completitud de las fichas;
- selección de perfiles prioritarios;
- explorador de los perfiles históricos disponibles;
- fichas individuales con interpretación y acciones orientadas a mejorar la visibilidad.

## Tecnología

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- servicio externo de inferencia DINOv2 para búsqueda por fotografía

## Estructura relevante

```text
frontend/
├── public/          # Recursos gráficos y fotografías publicadas
├── server-data/     # Datos preparados para consumo de servidor
├── src/app/         # Rutas y páginas de la aplicación
├── src/components/  # Componentes reutilizables
├── src/data/        # Datos estructurados de presentación
├── src/lib/         # Lógica de negocio y acceso a artefactos
├── tests/           # Pruebas funcionales y de consistencia
└── scripts/         # Utilidades y benchmarks del frontend
```

## Ejecución local

Desde `frontend/`:

```bash
npm install
npm run dev
```

La aplicación se sirve por defecto en `http://localhost:3000`.

## Variables de entorno

Las variables necesarias se documentan en `.env.example`. Incluyen:

- URL del servicio DINOv2;
- credenciales del acceso de Protectora para el entorno correspondiente;
- secreto utilizado para firmar la sesión de Protectora.

Los valores reales no deben incorporarse al repositorio.

## Validación

Comandos principales:

```bash
npm test
npm run lint
npm run build
```

Las pruebas están organizadas por Home, Adoptante y Protectora.

## Datos consumidos

La web utiliza proyecciones y artefactos derivados de Austin Animal Center, PetFinder.my y Tsinghua Dogs. La correspondencia entre estas fuentes, los modelos y los elementos mostrados en la aplicación se documenta en `DATA-INTEGRATION.md`.

## Publicación

La aplicación utiliza una salida standalone de Next.js y se publica en Azure App Service mediante los flujos definidos en `.github/workflows/`.
