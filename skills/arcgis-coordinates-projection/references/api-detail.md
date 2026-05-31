# API Reference: Coordinates & Projection

## Table of Contents

- [SpatialReference](#spatialreference)
- [projectOperator](#projectoperator)
- [webMercatorUtils](#webmercatorutils)

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
| `load()` | Loads the projection engine (await once) |
| `execute(geometry, outSpatialReference, options?)` | Reproject one geometry |
| `executeMany(geometries, outSpatialReference, options?)` | Batch reproject |

---

## webMercatorUtils

`@arcgis/core/geometry/support/webMercatorUtils.js`

| Function | Description |
|---|---|
| `geographicToWebMercator(geom)` | 4326 → 3857 (sync) |
| `webMercatorToGeographic(geom)` | 3857 → 4326 (sync) |
| `canProject(a, b)` | Whether a pair can be projected |
