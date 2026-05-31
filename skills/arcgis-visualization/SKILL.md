---
name: arcgis-visualization
description: >
  Symbolize layers with renderers in the ArcGIS Maps SDK for JavaScript 5.0:
  SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer, HeatmapRenderer, and
  DotDensityRenderer, plus visual variables (color, size, opacity, rotation). Use
  this skill whenever the user styles a layer, applies a renderer, builds a
  thematic map, or drives symbology from data attributes.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: visualization
tags:
  - renderer
  - unique-value
  - class-breaks
  - heatmap
  - visual-variables
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Visualization

> **When to use:** Activate this skill whenever the user styles a layer, applies a renderer, builds
> a thematic map, or drives color/size from attributes.

## Overview

A renderer decides how a layer's features are drawn. Pick the renderer by the story your data tells.

- **Problem it solves:** turning raw features into a readable thematic map.
- **Who it serves:** developers building category, graduated, density, or data-driven maps.
- **Pattern it teaches:** renderer-by-intent, plus visual variables for continuous data.
- **What it does NOT cover:** auto-generating renderers (see `arcgis-smart-mapping`) or CIM symbols (`arcgis-cim-symbols`).

## Quick Start

```typescript
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
layer.renderer = new UniqueValueRenderer({
  field: "TYPE",
  uniqueValueInfos: [{ value: "park", symbol: new SimpleFillSymbol({ color: "green" }) }],
});
```

## Decision Tree

1. **What story does the data tell?**
   - One symbol for all → `SimpleRenderer`.
   - Categories → `UniqueValueRenderer`.
   - Numeric ranges → `ClassBreaksRenderer`.
   - Point density → `HeatmapRenderer`.
   - Counts/proportions in areas → `DotDensityRenderer`.

2. **Continuous numeric attribute?**
   - Yes → add `visualVariables` (color/size) on a SimpleRenderer.

**Default:** `UniqueValueRenderer` for categories; visual variables for continuous values.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";
```

### Dynamic Imports (CDN)

```javascript
const HeatmapRenderer = await $arcgis.import("@arcgis/core/renderers/HeatmapRenderer.js");
```

### Map Components (recommended for new projects)

```typescript
// Build the renderer with the Core API, then assign it to a layer added to the component map.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: Renderer types

`SimpleRenderer` (uniform), `UniqueValueRenderer` (categories via `field` + `uniqueValueInfos`),
`ClassBreaksRenderer` (numeric `classBreakInfos`), `HeatmapRenderer` (density), `DotDensityRenderer`.

### Concept 2: Visual variables

`visualVariables` map a field to `color`, `size`, `opacity`, or `rotation` via `stops`. They layer
on top of a base symbol for smooth, continuous styling.

### Concept 3: Layer renderer vs feature symbol

Set `layer.renderer` for data-driven styling of the whole layer. Set a `Graphic.symbol` only for
individual ad-hoc graphics on a `GraphicsLayer`.

## Common Pitfalls (Top 3)

### Pitfall 1: Per-graphic symbols where a renderer belongs

```typescript
// ❌ Anti-pattern
features.forEach((f) => (f.symbol = makeSymbol(f.attributes.TYPE)));
```

```typescript
// ✅ Correct
layer.renderer = new UniqueValueRenderer({ field: "TYPE", uniqueValueInfos });
```

**Impact:** no legend, slow updates, and inconsistent styling.

### Pitfall 2: Class breaks that leave gaps

```typescript
// ❌ Anti-pattern
classBreakInfos: [{ minValue: 0, maxValue: 100 }, { minValue: 200, maxValue: 300 }];
```

```typescript
// ✅ Correct
classBreakInfos: [{ minValue: 0, maxValue: 100 }, { minValue: 100, maxValue: 300 }];
```

**Impact:** features in the gap (100–200) draw with the default symbol or vanish.

### Pitfall 3: Heatmap without enough points

```typescript
// ❌ Anti-pattern
polygonLayer.renderer = new HeatmapRenderer({ ... }); // heatmaps are for points
```

```typescript
// ✅ Correct
pointLayer.renderer = new HeatmapRenderer({ radius: 18, colorStops });
```

**Impact:** heatmaps only make sense for dense point layers, not polygons.

## When to Read references/

| If you need... | Read |
|---|---|
| Renderer + visualVariable signatures | `references/api-detail.md` |
| Renderer examples (each type) | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-layers` — the layer you symbolize
- `arcgis-smart-mapping` — auto-generate renderers from statistics
- `arcgis-cim-symbols` — advanced multi-layer symbols

## Reference Samples

- [UniqueValueRenderer](https://developers.arcgis.com/javascript/latest/visualization/)
- [Visual variables](https://developers.arcgis.com/javascript/latest/sample-code/visualization-vv-color/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
