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
| `ImageryTileLayer` | `layers/ImageryTileLayer.js` | Cached tiles — fixed |

Key `ImageryLayer` properties: `url`, `rasterFunction`, `mosaicRule`, `renderingRule`, `format`.

---

## RasterFunction

`@arcgis/core/layers/support/RasterFunction.js`

| Property | Type | Description |
|---|---|---|
| `functionName` | `string` | e.g. `"NDVI"`, `"Hillshade"`, `"Stretch"` |
| `functionArguments` | `object` | Band ids / parameters |
| `outputPixelType` | `string` | Optional output type |

Chain by setting another `RasterFunction` as the `Raster` argument.

---

## Mosaic rule

`mosaicRule` (object/`MosaicRule`) controls overlapping raster selection:

| Field | Description |
|---|---|
| `method` | `"esriMosaicAttribute"`, `"esriMosaicLockRaster"`, ... |
| `sortField` / `sortValue` | Ordering by attribute/date |
| `lockRasterIds` | Lock to specific rasters |
