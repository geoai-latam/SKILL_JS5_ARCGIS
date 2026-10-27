---
name: arcgis-imagery
description: >
  Display and analyze raster imagery with the ArcGIS Maps SDK for JavaScript 5.1:
  ImageryLayer (server-processed) and ImageryTileLayer (client-processed tiles and
  COGs), raster functions with rasterFunctionUtils (NDVI and other indices with
  0-based band ids), mosaic rules and queryRasters. Use this skill whenever the
  user adds satellite/elevation imagery, computes an index, applies a raster
  function, or controls a mosaic dataset.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
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
import * as rasterFunctionUtils from "@arcgis/core/layers/support/rasterFunctionUtils.js";

const layer = new ImageryLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Toronto/ImageServer", // Blue, Green, Red, NIR
  rasterFunction: rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 }), // 0-based
});
```

Measured with 5.1.27: `identify` returns `0.0148` over Queen's Park and `-0.263` over the harbour,
the same as `(NIR − R) / (NIR + R)` computed by hand from the raw pixels.

## Decision Tree

1. **An ArcGIS ImageServer (dynamic, mosaic datasets)?**
   - Yes → `ImageryLayer`; processing runs on the server (`rasterFunction`, `mosaicRule`).

2. **A tiled imagery service or a cloud raster (COG / CRF)?**
   - Yes → `ImageryTileLayer`; it also takes a `rasterFunction`, processed **in the client**.

3. **An index (NDVI, NDWI, NBR, SAVI, EVI...)?**
   - `rasterFunctionUtils.bandArithmeticNDVI(...)` and friends: true values, 0-based band ids.

**Default:** `rasterFunction` + `rasterFunctionUtils`; `renderingRule` is the 4.x name.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
import * as rasterFunctionUtils from "@arcgis/core/layers/support/rasterFunctionUtils.js";
```

### Dynamic Imports (CDN)

```javascript
const rasterFunctionUtils = await $arcgis.import("@arcgis/core/layers/support/rasterFunctionUtils.js");
```

### Map Components (recommended for new projects)

```typescript
// Add the imagery layer to the component's map.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: ImageryLayer vs ImageryTileLayer

`ImageryLayer` asks an ImageServer for each image; the server applies the raster function and the
mosaic rule. `ImageryTileLayer` reads tiles (or a COG/CRF) and renders and processes them in the
browser: it accepts `rasterFunction` too (measured: it keeps it), so "tiles are pre-rendered, raster
functions are ignored" is false.

### Concept 2: Raster functions and band ids

`rasterFunctionUtils` (since 4.28) builds the `RasterFunction` for you: band arithmetic
(`bandArithmeticNDVI`, `NDWI`, `NBR`, `SAVI`, `EVI`, `custom`), stretches, `colormap`, `threshold`.
Band ids are **0-based** indexes into the service's bands: for Blue, Green, Red, NIR it is red 2 and
NIR 3; for Landsat 8 (Coastal, Blue, Green, Red, NIR, ...) it is red 3 and NIR 4. Read the order
from `layer.serviceRasterInfo` before writing the ids. Chain functions by passing one as the
`raster` of the next.

### Concept 3: Mosaic rules and catalog queries

`mosaicRule` orders the overlapping rasters of a mosaic dataset (by attribute, date, lock-to-raster).
To list the scenes themselves, `layer.queryRasters({ geometry, outFields })` returns a `FeatureSet`
of catalog items; pixel values come from `identify`, `getSamples` or `fetchPixels`.

## Common Pitfalls (Top 3)

### Pitfall 1: Reading the server NDVI function as -1..1

```typescript
// ❌ Anti-pattern
const rf = new RasterFunction({ functionName: "NDVI", functionArguments: { VisibleBandID: 2, InfraredBandID: 3 } });
// identify → 101: "NDVI > 0.3 means vegetation" never matches
```

```typescript
// ✅ Correct
const rf = rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 }); // identify → 0.0148
```

**Impact:** measured on the same pixel: the classic `"NDVI"` raster function returns **101** (and
74 over water), the scaled 0–200 integer output (`100 × (1 + NDVI)`); `bandArithmeticNDVI` returns
0.0148 and -0.263. Thresholds written for real NDVI silently select nothing or everything.

### Pitfall 2: Counting bands from 1

```typescript
// ❌ Anti-pattern
rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 4, nirBandId: 5 }); // Landsat 8 band numbers
```

```typescript
// ✅ Correct
rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 3, nirBandId: 4 }); // Landsat 8, 0-based
```

**Impact:** with sensor band numbers you compute the index on the wrong bands. Measured on the
4-band Toronto service: green instead of red gives 85 instead of 101 (no error). An out-of-range
id, or no arguments at all, gave the default result, so a wrong id is not always visible either.

### Pitfall 3: renderingRule from 4.x

```typescript
// ❌ Anti-pattern
new ImageryLayer({ url, renderingRule: { functionName: "NDVI" } });
```

```typescript
// ✅ Correct
new ImageryLayer({ url, rasterFunction: rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 }) });
```

**Impact:** `renderingRule` is not in the 5.1 typings (TypeScript fails). Measured untyped: it does
not populate `rasterFunction` (it stays `null`).

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

- **0.2.0** (2026-10-27): SDK 5.1. Measured with identify on a public 4-band service: the classic `"NDVI"`
  raster function returns a scaled 0–200 value (101), not -1..1; `rasterFunctionUtils.bandArithmeticNDVI` returns
  real NDVI and is now the default. Band ids are 0-based (Landsat 8 red/NIR = 3/4). Pitfall 1 was false:
  `ImageryTileLayer` takes raster functions (client side). `renderingRule` is gone from the 5.1 typings. Added
  `queryRasters`. Run in `tests/runtime/casos/arcgis-imagery.ts`.
- **0.1.0** (2026-05-31): Initial release.
