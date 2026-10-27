---
name: arcgis-feature-effects
description: >
  Apply visual effects in the ArcGIS Maps SDK for JavaScript 5.1: layer-wide
  effects (bloom, blur, drop-shadow, brightness, grayscale) via layer.effect, and
  filtered emphasis via layer.featureEffect with a FeatureFilter and included/
  excluded effects. Use this skill whenever the user wants to highlight, dim, glow,
  or filter-emphasize features visually.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: visualization
tags:
  - effects
  - bloom
  - feature-effect
  - filter
  - highlight
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Feature Effects

> **When to use:** Activate this skill whenever the user wants to glow, blur, dim, or visually
> emphasize features — either the whole layer or a filtered subset.

## Overview

Effects are CSS-like filters applied to layers. `featureEffect` adds a filter so matched and
unmatched features get different effects.

- **Problem it solves:** drawing attention to features without changing the renderer.
- **Who it serves:** developers building focus/highlight and emphasis interactions.
- **Pattern it teaches:** `layer.effect` for the whole layer; `layer.featureEffect` for a subset.
- **What it does NOT cover:** symbology (see `arcgis-visualization`) or querying (see `arcgis-layers`).

## Quick Start

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });
layer.effect = "bloom(1.5, 0.5px, 0.1)";
```

## Decision Tree

1. **Effect on the whole layer?**
   - Yes → `layer.effect = "<filter string>"`.

2. **Emphasize only some features?**
   - Yes → `layer.featureEffect` with a `FeatureFilter` plus `includedEffect`/`excludedEffect`.

3. **Filter by geometry/time instead of attributes?**
   - Yes → set `FeatureFilter.geometry` / `timeExtent`.

**Default:** `effect` for global styling; `featureEffect` for focus interactions.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect.js";
```

### Dynamic Imports (CDN)

```javascript
const FeatureEffect = await $arcgis.import("@arcgis/core/layers/support/FeatureEffect.js");
```

### Map Components (recommended for new projects)

```typescript
// Set effect/featureEffect on a layer added to the component's map.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Effect strings

`effect` is a CSS-like string: `bloom(...)`, `blur(2px)`, `drop-shadow(...)`, `brightness(1.2)`,
`grayscale(50%)`, `opacity(40%)`, `hue-rotate(270deg)`. Chain several with spaces; they apply in
order. It can also be an array of `{ scale, value }` stops for scale-dependent effects. Measured with
5.1.27: `grayscale(100%)` turns a pure red square into `rgb(54,54,54)`; `blur(8px)` spreads it over
~10 px.

### Concept 2: featureEffect with a filter

`FeatureEffect` pairs a `FeatureFilter` (`where`, `geometry` + `spatialRelationship`, `timeExtent`)
with `includedEffect` (matches) and `excludedEffect` (the rest). Measured: with
`where: "POP > 1000000"`, the matching square went gray and the other faded to `rgb(255,153,153)`
(40 % opacity). **Without a filter, every feature counts as included**: both squares took the
`includedEffect`. Labels of excluded features are hidden by default
(`excludedLabelsVisible: false`); set it to `true` to keep them.

### Concept 3: Effects vs renderers vs filters

Effects are post-processing on top of the rendered symbols: they do not replace the renderer, and
they do not remove anything. To really drop features from the view (and from clicks), use
`layerView.filter` (client side) or `layer.definitionExpression` (server side). Effects are
**ignored in a SceneView** and on heatmap layers (per the 5.1 docs; measured: assigning one in 3D
does not throw and does nothing visible).

## Common Pitfalls (Top 3)

### Pitfall 1: Wrong units in effect strings

```typescript
// ❌ Anti-pattern
layer.effect = "blur(2)"; // missing unit
```

```typescript
// ✅ Correct
layer.effect = "blur(2px)";
```

**Impact:** measured: no exception; the console logs `Invalid Effect` and the layer draws with no
effect at all. Only the console tells you.

### Pitfall 2: Expecting featureEffect to hide features

```typescript
// ❌ Anti-pattern
layer.featureEffect = new FeatureEffect({ filter, excludedEffect: "opacity(0%)" }); // still clickable
```

```typescript
// ✅ Correct
const layerView = await view.whenLayerView(layer);
layerView.filter = new FeatureFilter({ where: "POP > 1000000" }); // gone from the view and from hitTest
```

**Impact:** measured: with `opacity(0%)` the feature is invisible, yet `view.hitTest` on it returns
it and `layerView.queryFeatureCount()` still counts 2. With `layerView.filter`, hitTest returns
nothing there and the layer view counts 1 (the layer itself still has 2).

### Pitfall 3: Overusing heavy effects on dense layers

```typescript
// ❌ Anti-pattern
denseLayer.effect = "bloom(3, 2px, 0)"; // expensive on 100k features
```

```typescript
// ✅ Correct
focusLayer.featureEffect = new FeatureEffect({ filter, includedEffect: "bloom(2, 1px, 0)" });
```

**Impact:** frame drops when heavy effects cover the whole dense layer (not measured here).

## When to Read references/

| If you need... | Read |
|---|---|
| effect / FeatureEffect signatures | `references/api-detail.md` |
| Highlight / dim / filter examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-layers` — the layer effects apply to
- `arcgis-visualization` — renderers (core styling)
- `arcgis-interaction` — drive featureEffect from selection

## Reference Samples

- [Layer effects](https://developers.arcgis.com/javascript/latest/sample-code/intro-effect-layer/)
- [Feature effect](https://developers.arcgis.com/javascript/latest/sample-code/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. The code ran. Measured with pixels: an effect without a unit is ignored
  with an `Invalid Effect` console warning (no throw); `opacity(0%)` features stay in hitTest. The extended pitfall
  "featureEffect without a filter emphasizes nothing" was false: everything gets `includedEffect`. Added the
  `layerView.filter` alternative (measured), scale-dependent effects, `excludedLabelsVisible`, and the
  SceneView/heatmap limits. Run in `tests/runtime/casos/arcgis-feature-effects.ts`.
- **0.1.0** (2026-05-31): Initial release.
