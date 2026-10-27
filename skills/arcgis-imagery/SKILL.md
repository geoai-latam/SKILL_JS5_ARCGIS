---
name: arcgis-imagery
description: >
  Display and analyze raster imagery with the ArcGIS Maps SDK for JavaScript 5.0:
  ImageryLayer (dynamic, server-processed) and ImageryTileLayer (cached), raster
  functions for on-the-fly processing (NDVI, hillshade), and mosaic rules. Use
  this skill whenever the user adds satellite/elevation imagery, applies a raster
  function, or controls a mosaic dataset.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: specialized
tags:
  - imagery
  - raster-function
  - mosaic-rule
  - ndvi
  - imagerylayer
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Imagery

> **When to use:** Activate this skill whenever the user adds raster imagery, applies a raster
> function (NDVI, hillshade), or controls a mosaic dataset.

## Overview

Imagery layers stream raster data; raster functions process it on the fly without altering the source.

- **Problem it solves:** displaying and analyzing satellite/elevation imagery.
- **Who it serves:** developers building remote-sensing and analysis apps.
- **Pattern it teaches:** ImageryLayer vs ImageryTileLayer; chainable raster functions; mosaic rules.
- **What it does NOT cover:** vector layers (see `arcgis-layers`) or 3D meshes (see `arcgis-3d-layers`).

## Quick Start

```typescript
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
const layer = new ImageryLayer({ url: "https://.../ImageServer" });
```

## Decision Tree

1. **Dynamic, server-processed imagery (raster functions, mosaic rules)?**
   - Yes → `ImageryLayer`.

2. **Pre-rendered cached tiles (fast, fixed)?**
   - Yes → `ImageryTileLayer`.

3. **On-the-fly processing (NDVI, hillshade, stretch)?**
   - Yes → set `rasterFunction` (chainable).

**Default:** `ImageryLayer` for analysis; `ImageryTileLayer` for fast display.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
```

### Dynamic Imports (CDN)

```javascript
const RasterFunction = await $arcgis.import("@arcgis/core/layers/support/RasterFunction.js");
```

### Map Components (recommended for new projects)

```typescript
// Add the imagery layer to the component's map.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: ImageryLayer vs ImageryTileLayer

`ImageryLayer` requests server-processed images and supports raster functions and mosaic rules.
`ImageryTileLayer` serves cached tiles — faster but fixed processing.

### Concept 2: Raster functions

A `RasterFunction` (`functionName` + `functionArguments`) processes pixels on the fly (e.g. NDVI,
Hillshade, Stretch). Chain them via a function's `Raster` argument.

### Concept 3: Mosaic rules

`mosaicRule` controls how overlapping rasters in a mosaic dataset are selected/ordered (by date,
attribute, or lock-to-raster) before display.

## Common Pitfalls (Top 3)

### Pitfall 1: Raster functions on a tile layer

```typescript
// ❌ Anti-pattern
new ImageryTileLayer({ url, rasterFunction }); // tiles are pre-rendered
```

```typescript
// ✅ Correct
new ImageryLayer({ url, rasterFunction }); // dynamic processing
```

**Impact:** the function is ignored because tiles are fixed.

### Pitfall 2: Wrong band indices for NDVI

```typescript
// ❌ Anti-pattern
new RasterFunction({ functionName: "NDVI", functionArguments: {} });
```

```typescript
// ✅ Correct
new RasterFunction({ functionName: "NDVI", functionArguments: { VisibleBandID: 2, InfraredBandID: 3 } });
```

**Impact:** garbage output from default/incorrect bands.

### Pitfall 3: Heavy dynamic imagery without caching expectations

```typescript
// ❌ Anti-pattern
// Expecting ImageryLayer to be as fast as cached tiles
```

```typescript
// ✅ Correct
// Use ImageryTileLayer where fixed, fast display is enough.
```

**Impact:** slow pans/zooms from per-request server processing.

## When to Read references/

| If you need... | Read |
|---|---|
| ImageryLayer / RasterFunction signatures | `references/api-detail.md` |
| NDVI / hillshade / mosaic examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-layers` — vector data layers
- `arcgis-visualization` — renderers for raster symbology
- `arcgis-3d-layers` — elevation/mesh in 3D

## Reference Samples

- [ImageryLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-imagerylayer/)
- [Raster function](https://developers.arcgis.com/javascript/latest/sample-code/layers-imagery-rasterfunction/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
