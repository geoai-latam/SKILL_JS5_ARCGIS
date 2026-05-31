---
name: arcgis-3d-layers
description: >
  Add 3D layers in a SceneView with the ArcGIS Maps SDK for JavaScript 5.0:
  SceneLayer (3D objects/buildings), IntegratedMeshLayer (reality-capture meshes),
  PointCloudLayer, and the new GaussianSplatLayer for photorealistic captures. Use
  this skill whenever the user works in 3D, loads i3s scene services, meshes,
  point clouds, or gaussian splats.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: layers
tags:
  - scenelayer
  - integratedmesh
  - pointcloud
  - gaussiansplat
  - 3d
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# 3D Layers

> **When to use:** Activate this skill whenever the user loads 3D content into a SceneView —
> scene layers, integrated meshes, point clouds, or gaussian splats.

## Overview

3D layers render only in a `SceneView`. Each maps to a kind of 3D data source.

- **Problem it solves:** choosing and loading the right 3D layer for the data.
- **Who it serves:** developers building digital twins, city scenes, and reality-capture views.
- **Pattern it teaches:** SceneView-only layers, i3s scene services, and the new gaussian splats.
- **What it does NOT cover:** 2D layers (see `arcgis-layers`) or scene lighting (see `arcgis-scene-environment`).

## Quick Start

```typescript
import SceneLayer from "@arcgis/core/layers/SceneLayer.js";
const layer = new SceneLayer({ url: "https://.../Buildings/SceneServer" });
scene.add(layer); // a Map used by a SceneView
```

## Decision Tree

1. **What is the 3D data?**
   - 3D objects/buildings (i3s) → `SceneLayer`.
   - City-scale photogrammetry mesh → `IntegratedMeshLayer`.
   - LiDAR points → `PointCloudLayer`.
   - Gaussian splat capture → `GaussianSplatLayer` (new in 5.0).

2. **Rendering in 2D?**
   - Yes → these will not show; use a `SceneView`.

**Default:** `SceneLayer` for BIM/object data; `IntegratedMeshLayer` for captured reality.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import SceneLayer from "@arcgis/core/layers/SceneLayer.js";
```

### Dynamic Imports (CDN)

```javascript
const SceneLayer = await $arcgis.import("@arcgis/core/layers/SceneLayer.js");
```

### Map Components (recommended for new projects)

```typescript
// Use <arcgis-scene> and add the 3D layer to its map.
import "@arcgis/map-components/dist/components/arcgis-scene";
```

## Key Concepts

### Concept 1: SceneView-only

3D layers require a `SceneView` (`<arcgis-scene>`). Adding them to a 2D `MapView` shows nothing.
Set `map.ground = "world-elevation"` so layers sit on terrain.

### Concept 2: i3s scene services

`SceneLayer`, `IntegratedMeshLayer`, and `PointCloudLayer` consume i3s `SceneServer` services.
They stream level-of-detail nodes, so initial load is progressive.

### Concept 3: GaussianSplatLayer (new in 5.0)

`GaussianSplatLayer` renders photorealistic gaussian-splat captures. It is heavy on the GPU —
budget quality and only load it when the user opts in.

## Common Pitfalls (Top 3)

### Pitfall 1: Adding a 3D layer to a MapView

```typescript
// ❌ Anti-pattern
const view = new MapView({ map }); // 2D
map.add(new SceneLayer({ url }));   // never renders
```

```typescript
// ✅ Correct
import SceneView from "@arcgis/core/views/SceneView.js";
const view = new SceneView({ map });
map.add(new SceneLayer({ url }));
```

**Impact:** the layer loads but nothing appears in a 2D view.

### Pitfall 2: Expecting splats/mesh without GPU headroom

```typescript
// ❌ Anti-pattern
map.addMany([gaussianSplat, integratedMesh, pointCloud]); // all at once, high quality
```

```typescript
// ✅ Correct
view.qualityProfile = "medium";
map.add(integratedMesh); // load heavy layers deliberately
```

**Impact:** stutter or context loss on lower-end GPUs.

### Pitfall 3: No elevation for ground-aligned layers

```typescript
// ❌ Anti-pattern
const map = new Map({ basemap: "arcgis/imagery" }); // no ground
```

```typescript
// ✅ Correct
const map = new Map({ basemap: "arcgis/imagery", ground: "world-elevation" });
```

**Impact:** meshes/objects float or sink relative to terrain.

## When to Read references/

| If you need... | Read |
|---|---|
| 3D layer signatures | `references/api-detail.md` |
| SceneLayer / mesh / splat examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-core-maps` — create the SceneView
- `arcgis-scene-environment` — lighting, atmosphere, weather
- `arcgis-layers` — 2D data layers

## Reference Samples

- [SceneLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-scenelayer/)
- [IntegratedMeshLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-integratedmesh/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
