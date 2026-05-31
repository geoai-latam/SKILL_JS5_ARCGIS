---
name: arcgis-smart-mapping
description: >
  Auto-generate data-driven renderers with the ArcGIS Maps SDK for JavaScript 5.0
  Smart Mapping modules: color, size, and type renderer creators that compute
  statistics and pick sensible breaks and ramps. Covers createContinuousRenderer,
  createClassBreaksRenderer, and createRenderer. Use this skill whenever the user
  wants the SDK to choose symbology automatically from the data.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: visualization
tags:
  - smart-mapping
  - renderer
  - color-ramp
  - statistics
  - data-driven
requires:
  - arcgis-visualization
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Smart Mapping

> **When to use:** Activate this skill whenever the user wants the SDK to pick symbology
> automatically — color/size ramps and class breaks computed from the data.

## Overview

Smart Mapping creators inspect a layer's statistics and return a ready-to-use renderer.

- **Problem it solves:** choosing good breaks, ramps, and sizes without manual tuning.
- **Who it serves:** developers who want quick, statistically sound thematic maps.
- **Pattern it teaches:** call a creator with `{ layer, field, view }`, then assign its `renderer`.
- **What it does NOT cover:** hand-built renderers (see `arcgis-visualization`).

## Quick Start

```typescript
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field: "POP" });
layer.renderer = renderer;
```

## Decision Tree

1. **What should encode the value?**
   - Color → `smartMapping/renderers/color.js`.
   - Size → `smartMapping/renderers/size.js`.
   - Category/type → `smartMapping/renderers/type.js`.

2. **Continuous or classed?**
   - Continuous → `createContinuousRenderer`.
   - Classed → `createClassBreaksRenderer`.

**Default:** color `createContinuousRenderer` for numeric fields; `type.createRenderer` for categories.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";
```

### Dynamic Imports (CDN)

```javascript
const colorRendererCreator = await $arcgis.import("@arcgis/core/smartMapping/renderers/color.js");
```

### Map Components (recommended for new projects)

```typescript
// Pass the component's view (from arcgisViewReadyChange) into the creator.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: Creators need a view

Smart Mapping samples features in the current view to compute statistics, so most creators require
both `layer` and `view`. Call them after the view is ready.

### Concept 2: The result object

Creators return `{ renderer, statistics, ... }`. Assign `result.renderer` to `layer.renderer`;
keep `statistics` if you want to drive a legend or slider.

### Concept 3: Color/size/type modules

`color`, `size`, and `type` modules each expose `createContinuousRenderer` /
`createClassBreaksRenderer` / `createRenderer` variants tuned to that visual channel.

## Common Pitfalls (Top 3)

### Pitfall 1: Calling a creator before the view is ready

```typescript
// ❌ Anti-pattern
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
// view not ready yet → statistics are wrong/empty
```

```typescript
// ✅ Correct
await view.when();
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
```

**Impact:** the renderer uses empty statistics and looks flat or wrong.

### Pitfall 2: Forgetting to assign the renderer

```typescript
// ❌ Anti-pattern
await colorRendererCreator.createContinuousRenderer({ layer, view, field }); // result discarded
```

```typescript
// ✅ Correct
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
layer.renderer = renderer;
```

**Impact:** nothing changes because the computed renderer was never applied.

### Pitfall 3: Using a non-numeric field for a continuous renderer

```typescript
// ❌ Anti-pattern
colorRendererCreator.createContinuousRenderer({ layer, view, field: "NAME" });
```

```typescript
// ✅ Correct
typeRendererCreator.createRenderer({ layer, view, field: "NAME" }); // categories
```

**Impact:** continuous creators expect numbers; categories need the `type` module.

## When to Read references/

| If you need... | Read |
|---|---|
| Creator signatures | `references/api-detail.md` |
| Color / size / type examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-visualization` — the renderers Smart Mapping produces
- `arcgis-layers` — the layer to analyze
- `arcgis-core-maps` — the view used for statistics

## Reference Samples

- [Smart Mapping color](https://developers.arcgis.com/javascript/latest/sample-code/visualization-sm-continuous-color/)
- [Smart Mapping size](https://developers.arcgis.com/javascript/latest/sample-code/visualization-sm-continuous-size/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
