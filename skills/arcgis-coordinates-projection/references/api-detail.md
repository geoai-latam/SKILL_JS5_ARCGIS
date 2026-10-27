# API Reference: Coordinates & Projection

## Table of Contents

- [SpatialReference](#spatialreference)
- [projectOperator](#projectoperator)
- [webMercatorUtils](#webmercatorutils)
- [geographicTransformationUtils](#geographictransformationutils)

---

## SpatialReference

`@arcgis/core/geometry/SpatialReference.js`

| Member | Description |
|---|---|
| `new SpatialReference({ wkid })` | Create by well-known id |
| `wkid` | e.g. 4326 (WGS84), 3857 (Web Mercator) |
| `isWGS84` / `isWebMercator` | Convenience flags |

---

## projectOperator

`@arcgis/core/geometry/operators/projectOperator.js`

| Function | Description |
|---|---|
| `isLoaded()` / `load()` | Check / load the projection engine (await once) |
| `execute(geometry, outSpatialReference, options?)` | Reproject one geometry |
| `executeMany(geometries, outSpatialReference, options?)` | Batch reproject; all inputs must share one SR (others come back `null`) |

`options`: `{ geographicTransformation?, areaOfInterestExtent? }`. Without them a default
equation-based transformation is applied when the datums differ.

---

## webMercatorUtils

`@arcgis/core/geometry/support/webMercatorUtils.js`

| Function | Description |
|---|---|
| `geographicToWebMercator(geom)` | 4326 → 3857 (sync) |
| `webMercatorToGeographic(geom)` | 3857 → 4326 (sync) |
| `canProject(a, b)` | Whether a pair can be projected (false for 4686 → 3857) |
| `lngLatToXY(lon, lat)` / `xyToLngLat(x, y)` | Plain arrays, no geometry |

It neither checks the datum nor clamps latitude: lat 90 gives y = 103 676 511 (the valid range is
±20 037 508; measured).

---

## geographicTransformationUtils

`@arcgis/core/geometry/operators/support/geographicTransformationUtils.js`

| Function | Description |
|---|---|
| `isLoaded()` / `load()` | Must be loaded before use |
| `getTransformation(in, out, aoi?)` | The default transformation |
| `getTransformations(in, out, aoi?)` | All suitable transformations for the pair (and area) |
