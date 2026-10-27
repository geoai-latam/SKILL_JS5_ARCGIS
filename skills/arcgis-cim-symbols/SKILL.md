---
name: arcgis-cim-symbols
description: >
  Build advanced multi-layered symbols with CIMSymbol in the ArcGIS Maps SDK for
  JavaScript 5.1. Covers the CIM JSON structure (CIMSymbolReference, point/line/
  polygon symbols, symbol layers, vector markers) and when CIM beats simple
  symbols. Use this skill whenever the user needs layered icons, complex line
  patterns, data-driven primitive overrides, or precise cartographic symbols.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: visualization
tags:
  - cim
  - symbols
  - cartography
  - vector-marker
  - multi-layer
requires:
  - arcgis-visualization
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# CIM Symbols

> **When to use:** Activate this skill whenever simple symbols are not enough — layered icons,
> complex line patterns, or precise cartographic symbology.

## Overview

A `CIMSymbol` wraps Esri's Cartographic Information Model JSON, letting you stack symbol layers.

- **Problem it solves:** symbology that simple marker/line/fill symbols cannot express.
- **Who it serves:** cartographers and developers needing layered or pattern symbols.
- **Pattern it teaches:** the CIMSymbolReference → symbol → symbolLayers hierarchy.
- **What it does NOT cover:** basic renderers (see `arcgis-visualization`) or auto symbology (`arcgis-smart-mapping`).

## Quick Start

```typescript
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";

// A red 16×16 square drawn at 20 pt (≈27 px). An empty symbolLayers draws nothing.
const symbol = new CIMSymbol({
  data: {
    type: "CIMSymbolReference",
    symbol: {
      type: "CIMPointSymbol",
      symbolLayers: [{
        type: "CIMVectorMarker",
        enable: true,
        size: 20,
        frame: { xmin: 0, ymin: 0, xmax: 16, ymax: 16 },
        markerGraphics: [{
          type: "CIMMarkerGraphic",
          geometry: { rings: [[[0, 0], [16, 0], [16, 16], [0, 16], [0, 0]]] },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [{ type: "CIMSolidFill", enable: true, color: [255, 0, 0, 255] }],
          },
        }],
      }],
    },
  },
});
```

## Decision Tree

1. **Can a SimpleMarker/Line/Fill express it?**
   - Yes → use the simple symbol (cheaper, simpler).
   - No → continue.

2. **Need stacked layers, vector markers, or dashes/patterns?**
   - Yes → `CIMSymbol` with multiple `symbolLayers`.

3. **Need the symbol to react to data primitives?**
   - Yes → use CIM primitive overrides.

**Default:** simple symbols first; reach for CIM only when layering is required.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";
```

### Dynamic Imports (CDN)

```javascript
const CIMSymbol = await $arcgis.import("@arcgis/core/symbols/CIMSymbol.js");
```

### Map Components (recommended for new projects)

```typescript
// Use the CIMSymbol in a renderer assigned to a layer on the component map.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: The CIM hierarchy

