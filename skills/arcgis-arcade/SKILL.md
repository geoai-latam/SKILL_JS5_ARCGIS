---
name: arcgis-arcade
description: >
  Write and run Arcade expressions with the ArcGIS Maps SDK for JavaScript 5.0:
  createArcadeExecutor with the right profile for popups, labels, and renderers,
  plus expression syntax and performance tips. Use this skill whenever the user
  writes an Arcade expression for a popup, label, renderer, or computes a value
  from feature attributes/geometry.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: specialized
tags:
  - arcade
  - expressions
  - labels
  - popups
  - renderer
requires:
  - arcgis-visualization
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Arcade

> **When to use:** Activate this skill whenever the user writes an Arcade expression for popups,
> labels, or renderers, or computes values from attributes/geometry.

## Overview

Arcade is Esri's expression language; the SDK compiles a script into an executor scoped to a profile.

- **Problem it solves:** dynamic, data-driven text and values without round-trips.
- **Who it serves:** developers customizing popups, labels, and symbology.
- **Pattern it teaches:** pick the profile for the context; compile once with `createArcadeExecutor`.
- **What it does NOT cover:** renderers themselves (see `arcgis-visualization`) or popups (`arcgis-popup-templates`).

## Quick Start

```typescript
import { createArcadeExecutor } from "@arcgis/core/arcade.js";
const executor = await createArcadeExecutor("$feature.POP * 2", {
  variables: [{ name: "$feature", type: "feature" }],
});
```

## Decision Tree

1. **Where does the expression run?**
   - Popup → use a popup profile (often via PopupTemplate `expressionInfos`).
   - Label → label profile.
   - Renderer / visual variable → renderer profile (`valueExpression`).

2. **Compiling manually?**
   - Yes → `createArcadeExecutor(script, profile)` with the matching variables.

**Default:** declare the expression on the consuming object (popup/label/renderer) and let the SDK compile it.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import { createArcadeExecutor } from "@arcgis/core/arcade.js";
```

### Dynamic Imports (CDN)

```javascript
const arcade = await $arcgis.import("@arcgis/core/arcade.js");
```

### Map Components (recommended for new projects)

```typescript
// Expressions live in popupTemplate/labelingInfo/renderer on layers in the component map.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: Profiles

A profile declares the variables available to the script (e.g. `$feature`, `$layer`, `$map`).
Use the profile that matches the context so the right globals exist.

### Concept 2: createArcadeExecutor

`createArcadeExecutor(script, profile, options?)` returns an `ArcadeExecutor` you call with the
runtime context (the feature). Compile once, execute many times.

### Concept 3: Where expressions live

Most of the time you don't call the executor yourself — you set `expressionInfos` on a popup,
`valueExpression` on a renderer, or an Arcade label expression, and the SDK runs it.

## Common Pitfalls (Top 3)

### Pitfall 1: Wrong profile for the context

```typescript
// ❌ Anti-pattern
createArcadeExecutor(script, { variables: [] }); // $feature not declared
```

```typescript
// ✅ Correct
createArcadeExecutor(script, { variables: [{ name: "$feature", type: "feature" }] });
```

**Impact:** the script errors because `$feature` is undefined.

### Pitfall 2: Compiling on every render

```typescript
// ❌ Anti-pattern
features.forEach(async (f) => { const e = await createArcadeExecutor(script, profile); });
```

```typescript
// ✅ Correct
const executor = await createArcadeExecutor(script, profile); // once, reuse per feature
```

**Impact:** recompiling per feature is slow.

### Pitfall 3: Heavy FeatureSet functions in labels

```typescript
// ❌ Anti-pattern
// Using FeatureSetByName / aggregations in a label expression over many features
```

```typescript
// ✅ Correct
// Keep label/renderer expressions lightweight; precompute heavy values.
```

**Impact:** dramatic slowdowns when expensive Arcade runs per feature.

## When to Read references/

| If you need... | Read |
|---|---|
| Executor / profile signatures | `references/api-detail.md` |
| Popup / label / renderer expression examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-popup-templates` — expressionInfos in popups
- `arcgis-visualization` — valueExpression in renderers
- `arcgis-layers` — the data the expressions read

## Reference Samples

- [Arcade in popups](https://developers.arcgis.com/javascript/latest/sample-code/)
- [Arcade renderer](https://developers.arcgis.com/javascript/latest/sample-code/visualization-arcade/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
