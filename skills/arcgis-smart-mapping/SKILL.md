---
name: arcgis-smart-mapping
description: >
  Auto-generate data-driven renderers with the ArcGIS Maps SDK for JavaScript 5.1
  Smart Mapping modules: color, size, and type renderer creators. Covers
  createContinuousRenderer, createClassBreaksRenderer (equal-interval by default,
  which crowds skewed data into one class), createRenderer (top 10 categories plus
  "Other" by default), where the statistics come from, and the silent results on
  the wrong field type. Use this skill whenever the user wants the SDK to choose
  symbology automatically from the data.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Smart Mapping

> **When to use:** Activate this skill whenever the user wants the SDK to pick symbology
> automatically — color/size ramps and class breaks computed from the data.

## Overview

Smart Mapping creators compute a field's statistics and return a ready-to-use renderer.

- **Problem it solves:** choosing breaks, ramps, and sizes without manual tuning.
- **Who it serves:** developers who want quick, statistically sound thematic maps.
- **Pattern it teaches:** call a creator with `{ layer, field, view }`, then assign its `renderer`.
- **What it does NOT cover:** hand-built renderers (see `arcgis-visualization`).

## Quick Start

```typescript
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";

const { renderer } = await colorRendererCreator.createClassBreaksRenderer({
  layer, view, field: "POP",
  classificationMethod: "quantile", // the default, equal-interval, crowds skewed data into one class
  numClasses: 5,
});
layer.renderer = renderer; // the creator never assigns it
```

## Decision Tree

1. **What should encode the value?**
   - Color → `smartMapping/renderers/color.js`.
   - Size → `smartMapping/renderers/size.js`.
   - Category/type → `smartMapping/renderers/type.js` (string fields).

2. **Continuous or classed?**
   - Continuous → `createContinuousRenderer`.
   - Classed → `createClassBreaksRenderer` with an explicit `classificationMethod`.

3. **Many categories?**
   - Yes → decide `numTypes` (default 10; `-1` for all).

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
// Pass the component's view (await el.viewOnReady(); el.view) into the creator.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Where the statistics come from

Measured with 5.1.27: the statistics covered **the whole layer, not the view's extent**. A service layer gave
`n=3557` with the view over New York, over the whole country and with no view at all; a client-side layer built
from `source` also gave all 51 features with the view over New York. The layer's `definitionExpression` is respected
(`st = 'NY'` gave `n=187`); a `filter` with `where` is ignored (only geometry `intersects` filters count).

### Concept 2: What the view is for

`view` lets the creator read the background to pick colors (`basemapTheme` came back `"light"` over OSM). It is
optional: without it the creators still resolved. Measured: a creator called before `view.when()` resolved with the
same statistics.

### Concept 3: The result object

Creators return `{ renderer, statistics, basemapTheme, … }` (color continuous also `visualVariable`). They never
touch the layer: measured, `layer.renderer` stayed `simple` until assigned.

## Common Pitfalls (Top 3)

### Pitfall 1: Default class breaks on skewed data

```typescript
// ❌ Anti-pattern
const { renderer } = await colorRendererCreator.createClassBreaksRenderer({ layer, view, field: "POP" });
```

```typescript
// ✅ Correct
const { renderer } = await colorRendererCreator.createClassBreaksRenderer({
  layer, view, field: "POP", classificationMethod: "quantile", // or "natural-breaks"
});
```

**Impact:** measured on US city populations: the default produced 5 equal intervals of ~1.6 million, and **3553 of
3557 cities fell in the first class**: one color for almost the whole map. With `"quantile"` the first class ended
at 12938 and held 712.

### Pitfall 2: A category map that only shows ten categories

```typescript
// ❌ Anti-pattern
const { renderer } = await typeRendererCreator.createRenderer({ layer, view, field: "STATE" });
```

```typescript
// ✅ Correct
const { renderer } = await typeRendererCreator.createRenderer({ layer, view, field: "STATE", numTypes: -1 });
```

**Impact:** measured on a field with 51 values: 10 `uniqueValueInfos`, and everything else drawn with the default
symbol labeled `Otro` ("Other"). With `numTypes: -1`, all 51.

### Pitfall 3: A continuous renderer on a text field

```typescript
// ❌ Anti-pattern
colorRendererCreator.createContinuousRenderer({ layer, view, field: "NAME" });
```

```typescript
// ✅ Correct
typeRendererCreator.createRenderer({ layer, view, field: "NAME" }); // categories
```

**Impact:** measured: **no error**. It returned a `class-breaks` renderer with `min`/`max` `undefined` and made-up
stops `0, 25, 50, 75, 100`. Check the field type before choosing the module.

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

- [Smart Mapping color](https://developers.arcgis.com/javascript/latest/visualization/)
- [Smart Mapping size](https://developers.arcgis.com/javascript/latest/sample-code/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Measured in `tests/runtime/casos/arcgis-smart-mapping.ts`. Two of the three old
  top pitfalls were false: calling before `view.when()` works, and a text field does not fail (it silently returns
  made-up stops, which is now the third pitfall). The old Concept 1 ("samples features in the view") was false:
  statistics cover the whole layer. New top pitfalls, measured: equal-interval breaks put 3553 of 3557 cities in one
  class, and the type creator keeps only 10 categories. Added that `filter.where` is ignored; replaced the
  deprecated `view.watch`.
- **0.1.0** (2026-05-31): Initial release.
