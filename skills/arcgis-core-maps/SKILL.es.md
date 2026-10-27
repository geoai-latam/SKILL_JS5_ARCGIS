---
name: arcgis-core-maps
description: >
  Inicializa MapView 2D y SceneView 3D con el ArcGIS Maps SDK for JavaScript 5.0.
  Cubre el objeto Map, la selección de basemap, la navegación de la vista (center,
  zoom, camera), los Map Components arcgis-map / arcgis-scene, y la decisión entre
  Map Components y la Core API. Usa esta skill cuando el usuario cree un mapa o
  escena, fije un basemap, o pregunte cómo mostrar datos geográficos en la web.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: core
tags:
  - map
  - scene
  - basemap
  - mapview
  - sceneview
requires:
  - arcgis-starter-app
packages:
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Mapas Core

> **Cuándo usar:** Activa esta skill cuando el usuario cree un mapa 2D o escena 3D, elija un
> basemap, controle la vista (center/zoom/camera), o pregunte si usar Map Components o la
> Core API.

## Resumen

Un mapa en el SDK tiene dos partes: un **`Map`** (el modelo de datos — basemap, layers, ground) y
una **vista** que lo renderiza — `MapView` para 2D o `SceneView` para 3D.

- **Problema que resuelve:** poner en pantalla un mapa o escena correcto y performante con la API adecuada.
- **A quién sirve:** cualquier desarrollador web que inicia una app ArcGIS.
- **Patrón que enseña:** separación modelo/vista, y Map-Components-primero con la Core API como escape.
- **Qué NO cubre:** agregar capas de datos (ver `arcgis-layers`), widgets (ver `arcgis-widgets-ui`).

## Inicio Rápido

```typescript
import "@arcgis/map-components/components/arcgis-map";
// <arcgis-map basemap="arcgis/topographic" center="-74.08,4.6" zoom="11"></arcgis-map>
const mapEl = document.querySelector("arcgis-map");
mapEl?.addEventListener("arcgisViewReadyChange", (e) => {
  console.log("ready", (e as CustomEvent).detail.view.zoom);
});
```

## Árbol de Decisión

1. **¿Inicias un proyecto nuevo o embebes un mapa rápido?**
   - Sí → **Map Components** (`<arcgis-map>` / `<arcgis-scene>`) — menos boilerplate, declarativo.
   - No → continúa.

2. **¿Necesitas control programático fino del ciclo de vida de la vista, o un contexto sin DOM?**
   - Sí → **Core API** (`new MapView(...)` / `new SceneView(...)`).
   - No → Map Components.

**Default:** Map Components, salvo que tengas una razón concreta para la Core API.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
```

### Imports Dinámicos (CDN)

```javascript
const Map = await $arcgis.import("@arcgis/core/Map.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Map vs Vista

El `Map` contiene `basemap`, `ground` y `layers`. La vista (`MapView`/`SceneView`) enlaza ese
modelo a un contenedor DOM y maneja el renderizado, la navegación y los eventos. Un mismo `Map`
puede alimentar varias vistas.

### Concepto 2: Identificadores de basemap

Pasa un string de estilo de basemap como `"arcgis/topographic"`, `"arcgis/imagery"` o
`"arcgis/navigation"`. Estos resuelven vía el servicio de estilos de basemap y requieren un API
key en `esriConfig.apiKey`.

### Concepto 3: Disponibilidad de la vista

Nunca toques propiedades de `view` antes de que la vista esté lista. Con la Core API usa
`view.when()`; con Map Components escucha el evento `arcgisViewReadyChange` — la `view` está en
`event.detail.view`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Leer la vista antes de que esté lista

```typescript
// ❌ Anti-patrón
const el = document.querySelector("arcgis-map");
console.log(el.view.zoom); // view es undefined aquí
```

```typescript
// ✅ Correcto
const el = document.querySelector("arcgis-map");
el?.addEventListener("arcgisViewReadyChange", (e) => {
  console.log((e as CustomEvent).detail.view.zoom);
});
```

**Impacto:** `Cannot read properties of undefined (reading 'zoom')` y un mapa en blanco.

### Pitfall 2: Olvidar el API key para los estilos de basemap

```typescript
// ❌ Anti-patrón
const map = new Map({ basemap: "arcgis/topographic" }); // 401, lienzo gris
```

```typescript
// ✅ Correcto
import esriConfig from "@arcgis/core/config.js";
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
const map = new Map({ basemap: "arcgis/topographic" });
```

**Impacto:** el basemap no carga (HTTP 401) y la vista muestra un lienzo gris.

### Pitfall 3: Usar opciones de SceneView en un MapView (o viceversa)

```typescript
// ❌ Anti-patrón
const view = new MapView({ container: "viewDiv", map, camera: { tilt: 65 } });
```

```typescript
// ✅ Correcto
const view = new SceneView({ container: "viewDiv", map, camera: { tilt: 65 } });
```

**Impacto:** `camera` es ignorado por `MapView`; el tilt/navegación 3D no hace nada.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas completas de Map/MapView/SceneView | `references/api-detail.md` |
| Ejemplos end-to-end (2D, 3D, webmap) | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-starter-app` — genera el proyecto primero
- `arcgis-layers` — agrega datos al mapa
- `arcgis-widgets-ui` — agrega componentes de UI

## Samples de Referencia

- [intro-mapview](https://developers.arcgis.com/javascript/latest/sample-code/intro-mapview/)
- [intro-sceneview](https://developers.arcgis.com/javascript/latest/sample-code/intro-sceneview/)
- [intro-map-components](https://developers.arcgis.com/javascript/latest/sample-code/intro-map-components/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
