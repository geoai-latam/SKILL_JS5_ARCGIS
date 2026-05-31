---
name: arcgis-coordinates-projection
description: >
  Handle coordinate systems and reprojection with the ArcGIS Maps SDK for
  JavaScript 5.0: SpatialReference and WKIDs, the 5.0 projectOperator (load +
  execute) for general reprojection, and webMercatorUtils for fast geographic ↔
  web-mercator conversion. Use this skill whenever the user reprojects geometry,
  works with WKIDs/spatial references, or aligns data across coordinate systems.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: spatial
tags:
  - projection
  - spatialreference
  - wkid
  - webmercator
  - reproject
requires:
  - arcgis-geometry-operations
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Coordinates & Projection

> **When to use:** Activate this skill whenever the user reprojects geometry, deals with WKIDs /
> spatial references, or aligns data across coordinate systems.

## Overview

Every geometry has a spatial reference; mixing systems requires reprojection.

- **Problem it solves:** correct coordinate handling and reprojection.
- **Who it serves:** developers integrating data in different coordinate systems.
- **Pattern it teaches:** WKIDs, `projectOperator.load()`+`execute`, and webMercatorUtils shortcuts.
- **What it does NOT cover:** geometry overlay (see `arcgis-geometry-operations`).

## Quick Start

```typescript
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
const wm = webMercatorUtils.geographicToWebMercator(geographicPoint);
```

## Decision Tree

1. **Geographic (4326) ↔ Web Mercator (3857) only?**
   - Yes → `webMercatorUtils` (synchronous, no load).

2. **Any other reprojection?**
   - Yes → `projectOperator.load()` then `projectOperator.execute(geom, outSR)`.

3. **Just labeling a system?**
   - Yes → `new SpatialReference({ wkid })`.

**Default:** webMercatorUtils for the common pair; projectOperator otherwise.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
```

### Dynamic Imports (CDN)

```javascript
const SpatialReference = await $arcgis.import("@arcgis/core/geometry/SpatialReference.js");
```

### Map Components (recommended for new projects)

```typescript
// Reproject geometries you read from the component view before mixing systems.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: SpatialReference & WKID

A `SpatialReference` identifies the coordinate system, usually by `wkid` (e.g. 4326 = WGS84,
3857 = Web Mercator). Geometry carries its own `spatialReference`.

### Concept 2: projectOperator (async load)

The general projection engine must be loaded once: `await projectOperator.load()`. Then
`projectOperator.execute(geometry, outSpatialReference)` returns the reprojected geometry.

### Concept 3: webMercatorUtils shortcut

For the common 4326 ↔ 3857 pair, `webMercatorUtils.geographicToWebMercator` /
`webMercatorToGeographic` are synchronous and need no engine load.

## Common Pitfalls (Top 3)

### Pitfall 1: Calling execute before load

```typescript
// ❌ Anti-pattern
projectOperator.execute(geom, outSR); // engine not loaded yet
```

```typescript
// ✅ Correct
await projectOperator.load();
projectOperator.execute(geom, outSR);
```

**Impact:** the call throws because the projection engine isn't ready.

### Pitfall 2: Comparing geometries in different SRs

```typescript
// ❌ Anti-pattern
geometryEngine.intersects(geom4326, geom3857);
```

```typescript
// ✅ Correct
await projectOperator.load();
const same = projectOperator.execute(geom4326, geom3857.spatialReference);
```

**Impact:** wrong/empty results from mismatched coordinate systems.

### Pitfall 3: Hand-rolling the web-mercator math

```typescript
// ❌ Anti-pattern
const x = (lon * 20037508.34) / 180; // error-prone
```

```typescript
// ✅ Correct
const wm = webMercatorUtils.geographicToWebMercator(point);
```

**Impact:** subtle projection errors versus the tested helper.

## When to Read references/

| If you need... | Read |
|---|---|
| SpatialReference / projectOperator signatures | `references/api-detail.md` |
| Reprojection examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-geometry-operations` — operate after projecting
- `arcgis-core-maps` — view spatial reference
- `arcgis-layers` — layers in various coordinate systems

## Reference Samples

- [Projection](https://developers.arcgis.com/javascript/latest/sample-code/geometry-operators/)
- [Spatial reference](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-SpatialReference.html)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
