---
name: arcgis-3d-layers
description: >
  Add 3D layers in a SceneView with the ArcGIS Maps SDK for JavaScript 5.1:
  SceneLayer (3D objects/buildings), IntegratedMeshLayer (i3s meshes),
  IntegratedMesh3DTilesLayer (OGC 3D Tiles), PointCloudLayer, and GaussianSplatLayer
  (published 3D Tiles, not .ply files). Use this skill whenever the user works in 3D,
  loads i3s scene services, 3D Tiles, meshes, point clouds, or gaussian splats.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
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
   - City-scale photogrammetry mesh from a `SceneServer` (i3s) → `IntegratedMeshLayer`.
   - Mesh as OGC 3D Tiles (`.../3DTilesServer/tileset.json`) → `IntegratedMesh3DTilesLayer`.
     `IntegratedMeshLayer` cannot read it (it asks for `?f=json` and gets a 404).
   - LiDAR points → `PointCloudLayer`.
   - Gaussian splat capture → `GaussianSplatLayer` (5.0), pointed at a published
     `3DTilesServer/tileset.json` or a `portalItem`. It does **not** read a raw `.ply`/`.splat`
     file: publish it first (ArcGIS Pro, Reality Studio, Drone2Map, or upload a `.3tz`).
   - BIM from Revit → `BuildingSceneLayer`; volumetric data → `VoxelLayer`.

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
import "@arcgis/map-components/components/arcgis-scene";
```

## Key Concepts

### Concept 1: SceneView-only

3D layers require a `SceneView` (`<arcgis-scene>`). Adding them to a 2D `MapView` shows nothing.
Set `map.ground = "world-elevation"` so layers sit on terrain.

### Concept 2: i3s scene services

`SceneLayer`, `IntegratedMeshLayer`, and `PointCloudLayer` consume i3s `SceneServer` services.
They stream level-of-detail nodes, so initial load is progressive.

### Concept 3: GaussianSplatLayer (5.0) and what changed in 5.1

`GaussianSplatLayer` renders photorealistic gaussian-splat captures published as 3D Tiles:

```typescript
import GaussianSplatLayer from "@arcgis/core/layers/GaussianSplatLayer.js";
const splat = new GaussianSplatLayer({
  url: "https://tiles.arcgis.com/tiles/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Portcoast_industrial/3DTilesServer/tileset.json",
});
```

A wrong URL fails **silently**: with an unreachable or unsupported source, `await layer.load()`
still resolves, `loadError` stays `null` and `fullExtent` is the whole world (-180…180). Check the
console (CORS/404) and the extent, not just that `load()` resolved.

Since 5.1 splats work with clipping areas, slice, line of sight, elevation profiles and scene
shadows; shadow cast, viewshed and volume measurement are still in progress.

### Concept 4: `opacity` does nothing on these layers in a SceneView

The SDK documents it as a known limitation: changing `opacity` is not supported in a SceneView for
`IntegratedMeshLayer`, `IntegratedMesh3DTilesLayer`, `PointCloudLayer` and `GaussianSplatLayer`
(nor `VoxelLayer`). To fade them, toggle `visible` or clip them instead.

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

### Pitfall 2: Hard-coding `qualityProfile` to "fix" heavy layers

```typescript
// ❌ Anti-pattern
view.qualityProfile = "high"; // or "medium", fixed for every device
map.addMany([gaussianSplat, integratedMesh, pointCloud]); // all at startup
```

```typescript
// ✅ Correct
// Leave qualityProfile alone: the SceneView sets it per device on load.
map.add(integratedMesh);
loadSplatButton.onclick = () => map.add(gaussianSplat); // heavy layers on user intent
```

**Impact:** the SDK sets `qualityProfile` automatically from the detected device and recommends not
setting it unless the target hardware is known; a fixed value is wrong for someone's GPU. If you
expose it, expose it as a user setting.

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
- [IntegratedMeshLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-integratedmeshlayer/)
- [GaussianSplatLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-gaussiansplatlayer/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. `GaussianSplatLayer` takes a published `3DTilesServer/tileset.json` or
  `portalItem`, not a `.ply` (checked by running it); silent-failure check; `IntegratedMesh3DTilesLayer`,
  `BuildingSceneLayer` and `VoxelLayer` in the decision tree; `opacity` limitation; `qualityProfile`
  is no longer hard-coded (it contradicted the SDK guidance); 5.1 splat capabilities.
- **0.1.0** (2026-05-31): Initial release.
