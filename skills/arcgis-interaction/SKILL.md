---
name: arcgis-interaction
description: >
  Handle user-to-map interaction in the ArcGIS Maps SDK for JavaScript 5.1:
  view.hitTest to identify clicked features (typed results, include/exclude,
  outFields for service layers, the SceneView ground), click and pointer-move
  events with promiseUtils.debounce, and drawing with SketchViewModel or the
  arcgis-sketch component. Use this skill whenever the user clicks/taps the map to
  select features, draws geometries, or builds custom map interactions.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Interaction

> **When to use:** Activate this skill whenever the user clicks/taps the map to identify features,
> draws geometries, or wires custom pointer interactions.

## Overview

Interaction turns pointer events into spatial actions: identify what is under the cursor, or draw new shapes.

- **Problem it solves:** connecting user gestures to features and geometries.
- **Who it serves:** developers building selection, identify, and drawing tools.
- **Pattern it teaches:** `view.hitTest` with typed results for identify; `SketchViewModel` / `arcgis-sketch` for drawing.
- **What it does NOT cover:** popups (see `arcgis-popup-templates`) or editing persistence (see `arcgis-editing`).

## Quick Start

```typescript
view.on("click", async (event) => {
  const { results } = await view.hitTest(event, { include: [myLayer] });
  const hit = results.find((r) => r.type === "graphic"); // narrow before reading .graphic
  if (hit?.type === "graphic") console.log(hit.graphic.attributes);
});
```

On a **service** `FeatureLayer`, `hit.graphic.attributes` only carries what the client loaded: measured with 5.1.27,
just `objectid`. Set `outFields` on the layer to the fields you read (or `["*"]`).

## Decision Tree

1. **Identify what the user clicked?**
   - Yes → `view.hitTest(event, { include: [layer] })`, then narrow `r.type === "graphic"`.
   - Need fields from a service layer → `outFields` on the layer, or `layer.queryFeatures` with the object id.

2. **Let the user draw a shape?**
   - Quick UI → `arcgis-sketch` component (it creates and adds its own `GraphicsLayer`).
   - Custom control → `SketchViewModel({ view, layer })`.

3. **Hover or continuous tracking?**
   - Yes → `view.on("pointer-move", ...)` wrapped in `promiseUtils.debounce`.

**Default:** `hitTest` + `include` + type narrowing for identify; `SketchViewModel` for programmatic drawing.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
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

### Concept 1: hitTest results are typed

`view.hitTest(screenPoint | event, { include?, exclude? })` resolves to `{ results }`. In 5.x each item is a
union (`graphic`, `media`, `route`, `raster`, `layer`) with a `type` field, so TypeScript rejects
`results[0].graphic` until you check `type === "graphic"`. Measured with two layers on the same spot: results come
top layer first (`graphic:dibujos, graphic:cuadros`); `include` and `exclude` both filter as documented. Clicking a
**label** returns the labeled feature's graphic, not a separate label object.

### Concept 2: SceneView adds the ground

In a `SceneView` the ground is **not** in `results`: measured, a click on empty terrain gives `results: []` and the
hit point in `response.ground.mapPoint`. So filtering 3D results with `include` is about other layers, not terrain.

### Concept 3: SketchViewModel

`SketchViewModel({ view, layer })` draws into a `GraphicsLayer`. `create(tool)` returns a **Promise** in 5.x.
Measured event states: a point gives `start, complete`; a polygon `start, active` (once per vertex and cursor
move), then `complete`. Calling `create()` again mid-drawing **cancels** the first (`polygon:cancel`) and starts the
new tool; nothing stacks. `arcgis-sketch` defaults to `creationMode: "continuous"`, so after one shape the tool
stays armed for the next.

## Common Pitfalls (Top 3)

### Pitfall 1: Reading attributes a service layer never loaded

```typescript
// ❌ Anti-pattern
const states = new FeatureLayer({ url }); // default outFields
view.on("click", async (e) => {
  const hit = (await view.hitTest(e, { include: [states] })).results[0];
  if (hit?.type === "graphic") console.log(hit.graphic.attributes.state_name); // undefined
});
```

```typescript
// ✅ Correct
const states = new FeatureLayer({ url, outFields: ["state_name", "pop2000"] });
```

**Impact:** measured on the public US states service: the default hit carried 1 field (`objectid`);
with `outFields: ["*"]`, 9 fields and `state_name = "Kansas"`. No error, just `undefined`.

### Pitfall 2: Acting on every sketch event state

```typescript
// ❌ Anti-pattern
sketch.on("create", (e) => save(e.graphic)); // also fires on start/active
```

```typescript
// ✅ Correct
sketch.on("create", (e) => { if (e.state === "complete") save(e.graphic); });
```

**Impact:** measured: a three-vertex polygon fired 4 `active` events before `complete`; even a point fires
`start` first. Each one would save a half-finished geometry.

### Pitfall 3: Running a hitTest on every pointer-move

```typescript
// ❌ Anti-pattern
view.on("pointer-move", async (e) => highlight(await view.hitTest(e)));
```

```typescript
// ✅ Correct
const hover = promiseUtils.debounce(async (e: { x: number; y: number }) => highlight(await view.hitTest(e)));
const handle = view.on("pointer-move", (e) => {
  hover(e).catch((err) => { if (!promiseUtils.isAbortError(err)) throw err; });
});
// later: handle.remove();
```

**Impact:** the SDK does not throttle `pointer-move` (measured: 30 of 30 moves delivered). With 30 quick calls,
plain code ran 30 hitTests; the debounced one resolved 2 and aborted 28 with `AbortError`, which you must swallow.

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

- **0.2.0** (2026-10-27): SDK 5.1. Measured in `tests/runtime/casos/arcgis-interaction.ts`. hitTest results are a
  typed union: narrow `type === "graphic"` (the old `results[0].graphic` fails to compile). New top pitfall: service
  layers return only `objectid` in hits unless `outFields` is set. Two extended pitfalls were false: a SceneView puts
  the ground in `response.ground`, not in `results`, and a second `create()` cancels the first instead of stacking.
  The "do it off-thread" pitfall was filler; replaced by `promiseUtils.debounce` (measured: 2 of 30 hitTests ran).
- **0.1.0** (2026-05-31): Initial release.
