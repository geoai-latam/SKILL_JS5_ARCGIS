---
name: arcgis-custom-rendering
description: >
  Add custom WebGL2 rendering to a SceneView with the ArcGIS Maps SDK for
  JavaScript 5.1 RenderNode API (externalRenderers no longer exists in 5.x):
  RenderNode.createSubclass with consumes/produces, bindRenderTarget, the render
  camera, toRenderCoordinates, and BaseLayerViewGL2D for custom WebGL in a 2D
  MapView. Use this skill whenever the user needs bespoke WebGL visuals, custom
  shaders, or to integrate a rendering library into a map or scene.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: specialized
tags:
  - rendernode
  - webgl
  - custom-rendering
  - shaders
  - 3d
requires:
  - arcgis-3d-layers
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Custom Rendering

> **When to use:** Activate this skill whenever the user needs custom WebGL rendering in a 3D scene
> — bespoke visuals, shaders, or integrating a rendering library.

## Overview

`RenderNode` injects custom WebGL2 passes into a SceneView's render pipeline. In 5.x it is the
only way: `views/3d/externalRenderers.js` (4.x) is not in the package anymore. The API is marked
**experimental** by Esri (it can change in minor releases).

- **Problem it solves:** drawing custom WebGL that the standard layers can't express.
- **Who it serves:** developers who already know WebGL.
- **Pattern it teaches:** `RenderNode.createSubclass({ consumes, produces, render })`, then
  `new Node({ view })`; for 2D, `BaseLayerViewGL2D`.
- **What it does NOT cover:** standard layers (see `arcgis-3d-layers`), shader writing itself.

## Quick Start

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
import type SceneView from "@arcgis/core/views/SceneView.js";

declare const view: SceneView;

const TintNode = RenderNode.createSubclass({
  consumes: { required: ["composite-color"] }, // an object, not an array
  produces: "composite-color",                  // one output, a string
  render() {
    const gl = this.gl;                         // WebGL2RenderingContext
    const output = this.bindRenderTarget();     // draw on top of the current composite
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, gl.drawingBufferHeight - 40, 40, 40);
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);              // a red 40 px square, top-left
    gl.disable(gl.SCISSOR_TEST);
    return output;                              // must return the ManagedFBO it produces
  },
});
const node = new TintNode({ view });            // active from here
// node.destroy() removes the pass
```

Measured with 5.1.27 (Chromium): the square appears in `view.takeScreenshot()`, `render` runs on
every redraw (15 calls while the scene settles), more after `node.requestRender()`, and none after
`destroy()`.

## Decision Tree

1. **Can a layer, renderer or effect do it?**
   - Yes → use it (`arcgis-visualization`, `arcgis-feature-effects`): supported, cheaper.
   - No → continue.

2. **3D (SceneView)?**
   - Yes → `RenderNode.createSubclass` (this skill).

3. **2D (MapView)?**
   - Yes → a layer whose `createLayerView` returns a `BaseLayerViewGL2D.createSubclass({ render })`:
     `render({ context, state })` gets a `WebGL2RenderingContext` (measured: 91 calls in 1.5 s).

**Default:** standard layers; `RenderNode` only for real custom WebGL.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
import * as webgl from "@arcgis/core/views/3d/webgl.js"; // toRenderCoordinates and friends
import BaseLayerViewGL2D from "@arcgis/core/views/2d/layers/BaseLayerViewGL2D.js";
```

### Dynamic Imports (CDN)

```javascript
const RenderNode = await $arcgis.import("@arcgis/core/views/3d/webgl/RenderNode.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-scene";
// const el = document.querySelector("arcgis-scene")!; await el.viewOnReady();
// new TintNode({ view: el.view });
```

## Key Concepts

### Concept 1: consumes and produces

`produces` is **one** `RenderNodeOutput`: `"opaque-color"`, `"transparent-color"`,
`"composite-color"` or `"final-color"` (after post-processing). `consumes` is
`{ required: RenderNodeInput[], optional?: RenderNodeInput[] }`, where inputs add `"normals"` and
`"highlights"`. If a required input is missing in a frame (for example `"highlights"` with nothing
highlighted) the node is skipped for that frame. `render(inputs)` must return the `ManagedFBO`
it produces: `bindRenderTarget()` to draw on top of it, or `acquireOutputFramebuffer()` for a new
one when you read the input as a texture.

