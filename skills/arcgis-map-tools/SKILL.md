---
name: arcgis-map-tools
description: >
  Add interactive map tools with the ArcGIS Maps SDK for JavaScript 5.1 Map
  Components: arcgis-sketch for drawing, arcgis-measurement and its 2D/3D variants
  for measuring (or measurement analyses in code), and arcgis-snapping-controls,
  which must share the sketch's snappingOptions to have any effect. Use this skill
  whenever the user adds drawing, measuring, or snapping tools to a map or scene.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: specialized
tags:
  - sketch
  - measurement
  - snapping
  - tools
  - components
requires:
  - arcgis-interaction
packages:
  - "@arcgis/map-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Map Tools

> **When to use:** Activate this skill whenever the user adds drawing, measurement, or snapping
> tools to a map or scene.

## Overview

These components give users ready-made sketching, measuring, and snapping.

- **Problem it solves:** standard drawing and measuring UX without writing the interaction yourself.
- **Who it serves:** developers adding interactive tools to a map app.
- **Pattern it teaches:** nest the component in the map, wire the pieces that do not wire themselves, read results.
- **What it does NOT cover:** programmatic drawing and hit tests (see `arcgis-interaction`) or persistence
  (`arcgis-editing`).

## Quick Start

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="12">
  <arcgis-sketch slot="top-right"></arcgis-sketch>
  <arcgis-snapping-controls slot="bottom-right"></arcgis-snapping-controls>
  <arcgis-distance-measurement-2d slot="top-left"></arcgis-distance-measurement-2d>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-sketch";
import "@arcgis/map-components/components/arcgis-snapping-controls";
import "@arcgis/map-components/components/arcgis-distance-measurement-2d";

const sketch = document.querySelector("arcgis-sketch")!;
const snapping = document.querySelector("arcgis-snapping-controls")!;
await sketch.componentOnReady();
snapping.snappingOptions = sketch.snappingOptions; // they do NOT share it on their own
```

## Decision Tree

1. **Draw/edit geometry interactively?**
   - Yes → `arcgis-sketch` (it creates a "Sketch Layer" `GraphicsLayer` and adds it to the map).

2. **Measure?**
   - 2D map → `arcgis-distance-measurement-2d` / `arcgis-area-measurement-2d`, or `arcgis-measurement` with
     `activeTool` `"distance"` | `"area"`.
   - 3D scene → `arcgis-direct-line-measurement-3d` / `arcgis-area-measurement-3d`, or `arcgis-measurement` with
     `"direct-line"` | `"area"`.
   - A value in code, no UI → `DistanceMeasurementAnalysis` / `AreaMeasurementAnalysis` in `view.analyses`.

3. **Snap while drawing?**
   - Yes → share one `SnappingOptions` between sketch and `arcgis-snapping-controls`, and add `featureSources`.

**Default:** `arcgis-sketch` for drawing, the 2D/3D measurement component that matches the view.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import DistanceMeasurementAnalysis from "@arcgis/core/analysis/DistanceMeasurementAnalysis.js";
import FeatureSnappingLayerSource from "@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource.js";
```

### Dynamic Imports (CDN)

```javascript
const DistanceMeasurementAnalysis = await $arcgis.import("@arcgis/core/analysis/DistanceMeasurementAnalysis.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-measurement";
import "@arcgis/map-components/components/arcgis-snapping-controls";
```

## Key Concepts

### Concept 1: Sketch component

`arcgis-sketch` gives a toolbar to draw and edit. Measured with 5.1.27: it adds its own `GraphicsLayer` titled
"Sketch Layer" to the map (`listMode: "show"`, so it appears in a layer list). Shapes live only in that layer; read
them from `arcgisCreate` / `arcgisUpdate` and persist them yourself.

### Concept 2: Measurement components and analyses

The 2D components (`arcgis-distance-measurement-2d`, `arcgis-area-measurement-2d`) start in `state: "ready"` with
`unit: "metric"` (a system: it switches m/km by size). `arcgis-measurement` starts with `activeTool: null` and
`state: "disabled"` until you pick a tool; `clear()` returns it there. In code, a measurement is an **analysis**:
measured, a `DistanceMeasurementAnalysis` with a 0.05° line at 4.6°N gave **5.5 km (geodesic)**, and a
0.01° × 0.01° square gave 1 227 040 m² with a 4 km perimeter, read from `(await view.whenAnalysisView(a)).result`.

### Concept 3: Snapping is configuration, shared by reference

Each component has its **own** `snappingOptions`. Measured: with `arcgis-sketch` and `arcgis-snapping-controls` in
the same map, the two objects were different, and turning snapping on in the controls left the sketch's
`enabled: false`. Defaults on the sketch: `enabled: false`, `selfEnabled: true`, `featureEnabled: true`,
`distance: 5` px, **0** `featureSources`, `gridEnabled: false`.

## Common Pitfalls (Top 3)

### Pitfall 1: Expecting snapping controls to drive the sketch

```html
<!-- ❌ Anti-pattern: two separate SnappingOptions -->
<arcgis-sketch></arcgis-sketch>
<arcgis-snapping-controls></arcgis-snapping-controls>
```

```typescript
// ✅ Correct
snapping.snappingOptions = sketch.snappingOptions;
sketch.snappingOptions.featureSources.add(new FeatureSnappingLayerSource({ layer: parcels, enabled: true }));
```

**Impact:** measured: the user toggles snapping on and the sketch still reports `enabled: false`. Nothing snaps,
and no error.

### Pitfall 2: A 3D measurement component on a 2D map

```html
<!-- ❌ Anti-pattern -->
<arcgis-map><arcgis-direct-line-measurement-3d></arcgis-direct-line-measurement-3d></arcgis-map>
```

```html
<!-- ✅ Correct -->
<arcgis-map><arcgis-distance-measurement-2d></arcgis-distance-measurement-2d></arcgis-map>
```

**Impact:** measured: `start()` resolves, `state` becomes `"unsupported"` and the only sign is a console warning.
Likewise `arcgis-measurement` accepted `activeTool = "direct-line"` on a 2D map and showed no tool
(`activeWidget: null`).

### Pitfall 3: Expecting sketch drawings to persist

```typescript
// ❌ Anti-pattern
// Drawing with arcgis-sketch and assuming it saves to the service.
```

```typescript
// ✅ Correct
sketch.addEventListener("arcgisCreate", (e) => {
  if (e.detail.state === "complete") void parcels.applyEdits({ addFeatures: [e.detail.graphic!] });
});
```

**Impact:** drawings are client-side graphics in the "Sketch Layer"; they vanish on reload.

## When to Read references/

| If you need... | Read |
|---|---|
| Tool component attributes/events | `references/api-detail.md` |
| Sketch / measure / snap examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-interaction` — programmatic SketchViewModel
- `arcgis-editing` — persist drawn geometry
- `arcgis-core-maps` — the map/scene to bind to

## Reference Samples

- [Sketch component](https://developers.arcgis.com/javascript/latest/sample-code/sketch-geometries/)
- [Measurement](https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Measured in `tests/runtime/casos/arcgis-map-tools.ts`. The skill said snapping
  controls "wire to the active sketch": false, each component has its own `snappingOptions` and they must be shared
  by reference (now the top pitfall). The 3D-on-2D pitfall is now precise (`state: "unsupported"`, console warning
  only). Added measurement analyses in code (5.5 km geodesic for a 0.05° line at 4.6°N), the component defaults,
  and `FeatureSnappingLayerSource`. Replaced pitfalls that were only comments.
- **0.1.0** (2026-05-31): Initial release.
