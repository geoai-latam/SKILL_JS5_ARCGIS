# API Reference: Imagery

## Table of Contents

- [ImageryLayer / ImageryTileLayer](#imagerylayer--imagerytilelayer)
- [RasterFunction](#rasterfunction)
- [Mosaic rule](#mosaic-rule)

---

## ImageryLayer / ImageryTileLayer

| Class | Module | Processing |
|---|---|---|
| `ImageryLayer` | `layers/ImageryLayer.js` | Dynamic (server) — supports raster functions, mosaic rules |
| `ImageryTileLayer` | `layers/ImageryTileLayer.js` | Tiles / COG / CRF, processed in the client (also takes `rasterFunction`) |

Key `ImageryLayer` properties: `url`, `rasterFunction`, `mosaicRule`, `bandIds`, `format`, `serviceRasterInfo`.
`renderingRule` (4.x) is not in the 5.1 typings.

Pixel and catalog access: `identify(params)`, `getSamples(params)`, `fetchPixels(extent, w, h)`,
`queryRasters(query)` (catalog items as a `FeatureSet`).

---

## RasterFunction

`@arcgis/core/layers/support/RasterFunction.js`

| Property | Type | Description |
|---|---|---|
| `functionName` | `string` | e.g. `"NDVI"`, `"Hillshade"`, `"Stretch"` |
| `functionArguments` | `object` | Band ids / parameters |
| `outputPixelType` | `string` | Optional output type |

Chain by setting another `RasterFunction` as the `Raster` argument.

The classic server `"NDVI"` function returns a scaled 0–200 integer (measured: 101 for a real NDVI of
0.015), and its `VisibleBandID`/`InfraredBandID` are 0-based.

---

## rasterFunctionUtils

`@arcgis/core/layers/support/rasterFunctionUtils.js` (since 4.28): helpers that return a
`RasterFunction` with real values. Band ids are 0-based.

| Helper | Parameters |
|---|---|
| `bandArithmeticNDVI` | `{ redBandId, nirBandId, scientificOutput?, raster? }` |
| `bandArithmeticNDWI` / `bandArithmeticMNDWI` / `bandArithmeticNBR` / `bandArithmeticSAVI` / `bandArithmeticEVI` | band ids per index |
| `bandArithmeticCustom` | `{ bandIndexes: "(b4 - b3) / (b4 + b3)" , raster? }` |
| `stretchMinMax` / `stretchStandardDeviation` / `stretchPercentClip` | stretches |
| `colormap` | `{ colorRampName \| colormap, raster }` |
| `threshold` / `computeChange` / `convolution` | analysis |

---

## Mosaic rule

`mosaicRule` (object/`MosaicRule`) controls overlapping raster selection:

| Field | Description |
|---|---|
| `method` | `"esriMosaicAttribute"`, `"esriMosaicLockRaster"`, ... |
| `sortField` / `sortValue` | Ordering by attribute/date |
| `lockRasterIds` | Lock to specific rasters |
