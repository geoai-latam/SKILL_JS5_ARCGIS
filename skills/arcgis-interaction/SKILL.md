---
name: arcgis-interaction
description: >
  Handle user-to-map interaction in the ArcGIS Maps SDK for JavaScript 5.0:
  view.hitTest to identify clicked features, pointer/click events, and drawing
  with SketchViewModel (or the arcgis-sketch component). Use this skill whenever
  the user clicks/taps the map to select features, draws geometries, or builds
  custom map interactions.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: interaction
tags:
  - hittest
  - pointer-events
  - sketch
  - selection
  - drawing
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Interaction

> **When to use:** Activate this skill whenever the user clicks/taps the map to identify features,
> draws geometries, or wires custom pointer interactions.

## Overview

Interaction turns pointer events into spatial actions — identify what's under the cursor or draw new shapes.

- **Problem it solves:** connecting user gestures to features and geometries.
- **Who it serves:** developers building selection, identify, and drawing tools.
- **Pattern it teaches:** `view.hitTest` for identify; `SketchViewModel` / `arcgis-sketch` for drawing.
- **What it does NOT cover:** popups (see `arcgis-popup-templates`) or editing persistence (see `arcgis-editing`).

## Quick Start

```typescript
view.on("click", async (event) => {
  const { results } = await view.hitTest(event);
  console.log("features under cursor:", results.length);
});
```

## Decision Tree

1. **Identify what the user clicked?**
   - Yes → `view.hitTest(event)`.

2. **Let the user draw a shape?**
   - Quick UI → `arcgis-sketch` component.
   - Custom control → `SketchViewModel`.

3. **Continuous pointer tracking?**
   - Yes → `view.on("pointer-move", ...)` (throttle it).

**Default:** `hitTest` for identify; `SketchViewModel` for programmatic drawing.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
```

### Dynamic Imports (CDN)

```javascript
const SketchViewModel = await $arcgis.import("@arcgis/core/widgets/Sketch/SketchViewModel.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-sketch";
```

## Key Concepts

### Concept 1: hitTest

`view.hitTest(screenPoint | clickEvent)` resolves to `{ results }`. Each result references a
graphic and its layer. Filter by `layer` to identify only the layer you care about.

### Concept 2: SketchViewModel

`SketchViewModel({ view, layer })` drives drawing into a `GraphicsLayer`. Listen to `create` /
`update` events; act when `event.state === "complete"`.

### Concept 3: Pointer events

`view.on("pointer-move" | "click" | "double-click", handler)` returns a handle. Remove it on
cleanup, and throttle high-frequency events like `pointer-move`.

## Common Pitfalls (Top 3)

### Pitfall 1: hitTest without filtering layers

```typescript
// ❌ Anti-pattern
const { results } = await view.hitTest(event); // includes basemap/labels
const g = results[0];
```

```typescript
// ✅ Correct
const { results } = await view.hitTest(event, { include: [myLayer] });
```

**Impact:** you grab the wrong graphic (e.g. a label) instead of your feature.

### Pitfall 2: Acting on every sketch event state

```typescript
// ❌ Anti-pattern
sketch.on("create", (e) => save(e.graphic)); // fires on start/active too
```

```typescript
// ✅ Correct
sketch.on("create", (e) => { if (e.state === "complete") save(e.graphic); });
```

**Impact:** half-finished geometries get saved repeatedly.

### Pitfall 3: Leaking pointer-move handlers

```typescript
// ❌ Anti-pattern
view.on("pointer-move", heavyHandler); // never removed, runs constantly
```

```typescript
// ✅ Correct
const handle = view.on("pointer-move", heavyHandler);
// later: handle.remove();
```

**Impact:** main-thread starvation and leaks across re-renders.

## When to Read references/

| If you need... | Read |
|---|---|
| hitTest / SketchViewModel signatures | `references/api-detail.md` |
| Identify / draw / select examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-popup-templates` — show info for clicked features
- `arcgis-editing` — persist drawn/edited geometries
- `arcgis-feature-effects` — emphasize the selection

## Reference Samples

- [hitTest](https://developers.arcgis.com/javascript/latest/sample-code/view-hittest/)
- [SketchViewModel](https://developers.arcgis.com/javascript/latest/sample-code/sketch-geometries/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
