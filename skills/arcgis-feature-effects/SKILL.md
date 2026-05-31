---
name: arcgis-feature-effects
description: >
  Apply visual effects in the ArcGIS Maps SDK for JavaScript 5.0: layer-wide
  effects (bloom, blur, drop-shadow, brightness, grayscale) via layer.effect, and
  filtered emphasis via layer.featureEffect with a FeatureFilter and included/
  excluded effects. Use this skill whenever the user wants to highlight, dim, glow,
  or filter-emphasize features visually.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
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
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: Effect strings

`effect` is a CSS-like string: `bloom(...)`, `blur(2px)`, `drop-shadow(...)`, `brightness(1.2)`,
`grayscale(50%)`, `opacity(40%)`. Chain multiple with spaces.

### Concept 2: featureEffect with a filter

`FeatureEffect` pairs a `FeatureFilter` (a `where`, geometry, or time filter) with `includedEffect`
(applied to matches) and `excludedEffect` (applied to the rest).

### Concept 3: Effects vs renderers

Effects are post-processing on top of the rendered symbols. They do not replace the renderer —
use them for emphasis, not core styling.

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

**Impact:** the effect is ignored or throws because the value needs a unit.

### Pitfall 2: Expecting featureEffect to hide features

```typescript
// ❌ Anti-pattern
layer.featureEffect = new FeatureEffect({ filter, excludedEffect: "opacity(0%)" }); // still drawn/clickable
```

```typescript
// ✅ Correct
layer.featureEffect = new FeatureEffect({ filter }); // visual de-emphasis
layer.definitionExpression = "POP > 100000";          // to truly remove
```

**Impact:** `opacity(0%)` only hides visually; features remain for hitTest/queries.

### Pitfall 3: Overusing heavy effects on dense layers

```typescript
// ❌ Anti-pattern
denseLayer.effect = "bloom(3, 2px, 0)"; // expensive on 100k features
```

```typescript
// ✅ Correct
focusLayer.featureEffect = new FeatureEffect({ filter, includedEffect: "bloom(2, 1px, 0)" });
```

**Impact:** frame drops when heavy effects cover the whole dense layer.

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

- **0.1.0** (2026-05-31): Initial release.
