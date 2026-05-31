---
name: arcgis-cim-symbols
description: >
  Build advanced multi-layered symbols with CIMSymbol in the ArcGIS Maps SDK for
  JavaScript 5.0. Covers the CIM JSON structure (CIMSymbolReference, point/line/
  polygon symbols, symbol layers, vector markers) and when CIM beats simple
  symbols. Use this skill whenever the user needs layered icons, complex line
  patterns, data-driven primitive overrides, or precise cartographic symbols.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
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
const symbol = new CIMSymbol({
  data: { type: "CIMSymbolReference", symbol: { type: "CIMPointSymbol", symbolLayers: [] } },
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
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: The CIM hierarchy

`data` is a `CIMSymbolReference` whose `symbol` is a `CIMPointSymbol` / `CIMLineSymbol` /
`CIMPolygonSymbol`. Each holds `symbolLayers` drawn bottom-to-top.

### Concept 2: Symbol layers

Layers include `CIMVectorMarker` (custom geometry), `CIMSolidStroke`/`CIMSolidFill`, and dash
effects. Stacking them creates composite icons and patterned lines.

### Concept 3: Primitive overrides

CIM supports `primitiveOverrides` that bind a symbol property to an Arcade expression or field,
enabling data-driven symbol details beyond visual variables.

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

**Impact:** the symbol fails to parse because `data` must be a `CIMSymbolReference`.

### Pitfall 2: Forgetting `enable: true` on a layer

```typescript
// ❌ Anti-pattern
symbolLayers: [{ type: "CIMSolidFill", color: [255, 0, 0, 255] }];
```

```typescript
// ✅ Correct
symbolLayers: [{ type: "CIMSolidFill", enable: true, color: [255, 0, 0, 255] }];
```

**Impact:** a disabled layer is silently not drawn.

### Pitfall 3: RGBA colors out of range

```typescript
// ❌ Anti-pattern
color: [255, 0, 0, 1]; // alpha here is 0-255, not 0-1
```

```typescript
// ✅ Correct
color: [255, 0, 0, 255]; // fully opaque
```

**Impact:** near-transparent symbols because alpha is interpreted on a 0–255 scale.

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

- **0.1.0** (2026-05-31): Initial release.