`data` is a `CIMSymbolReference` whose `symbol` is a `CIMPointSymbol` / `CIMLineSymbol` /
`CIMPolygonSymbol`. Each holds `symbolLayers`; the **first** layer in the array draws **on top**
(CIM order, as in ArcGIS Pro's layer list).

### Concept 2: Vector markers: `size` in points, geometry in `frame` units

A `CIMVectorMarker` maps its `frame` to `size`, and `size` is in **points**: measured with 5.1.27,
`size: 20` paints 27 px and `size: 40` paints 54 px (1 pt = 1.33 px). The geometry of each
`markerGraphic` is in frame units, and the frame does not clip: a ring that goes to 100 in a
0..16 frame paints a 120 px marker instead of 27 px.

### Concept 3: Primitive overrides

Give a symbol layer a `primitiveName`, then add `primitiveOverrides` to the
`CIMSymbolReference`: each one sets a `propertyName` of that primitive from an Arcade
`valueExpressionInfo`. `propertyName` is **Proper case** (`"Size"`, `"Color"`, `"TextString"`);
a lowercase `"size"` is ignored without a warning (measured: both features stay at the base size).

### Concept 4: Helpers instead of editing JSON by hand

`cimSymbolUtils` reads and changes a built symbol: `getCIMSymbolSize`/`scaleCIMSymbolTo`,
`getCIMSymbolColor`/`applyCIMSymbolColor`, `getCIMSymbolRotation`/`applyCIMSymbolRotation`.
`symbolUtils.renderPreviewHTML(symbol)` draws a preview, the quickest way to see if a CIM JSON
paints anything. New in 5.1 (beta): `CIMSymbolAnimationMoveAlongLine` (a marker moving along a
line) and `CIMMarkerPlacementAtMeasuredUnits`. Animations do not run in a SceneView or in the
legend.

## Common Pitfalls (Top 3)

### Pitfall 1: Wrong top-level type

```typescript
// ❌ Anti-pattern
new CIMSymbol({ data: { type: "CIMPointSymbol", symbolLayers: [] } as any });
```

```typescript
// ✅ Correct
new CIMSymbol({ data: { type: "CIMSymbolReference", symbol: { type: "CIMPointSymbol", symbolLayers: [] } } });
```

**Impact:** measured with 5.1.27: no error when it is built; the preview throws "Cannot read
properties of null" and nothing is drawn. TypeScript catches it only without the `as any`.

### Pitfall 2: Alpha on a 0–1 scale

```typescript
// ❌ Anti-pattern
color: [255, 0, 0, 1]; // alpha here is 0-255, not 0-1
```

```typescript
// ✅ Correct
color: [255, 0, 0, 255]; // fully opaque
```

**Impact:** measured: alpha `1` paints with an alpha of 1/255, an invisible symbol. CIM colors
are not `Color` objects, where alpha is 0–1.

### Pitfall 3: Lowercase `propertyName` in an override

```typescript
// ❌ Anti-pattern
primitiveOverrides: [{ type: "CIMPrimitiveOverride", primitiveName: "m", propertyName: "size",
  valueExpressionInfo: { type: "CIMExpressionInfo", title: "s", expression: "$feature.s", returnType: "Default" } }];
```

```typescript
// ✅ Correct
primitiveOverrides: [{ type: "CIMPrimitiveOverride", primitiveName: "m", propertyName: "Size",
  valueExpressionInfo: { type: "CIMExpressionInfo", title: "s", expression: "$feature.s", returnType: "Default" } }];
```

**Impact:** measured on a MapView: with `"Size"` the features at s=8 and s=40 paint 132 and 2970
px; with `"size"` both stay at the base size (210 and 196 px), no warning.

## When to Read references/

| If you need... | Read |
|---|---|
| CIM structure reference | `references/api-detail.md` |
| Full CIM symbol examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-visualization` — renderers that use the symbol
- `arcgis-arcade` — expressions for primitive overrides
- `arcgis-layers` — the layer being symbolized

## Reference Samples

- [CIMSymbol](https://developers.arcgis.com/javascript/latest/sample-code/sandbox/?sample=cim-symbols)
- [CIM primitive overrides](https://developers.arcgis.com/javascript/latest/visualization/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. The Quick Start drew nothing (empty `symbolLayers`); the "forget
  `enable: true` and it is not drawn" pitfall was false (measured: an omitted `enable` draws, only `false` hides);
  geometry outside the frame does not clip, it inflates the marker; `size` is in points; layer order is first on
  top; primitive overrides with a real example and the Proper-case `propertyName` trap; `cimSymbolUtils`; the 5.1
  animation and placement. Run in `tests/runtime/casos/arcgis-cim-symbols.ts`.
- **0.1.0** (2026-05-31): Initial release.
