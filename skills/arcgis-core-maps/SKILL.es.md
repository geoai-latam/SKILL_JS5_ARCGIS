---
name: arcgis-core-maps
description: >
  Inicializa MapView 2D y SceneView 3D con el ArcGIS Maps SDK for JavaScript 5.1.
  Cubre el objeto Map, la selección de basemap, la navegación de la vista (center,
  zoom, camera), los Map Components arcgis-map / arcgis-scene, y la decisión entre
  Map Components y la Core API. Usa esta skill cuando el usuario cree un mapa o
  escena, fije un basemap, o pregunte cómo mostrar datos geográficos en la web.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
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
const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady(); // the event carries no detail: read the view from the element
console.log("ready", mapEl.view.zoom);
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

Nunca uses la vista antes de que esté lista. Con la Core API, `await view.when()`. Con Map
Components, `await el.viewOnReady()` o escucha `arcgisViewReadyChange` y lee `el.view` (o
`event.target.view`): en 5.1.27 el `detail` del evento es `null`, así que `event.detail.view` lanza
error. `el.view` ya existe antes (un objeto con `ready === false`), así que "¿está definida?" no
sirve para saber si está lista. Una vista cuyo contenedor no tiene alto, o cuyo basemap no carga,
**nunca** queda lista (medido: `when()` sigue pendiente a los 10–30 s).

## Pitfalls Comunes (Top 3)

### Pitfall 1: Leer la vista del detail del evento

```typescript
// ❌ Anti-patrón
el.addEventListener("arcgisViewReadyChange", (e) => {
  console.log((e as CustomEvent).detail.view.zoom);
});
```

```typescript
// ✅ Correcto
el.addEventListener("arcgisViewReadyChange", () => {
  console.log(el.view.zoom);
});
// o: await el.viewOnReady(); console.log(el.view.zoom);
```

**Impacto:** medido con 5.1.27: `detail` es `null`, el handler lanza "Cannot read properties of null
(reading 'view')" y no corre nada de lo que sigue. El cast a `CustomEvent` es lo que se lo esconde a
TypeScript.

### Pitfall 2: Olvidar el API key para los estilos de basemap

```typescript
// ❌ Anti-patrón
const map = new Map({ basemap: "arcgis/topographic" }); // sin esriConfig.apiKey
```

```typescript
// ✅ Correcto
import esriConfig from "@arcgis/core/config.js";
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
const map = new Map({ basemap: "arcgis/topographic" });
```

**Impacto:** medido: la petición del estilo responde 401, el basemap se queda en `loading` y
`view.when()` no se resuelve: todo lo que espera a la vista espera para siempre. Para una demo sin
key, `basemap: "osm"` sí carga.

### Pitfall 3: Usar opciones de SceneView en un MapView

```typescript
// ❌ Anti-patrón
const view = new MapView({ container: "viewDiv", map, camera: { tilt: 65 } });
```

```typescript
// ✅ Correcto
const view = new SceneView({ container: "viewDiv", map, camera: { tilt: 65 } });
```

**Impacto:** `MapView` no tiene `camera` en sus tipos, así que el código tipado no compila; el código
sin tipos corre y el tilt se ignora (medido: la vista queda lista, plana, en el zoom indicado).

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

- **0.2.0** (2026-10-27): SDK 5.1. El Inicio Rápido lanzaba error: `arcgisViewReadyChange` trae `detail` en
  `null`, así que `event.detail.view` falla (medido); ahora `viewOnReady()` / `el.view`. Sin API key → 401 y una
  vista que nunca queda lista (no solo un lienzo gris); un contenedor de alto 0 tampoco queda listo; un `center`
  al revés cae en la Antártida, no frente a África. En `tests/runtime/casos/arcgis-core-maps.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
