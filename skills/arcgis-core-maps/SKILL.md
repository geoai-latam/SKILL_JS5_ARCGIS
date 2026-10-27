---
name: arcgis-core-maps
description: >
  Initialize 2D MapView and 3D SceneView with the ArcGIS Maps SDK for JavaScript
  5.0. Covers the Map object, basemap selection, view navigation (center, zoom,
  camera), the arcgis-map / arcgis-scene Map Components, and the decision between
  Map Components and the Core API. Use this skill whenever the user creates a map
  or scene, sets a basemap, or asks how to display geographic data on the web.
lang: en
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

# Core Maps

> **When to use:** Activate this skill whenever the user creates a 2D map or 3D scene, picks a
> basemap, controls the view (center/zoom/camera), or asks whether to use Map Components or the
> Core API.

## Overview

A map in the SDK has two parts: a **`Map`** (the data model — basemap, layers, ground) and a
**view** that renders it — `MapView` for 2D or `SceneView` for 3D.

- **Problem it solves:** getting a correct, performant map or scene on screen with the right API choice.
- **Who it serves:** any web developer starting an ArcGIS app.
- **Pattern it teaches:** model/view separation, and Map-Components-first with Core API as the escape hatch.
- **What it does NOT cover:** adding data layers (see `arcgis-layers`), widgets (see `arcgis-widgets-ui`).

## Quick Start

```typescript
import "@arcgis/map-components/components/arcgis-map";
// <arcgis-map basemap="arcgis/topographic" center="-74.08,4.6" zoom="11"></arcgis-map>
const mapEl = document.querySelector("arcgis-map");
mapEl?.addEventListener("arcgisViewReadyChange", (e) => {
  console.log("ready", (e as CustomEvent).detail.view.zoom);
});
```

## Decision Tree

1. **Starting a new project or embedding a map quickly?**
   - Yes → **Map Components** (`<arcgis-map>` / `<arcgis-scene>`) — less boilerplate, declarative.
   - No → continue.

2. **Do you need fine-grained programmatic control of the view lifecycle, or a non-DOM context?**
   - Yes → **Core API** (`new MapView(...)` / `new SceneView(...)`).
   - No → Map Components.

**Default:** Map Components, unless you have a concrete reason for the Core API.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
```

### Dynamic Imports (CDN)

```javascript
const Map = await $arcgis.import("@arcgis/core/Map.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Map vs View

The `Map` holds `basemap`, `ground`, and `layers`. The view (`MapView`/`SceneView`) binds that
model to a DOM container and handles rendering, navigation, and events. One `Map` can feed
multiple views.

### Concept 2: Basemap identifiers

Pass a basemap style string such as `"arcgis/topographic"`, `"arcgis/imagery"`, or
`"arcgis/navigation"`. These resolve through the basemap styles service and require an API key
set on `esriConfig.apiKey`.

### Concept 3: View readiness

Never touch `view` properties before the view is ready. With the Core API use `view.when()`;
with Map Components listen for the `arcgisViewReadyChange` event — the `view` is on
`event.detail.view`.

## Common Pitfalls (Top 3)

### Pitfall 1: Reading the view before it is ready

```typescript
// ❌ Anti-pattern
const el = document.querySelector("arcgis-map");
console.log(el.view.zoom); // view is undefined here
```

```typescript
// ✅ Correct
const el = document.querySelector("arcgis-map");
el?.addEventListener("arcgisViewReadyChange", (e) => {
  console.log((e as CustomEvent).detail.view.zoom);
});
```

**Impact:** `Cannot read properties of undefined (reading 'zoom')` and a blank map.

### Pitfall 2: Forgetting the API key for basemap styles

```typescript
// ❌ Anti-pattern
const map = new Map({ basemap: "arcgis/topographic" }); // 401, grey canvas
```

```typescript
// ✅ Correct
import esriConfig from "@arcgis/core/config.js";
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
const map = new Map({ basemap: "arcgis/topographic" });
```

**Impact:** the basemap fails to load (HTTP 401) and the view shows a grey canvas.

### Pitfall 3: Using SceneView options on a MapView (or vice versa)

```typescript
// ❌ Anti-pattern
const view = new MapView({ container: "viewDiv", map, camera: { tilt: 65 } });
```

```typescript
// ✅ Correct
const view = new SceneView({ container: "viewDiv", map, camera: { tilt: 65 } });
```

**Impact:** `camera` is ignored by `MapView`; tilt/3D navigation silently does nothing.

## When to Read references/

| If you need... | Read |
|---|---|
| Full Map/MapView/SceneView signatures | `references/api-detail.md` |
| End-to-end examples (2D, 3D, webmap) | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-starter-app` — scaffold the project first
- `arcgis-layers` — add data to the map
- `arcgis-widgets-ui` — add UI components

## Reference Samples

- [intro-mapview](https://developers.arcgis.com/javascript/latest/sample-code/intro-mapview/)
- [intro-sceneview](https://developers.arcgis.com/javascript/latest/sample-code/intro-sceneview/)
- [intro-map-components](https://developers.arcgis.com/javascript/latest/sample-code/intro-map-components/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
