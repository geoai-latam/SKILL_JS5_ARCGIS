---
name: arcgis-custom-rendering
description: >
  Add custom WebGL rendering to a SceneView with the ArcGIS Maps SDK for
  JavaScript 5.0 RenderNode API (the successor to externalRenderers): inject
  render passes, access the WebGL context and camera, and draw custom geometry in
  the scene. Use this skill whenever the user needs bespoke WebGL visuals, custom
  shaders, or to integrate a 3D rendering library into a scene.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Custom Rendering

> **When to use:** Activate this skill whenever the user needs custom WebGL rendering in a 3D scene
> — bespoke visuals, shaders, or integrating a rendering library.

## Overview

`RenderNode` injects custom WebGL passes into a SceneView's render pipeline (replacing externalRenderers).

- **Problem it solves:** drawing custom WebGL that the standard layers can't express.
- **Who it serves:** advanced developers doing custom 3D graphics.
- **Pattern it teaches:** subclass `RenderNode`, declare produces/consumes, render with the view's context.
- **What it does NOT cover:** standard layers (see `arcgis-3d-layers`) or 2D rendering.

## Quick Start

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
// class MyNode extends RenderNode { render(inputs) { /* draw with this.gl */ return ...; } }
```

## Decision Tree

1. **Can a SceneLayer/renderer do it?**
   - Yes → use the standard layer/renderer (cheaper, supported).
   - No → continue.

2. **Need custom WebGL in the 3D pipeline?**
   - Yes → subclass `RenderNode` and attach it to the SceneView.

3. **2D custom drawing?**
   - Use a `GraphicsLayer`/canvas overlay instead (RenderNode is 3D).

**Default:** standard layers; reach for RenderNode only for true custom WebGL.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
```

### Dynamic Imports (CDN)

```javascript
const RenderNode = await $arcgis.import("@arcgis/core/views/3d/webgl/RenderNode.js");
```

### Map Components (recommended for new projects)

```typescript
// Get the SceneView from arcgisViewReadyChange, then attach your RenderNode.
import "@arcgis/map-components/components/arcgis-scene";
```

## Key Concepts

### Concept 1: RenderNode

Subclass `RenderNode`, set `produces`/`consumes` to place it in the pipeline, and implement
`render(inputs)`. The node has access to the WebGL context and the view's camera.

### Concept 2: Coordinate systems

The SceneView renders in a render coordinate system; transform your world coordinates into it (the
node provides camera/transform info) so custom geometry aligns with the scene.

### Concept 3: Lifecycle & resources

Allocate GL resources once; release them when the node is removed. Request redraws via the node's
`requestRender` rather than a tight loop.

## Common Pitfalls (Top 3)

### Pitfall 1: Using externalRenderers patterns

```typescript
// ❌ Anti-pattern
externalRenderers.add(view, myRenderer); // old API
```

```typescript
// ✅ Correct
// Subclass RenderNode (the 5.0 successor) and attach it.
```

**Impact:** building on the superseded externalRenderers approach.

### Pitfall 2: Not transforming to render coordinates

```typescript
// ❌ Anti-pattern
drawAt(lon, lat, z); // raw geographic coords in WebGL
```

```typescript
// ✅ Correct
// Convert to the view's render coordinate system before drawing.
```

**Impact:** geometry appears in the wrong place or not at all.

### Pitfall 3: Leaking GL resources

```typescript
// ❌ Anti-pattern
// Allocating buffers/textures every frame
```

```typescript
// ✅ Correct
// Allocate once; reuse; free on removal.
```

**Impact:** GPU memory growth and context loss.

## When to Read references/

| If you need... | Read |
|---|---|
| RenderNode signatures | `references/api-detail.md` |
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

- **0.1.0** (2026-05-31): Initial release.
