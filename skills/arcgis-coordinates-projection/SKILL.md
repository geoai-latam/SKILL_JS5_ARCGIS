---
name: arcgis-coordinates-projection
description: >
  Handle coordinate systems and reprojection with the ArcGIS Maps SDK for
  JavaScript 5.1: SpatialReference and WKIDs (incl. Colombia's EPSG 9377),
  projectOperator (load + execute/executeMany), datum transformations with
  geographicTransformationUtils, and webMercatorUtils for WGS84 ↔ web mercator.
  Use this skill whenever the user reprojects geometry, works with WKIDs or
  datums, or aligns data across coordinate systems.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
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
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import Point from "@arcgis/core/geometry/Point.js";

if (!projectOperator.isLoaded()) await projectOperator.load();
const bogota = new Point({ longitude: -74.0761, latitude: 4.5981 }); // x = lon, y = lat
// MAGNA-SIRGAS / Origen-Nacional, Colombia's official plane system since 2020
const plano = projectOperator.execute(bogota, new SpatialReference({ wkid: 9377 }));
```

## Decision Tree

1. **Only WGS84 (4326) ↔ Web Mercator (3857/102100)?**
   - Yes → `webMercatorUtils` (synchronous, no load). It does not check the datum: see Pitfall 2.
2. **Any other system (national grids, UTM, another datum)?**
   - Yes → `projectOperator.load()` once, then `execute` / `executeMany`.
3. **Different datums (Bogotá 1975, NAD27, PSAD56…)?**
   - Yes → choose the transformation: `geographicTransformationUtils.getTransformations(in, out, aoi)`
     and pass it as `{ geographicTransformation }`. Grid-based transformations are not supported.
4. **Comparing or overlaying geometries?**
   - Bring them to one spatial reference first: the operators do not reproject for you.

**Default:** `projectOperator` with an explicit target; `webMercatorUtils` only for the WGS84 pair.

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
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: SpatialReference & WKID

A `SpatialReference` identifies the coordinate system by `wkid`: 4326 (WGS84), 3857/102100 (Web
Mercator), 4686 (MAGNA-SIRGAS geographic), 9377 (MAGNA-SIRGAS / Origen-Nacional, Colombia's single
official plane system: IGAC resolutions 471 and 529 of 2020, EPSG code fixed in 2021; it replaces
the five zones such as 3116 "Bogota zone"). Every geometry carries its own `spatialReference`.
In a `Point`, `x` is the longitude and `y` the latitude.

### Concept 2: projectOperator (load once)

`projectOperator` needs its engine: `if (!projectOperator.isLoaded()) await projectOperator.load()`.
Measured with 5.1.27: calling `execute` before that throws `p is not a function`, a message that
does not say "load". The geodetic operators (`geodeticDistanceOperator`, `geodesicBufferOperator`…)
have the same `load()`. `executeMany` projects an array that **shares one spatial reference**: a
geometry in another SR comes back `null`, without an error. Z values pass through (measured), but a
change of vertical coordinate system throws.

### Concept 3: Datum transformations are chosen, not assumed

When the datums differ, `execute` applies a default equation-based transformation on its own
(measured: the result with no options equals `getTransformation(in, out)`). The default is one of
many: from Bogotá 1975 (4218) to WGS84 there are 27, and they disagree by up to 22 m in Bogotá.
Pick the one for your area with `getTransformations(in, out, areaOfInterestExtent)` and pass it
explicitly; document which one you used.

### Concept 4: webMercatorUtils shortcut

`geographicToWebMercator` / `webMercatorToGeographic` are synchronous and need no load, but they
only know WGS84 ↔ Web Mercator and do not validate their input (see the pitfalls).

## Common Pitfalls (Top 3)

### Pitfall 1: Calling execute before load

```typescript
// ❌ Anti-pattern
projectOperator.execute(geom, outSR); // engine not loaded yet
```

```typescript
// ✅ Correct
if (!projectOperator.isLoaded()) await projectOperator.load();
projectOperator.execute(geom, outSR);
```

**Impact:** measured with 5.1.27: it throws `p is not a function`, which does not point at the
missing `load()`.

### Pitfall 2: Overlaying geometries in different spatial references

```typescript
// ❌ Anti-pattern
intersectsOperator.execute(poly4326, poly3857);
```

```typescript
// ✅ Correct
if (!projectOperator.isLoaded()) await projectOperator.load();
const same = projectOperator.execute(poly4326, poly3857.spatialReference)!;
intersectsOperator.execute(same, poly3857);
```

**Impact:** measured: for the very same polygon in 4326 and in 3857, `intersectsOperator` returns
`false` with no error. Every spatial test on mixed systems is silently wrong.

### Pitfall 3: Relabelling coordinates instead of transforming the datum

```typescript
// ❌ Anti-pattern: coordinates in Bogotá 1975 (4218) stamped as WGS84
const p = new Point({ x: -74.0761, y: 4.5981, spatialReference: { wkid: 4326 } });
```

```typescript
// ✅ Correct
const src = new Point({ x: -74.0761, y: 4.5981, spatialReference: { wkid: 4218 } });
const t = geographicTransformationUtils.getTransformation(src.spatialReference, SpatialReference.WGS84, aoi);
const p = projectOperator.execute(src, SpatialReference.WGS84, { geographicTransformation: t });
```

**Impact:** measured: 492 m off in Bogotá. Old Colombian cartography (and NAD27, PSAD56, SAD69
data elsewhere) has to be transformed, not relabelled.

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

- [Projection](https://developers.arcgis.com/javascript/latest/api-reference/)
- [Spatial reference](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-SpatialReference.html)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Measured: `execute` before `load()` throws `p is not a function`;
  `intersectsOperator` on mixed systems returns `false` silently (the anti-pattern used the deprecated
  `geometryEngine`); `execute` applies a default datum transformation by itself, 27 exist for Bogotá 1975 and
  differ by 22 m, relabelling instead of transforming moves 492 m; `executeMany` returns `null` for a geometry in
  another SR; `webMercatorUtils` neither checks the datum nor clamps the poles. Colombia's 9377 replaces 3116.
  Run in `tests/runtime/casos/arcgis-coordinates-projection.ts`.
- **0.1.0** (2026-05-31): Initial release.
