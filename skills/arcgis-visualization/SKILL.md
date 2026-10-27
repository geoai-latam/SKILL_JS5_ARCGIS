---
name: arcgis-visualization
description: >
  Symbolize layers with renderers in the ArcGIS Maps SDK for JavaScript 5.1:
  SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer, HeatmapRenderer, and
  DotDensityRenderer, plus visual variables (color, size, opacity, rotation).
  Covers what silently draws nothing: values with no class and no defaultSymbol,
  unique values that differ in case, a heatmap on polygons, and graphic.symbol
  on FeatureLayer features (the renderer wins). Use this skill whenever the user
  styles a layer, applies a renderer, builds a thematic map, or drives
  symbology from data attributes.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
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
- **Pattern it teaches:** renderer-by-intent, a `defaultSymbol` for everything the classes miss, and visual variables
  for continuous data.
- **What it does NOT cover:** auto-generating renderers (see `arcgis-smart-mapping`) or CIM symbols (`arcgis-cim-symbols`).

## Quick Start

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";

const states = new FeatureLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2",
  renderer: new UniqueValueRenderer({
    field: "sub_region",
    uniqueValueInfos: [
      { value: "Pacific", symbol: new SimpleFillSymbol({ color: "#2b8cbe" }) },
      { value: "Mtn", symbol: new SimpleFillSymbol({ color: "#a6bddb" }) },
    ],
    defaultSymbol: new SimpleFillSymbol({ color: "#d9d9d9" }), // without it, the other states are not drawn
  }),
});
```

## Decision Tree

1. **What story does the data tell?**
   - One symbol for all → `SimpleRenderer`.
   - Categories → `UniqueValueRenderer`.
   - Numeric ranges → `ClassBreaksRenderer`.
   - Point density → `HeatmapRenderer` (points only).
   - Counts or proportions in areas → `DotDensityRenderer`.

2. **Continuous numeric attribute?**
   - Yes → add `visualVariables` (color, size) on a `SimpleRenderer`.

3. **Can any value fall outside the classes, or be null?**
   - Yes → set `defaultSymbol`, or those features are not drawn.

**Default:** `UniqueValueRenderer` for categories, visual variables for continuous values, always with `defaultSymbol`.

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
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Renderer types

`SimpleRenderer` (uniform), `UniqueValueRenderer` (categories via `field` + `uniqueValueInfos`),
`ClassBreaksRenderer` (numeric `classBreakInfos`), `HeatmapRenderer` (point density), `DotDensityRenderer`.

### Concept 2: What has no class is not drawn

Measured on 5.1.27 by reading back the drawn pixels: a value in a gap between breaks, above the last break, or null
was not drawn at all when the renderer had no `defaultSymbol`; with one, it was drawn in that symbol. On a shared
boundary (`maxValue` 100 and `minValue` 100), the value 100 went to the lower class.

### Concept 3: Visual variables

`visualVariables` map a field to `color`, `size`, `opacity`, or `rotation` via `stops`, over a base symbol. Stop order
does not matter: measured, reversed stops gave the same colors as sorted ones.

## Common Pitfalls (Top 3)

### Pitfall 1: Setting graphic.symbol on FeatureLayer features

```typescript
// ❌ Anti-pattern: ignored on a FeatureLayer
const { features } = await layer.queryFeatures();
features.forEach((f) => (f.symbol = makeSymbol(f.attributes.TYPE)));
```

```typescript
// ✅ Correct
layer.renderer = new UniqueValueRenderer({ field: "TYPE", uniqueValueInfos, defaultSymbol });
```

**Impact:** measured: a client-side FeatureLayer whose source graphic had a red `symbol` drew it in the renderer's
blue. `graphic.symbol` only applies in a `GraphicsLayer` or `view.graphics`.

### Pitfall 2: Values that no class covers, with no defaultSymbol

```typescript
// ❌ Anti-pattern
new ClassBreaksRenderer({ field: "v", classBreakInfos: [{ minValue: 0, maxValue: 100, symbol }, { minValue: 200, maxValue: 300, symbol }] });
```

```typescript
// ✅ Correct
new ClassBreaksRenderer({
  field: "v",
  classBreakInfos: [{ minValue: 0, maxValue: 100, symbol }, { minValue: 100, maxValue: 300, symbol }],
  defaultSymbol, // values above 300, below 0, or null
});
```

**Impact:** measured: a feature with 150 (in the gap), 500 (out of range), or null was not drawn, with no warning.

### Pitfall 3: A heatmap on a polygon layer

```typescript
// ❌ Anti-pattern
statesLayer.renderer = new HeatmapRenderer({ radius: 18 });
```

```typescript
// ✅ Correct
pointLayer.renderer = new HeatmapRenderer({ radius: 18, colorStops });
```

**Impact:** measured on the USA states service: the layer view was created, the renderer stayed `heatmap`, no error
was raised; on a client-side polygon, the
heatmap drew nothing.

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

- [Visualization guide](https://developers.arcgis.com/javascript/latest/visualization/)
- [Visual variables](https://developers.arcgis.com/javascript/latest/sample-code/visualization-vv-color/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Runtime checks in `tests/runtime/casos/arcgis-visualization.ts`, which read back
  the drawn pixels. Two extended pitfalls were false and are gone: the renderer `field` is matched case-insensitively
  (`"type"` drew like `"TYPE"`), and visual-variable stops are sorted for you. Replaced with what was measured: unique
  values are case-sensitive (`"Park"` fell to the default), values with no class or null are not drawn without
  `defaultSymbol`, a shared boundary goes to the lower class, `graphic.symbol` is ignored in a FeatureLayer, and a
  heatmap on polygons draws nothing without an error. Removed the web map pitfall (its block failed TS2339) and the
  unmeasured heatmap scale one; the snippet's placeholder URL is now a public service.
- **0.1.0** (2026-05-31): Initial release.
