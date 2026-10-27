---
name: arcgis-starter-app
description: >
  Arma desde cero un proyecto web nuevo del ArcGIS Maps SDK for JavaScript 5.1
  con Vite y TypeScript (strict). Cubre las dependencias, la API key por
  variables de entorno (y dejar .env fuera de git, que la plantilla de Vite no
  hace), el registro de Map Components, obtener la vista con viewOnReady() (el
  detail de arcgisViewReadyChange es null) y la integración con TS sin framework,
  React 19 y Angular. Usa esta skill cuando el usuario empiece un proyecto ArcGIS
  nuevo, pregunte cómo configurar el SDK o lo conecte a un framework.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: core
tags:
  - scaffolding
  - vite
  - typescript
  - setup
  - framework
packages:
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
  - "@esri/calcite-components@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# App Inicial

> **Cuándo usar:** Activa esta skill cuando el usuario inicie un proyecto ArcGIS Maps SDK 5.0,
> configure dependencias, defina el API key, o integre el SDK con Vite, React 19 o Angular.

## Resumen

Esta skill arranca un proyecto SDK 5.1 funcional y lo cablea correctamente para que el primer mapa renderice.

- **Problema que resuelve:** ir de carpeta vacía a una app ArcGIS corriendo y tipada en minutos.
- **A quién sirve:** desarrolladores (en especial SEs LATAM) que inician apps web ArcGIS nuevas.
- **Patrón que enseña:** Vite + TS strict, Map-Components-primero, API key vía `import.meta.env`.
- **Qué NO cubre:** construir el mapa (ver `arcgis-core-maps`) ni agregar datos (`arcgis-layers`).

## Inicio Rápido

```bash
bash scripts/scaffold.sh my-arcgis-app   # PKG_MANAGER=npm para usar npm
cd my-arcgis-app
cp .env.example .env   # agrega VITE_ARCGIS_API_KEY (el scaffold ignora .env en git)
pnpm dev
```

Medido el 2026-10-27 (pnpm 10 y npm 11): el scaffold resolvió `@arcgis/core` y `@arcgis/map-components` 5.1.27,
`@esri/calcite-components` 5.2.0, Vite 8.3 y TypeScript 7.0, y `pnpm build` (`tsc && vite build`) pasó.

## Árbol de Decisión

1. **¿Qué framework?**
   - TS sin framework → usa el scaffold tal cual.
   - React 19+ → usa Map Components directamente (custom elements + props de evento `onarcgis*`).
   - Angular → agrega `CUSTOM_ELEMENTS_SCHEMA`; importa el CSS de los componentes explícitamente.

2. **¿Ya tienes API key?**
   - No → usa `basemap="osm"` mientras desarrollas; los basemaps `arcgis/*` necesitan key (ver Pitfall 3).
   - Sí → ponla en `.env` como `VITE_ARCGIS_API_KEY`.

**Por defecto:** Vite + TS sin framework con Map Components.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import esriConfig from "@arcgis/core/config.js";
```

### Imports dinámicos (CDN)

```javascript
const esriConfig = await $arcgis.import("@arcgis/core/config.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Vite + TypeScript strict

El scaffold usa la plantilla `vanilla-ts` de Vite con `moduleResolution: "bundler"`, que los exports del paquete del
SDK necesitan. Medido: la plantilla actual **no** pone `strict`, así que el scaffold agrega `"strict": true`.

### Concepto 2: API key por variable de entorno

Pon `esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY`. Vite solo expone variables con prefijo `VITE_`.
Guarda la key real en `.env` y versiona `.env.example`. Medido: el `.gitignore` de la plantilla de Vite ignora
`*.local` pero **no `.env`**; el scaffold lo agrega.

### Concepto 3: registrar componentes y llegar a la vista

Los Map Components son custom elements que se registran con imports de efecto. Para usar la vista desde el código,
haz `await el.viewOnReady()` y lee `el.view`; el evento `arcgisViewReadyChange` no trae carga.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Leer la vista del detail del evento

```typescript
// ❌ Anti-patrón
mapEl.addEventListener("arcgisViewReadyChange", (e) => console.log((e as CustomEvent).detail.view));
```

```typescript
// ✅ Correcto
const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
console.log(mapEl.view.type); // "2d"
```

**Impacto:** medido con 5.1.27: el evento se disparó una vez con `detail === null`, así que `detail.view` lanza
`Cannot read properties of null`. El scaffold de la versión anterior de esta skill traía esa línea.

### Pitfall 2: Un `.env` que git no ignora

```bash
# ❌ Anti-patrón
cp .env.example .env && git add . && git commit -m "init"   # la plantilla de Vite no ignora .env
```

```bash
# ✅ Correcto
grep -qx ".env" .gitignore || echo ".env" >> .gitignore   # el scaffold lo hace
```

**Impacto:** medido: el `.gitignore` generado trae `*.local` pero no `.env`, así que la API key real entra al
historial de git. Tampoco pongas la key en el código.

### Pitfall 3: Basemaps `arcgis/*` sin key

```html
<!-- ❌ Anti-patrón: todavía no hay VITE_ARCGIS_API_KEY -->
<arcgis-map basemap="arcgis/topographic" center="-74.08,4.6" zoom="11"></arcgis-map>
```

```html
<!-- ✅ Correcto mientras no tengas key -->
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="11"></arcgis-map>
```

**Impacto:** medido en la app del scaffold sin `.env`: un `401`, un `calcite-dialog` de inicio de sesión y
`view.ready` todavía en `false` a los 15 s. Nada en la consola dice "falta la API key".

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Detalles de config / tsconfig / env | `references/api-detail.md` |
| Setups de React 19 y Angular | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-core-maps` — construye el mapa tras el scaffold
- `arcgis-widgets-ui` — agrega UI con Calcite + componentes
- `arcgis-performance` — optimiza el bundle

## Samples de Referencia

- [Get started (npm)](https://developers.arcgis.com/javascript/latest/get-started-npm/)
- [intro-map-components](https://developers.arcgis.com/javascript/latest/sample-code/intro-map-components/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Se corrió el scaffold de punta a punta (pnpm y npm), se compiló y se abrió en
  Chromium; las pruebas en tiempo de ejecución están en `tests/runtime/casos/arcgis-starter-app.ts`. Se arregló el
  scaffold: su `main.ts` leía `(e as CustomEvent).detail.view`, que lanza (`detail` es `null`); la plantilla de Vite
  ni pone `strict` ni ignora `.env`; el aviso final decía `npm dev`. Dependencias ahora en `^5.1`. Se actualizó el
  pitfall de moduleResolution (TypeScript 7 eliminó `node`; en 5.9 fallan los imports con tipos de map-components).
  Nuevos pitfalls principales: el detail nulo, el `.env` sin ignorar y los basemaps `arcgis/*` sin key.
- **0.1.0** (2026-05-31): Versión inicial.