### Concept 2: Render coordinates

In a global scene the render coordinate system is ECEF in meters. Convert with
`webgl.toRenderCoordinates(view, src, 0, SpatialReference.WGS84, dest, 0, count)`: measured,
Bogotá `[-74.08, 4.6, 2600]` → `[1744566, -6116243, 511728]`, 6,380,737 m from the center of the
Earth. The same numbers passed raw are a point 2.6 km from the center of the Earth: nothing
visible. Do math in double precision and subtract a local origin
(`renderCoordinateTransformAt`) before sending vertices to the GPU as float32.

### Concept 3: Camera, redraw and lifetime

`this.camera` (`RenderCamera`) has `viewMatrix`, `projectionMatrix` (4×4, 16 numbers),
`viewport` and `pixelRatio`; read it inside `render`, every frame. The view does not redraw on its
own while it is still: call `requestRender()` when your data changes, or once per frame from
`render` for an animation. Create GL resources once (lazily on the first `render`) and free them in
`destroy()`.

## Common Pitfalls (Top 3)

### Pitfall 1: Writing the 4.x externalRenderers API

```typescript
// ❌ Anti-pattern (4.x)
import * as externalRenderers from "@arcgis/core/views/3d/externalRenderers.js";
externalRenderers.add(view, { setup() {}, render() {} });
```

```typescript
// ✅ Correct (5.x)
const Node = RenderNode.createSubclass({ consumes: { required: ["composite-color"] }, produces: "composite-color", render() { return this.bindRenderTarget(); } });
new Node({ view });
```

**Impact:** the module is not in `@arcgis/core` 5.1: the import fails at build time.

### Pitfall 2: consumes as an array

```typescript
// ❌ Anti-pattern
new TintNode({ view, consumes: [{ name: "composite-color" }] });
```

```typescript
// ✅ Correct
const TintNode = RenderNode.createSubclass({ produces: "composite-color", render() { return this.bindRenderTarget(); } });
new TintNode({ view, consumes: { required: ["composite-color"] } });
```

**Impact:** measured: the constructor accepts it, then **every frame** throws "Cannot read
properties of undefined (reading 'includes')", `render` is never called and the whole scene
renders black (`rgb(0,0,0)`), not just the custom pass.

### Pitfall 3: A plain ES class

```typescript
// ❌ Anti-pattern
class TintNode extends RenderNode { render() { return this.bindRenderTarget(); } }
new TintNode({ view, consumes: { required: ["composite-color"] }, produces: "composite-color" });
```

```typescript
// ✅ Correct
const TintNode = RenderNode.createSubclass({ /* consumes, produces, render */ });
```

**Impact:** measured: the constructor throws "Cannot read properties of null (reading 'stage')".
`RenderNode` is an Accessor: subclass it with `createSubclass` (or `@subclass` from
`core/accessorSupport/decorators`, not tested here).

## When to Read references/

| If you need... | Read |
|---|---|
| RenderNode, webgl utils and BaseLayerViewGL2D signatures | `references/api-detail.md` |
| RenderNode setup examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-3d-layers` — standard 3D content
- `arcgis-scene-environment` — lighting your scene
- `arcgis-performance` — manage GPU cost

## Reference Samples

- [RenderNode](https://developers.arcgis.com/javascript/latest/sample-code/custom-render-node-color/)
- [Custom WebGL](https://developers.arcgis.com/javascript/latest/sample-code/scene-external-renderer/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. The examples did not run: `consumes: [{ name }]` blacks out the whole scene
  and throws every frame (measured), and a plain `class extends RenderNode` throws in the constructor; now
  `createSubclass` with `consumes: { required }`. `externalRenderers` is gone from 5.x (it was "superseded"). 2D
  custom WebGL exists (`BaseLayerViewGL2D`; the tree said to use a GraphicsLayer). Render coordinates measured.
  The "dirty GL state breaks the SDK" pitfall did not reproduce with SCISSOR_TEST and is now a caution. Run in
  `tests/runtime/casos/arcgis-custom-rendering.ts`.
- **0.1.0** (2026-05-31): Initial release.
