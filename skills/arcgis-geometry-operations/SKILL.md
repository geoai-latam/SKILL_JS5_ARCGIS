---
name: arcgis-geometry-operations
description: >
  Perform client-side geometry operations with the ArcGIS Maps SDK for JavaScript
  5.1 geometry operators (bufferOperator, geodesicBufferOperator, intersectionOperator,
  unionOperator, containsOperator, simplifyOperator, geodeticAreaOperator, ...):
  which ones need load(), planar vs geodesic, and migrating off geometryEngine
  (deprecated since 4.32). Use this skill whenever the user buffers, intersects,
  unions, measures, or tests spatial relationships between geometries.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: spatial
tags:
  - geometryengine
  - operators
  - buffer
  - intersect
  - measurement
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Geometry Operations

> **When to use:** Activate this skill whenever the user buffers, intersects, unions, measures, or
> tests spatial relationships between geometries on the client.

## Overview

The SDK computes geometry locally (buffers, overlays, relationships, measurements) without a service.

- **Problem it solves:** spatial math (buffer/overlay/relate/measure) in the browser.
- **Who it serves:** developers building analysis and selection tools.
- **Pattern it teaches:** one operator module per operation; geodesic operators for lon/lat.
- **What it does NOT cover:** server geoprocessing (see `arcgis-spatial-analysis`) or projection (`arcgis-coordinates-projection`).

## Quick Start

```typescript
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
import Point from "@arcgis/core/geometry/Point.js";

await geodesicBufferOperator.load(); // geodesic/geodetic operators throw without it
const bogota = new Point({ longitude: -74.08, latitude: 4.6 });
const ring = geodesicBufferOperator.execute(bogota, 1000, { unit: "meters" });
```

Measured with 5.1.27: the ring's geodetic area is 3.138 km² (a 1 km circle is 3.142). The planar
`bufferOperator` on this same lon/lat point **throws** "Unable to convert from a linear unit to an
angular unit".

## Decision Tree

1. **Geometry in lon/lat (wkid 4326) and a distance in meters?**
   - Yes → `geodesicBufferOperator`, `geodeticLengthOperator`, `geodeticAreaOperator`,
     `geodeticDistanceOperator`, each after `await op.load()`.

2. **Geometry in a projected system (Web Mercator, MAGNA-SIRGAS 9377, UTM)?**
   - Small area near the projection's center → planar `bufferOperator`, `areaOperator`,
     `lengthOperator` (no `load()`).
   - Large area or high latitude in Web Mercator → still geodesic (planar is 4× off at 60°N).

3. **Relationship test?**
   - `containsOperator`, `withinOperator`, `intersectsOperator`, `crossesOperator`,
     `touchesOperator`, `disjointOperator`, `equalsOperator`, `relateOperator`.

4. **Old code with `geometryEngine.*`?**
   - Replace it: every method has an operator, and `geometryEngine` is deprecated since 4.32.

**Default:** operators only; geodesic ones for anything in lon/lat.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";
```

### Dynamic Imports (CDN)

```javascript
const intersectionOperator = await $arcgis.import("@arcgis/core/geometry/operators/intersectionOperator.js");
```

### Map Components (recommended for new projects)

```typescript
// Operate on geometries you read from the component's view (hitTest, sketch, query).
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: One module per operation

Each operator (`@arcgis/core/geometry/operators/*`, available since 4.31) exports `execute` and,
for most, `executeMany`. Results can be `null`: always guard them. The geodesic and geodetic ones
(`geodesicBuffer`, `geodeticArea`, `geodeticLength`, `geodeticDistance`, `geodeticDensify`,
`geodesicProximity`) need `await op.load()` first; without it, measured, `execute` throws
"m is not a function" and `isLoaded()` is `false`.

### Concept 2: geometryEngine is deprecated

`geometryEngine` still works in 5.1.27 (measured: `contains` returns `true` like
`containsOperator`) and logs no runtime warning, but its typings mark it deprecated since 4.32. The
map: `contains` → `containsOperator`, `simplify` → `simplifyOperator`, `geodesicBuffer` →
`geodesicBufferOperator`, `geodesicLength` → `geodeticLengthOperator`, `geodesicArea` →
`geodeticAreaOperator`, `union` → `unionOperator.executeMany`, `clip` → `clipOperator`.

### Concept 3: Planar vs geodesic

Planar math uses the coordinates as they are. In lon/lat it refuses meters (it throws). In Web
Mercator it uses projected meters, which grow with latitude: measured, a planar 1000 m buffer covers
3.099 km² in Bogotá (1.4 % short) and 0.787 km² at 60°N (75 % short).

## Common Pitfalls (Top 3)

### Pitfall 1: Planar buffer on lon/lat

```typescript
// ❌ Anti-pattern
bufferOperator.execute(latLonPoint, 1000, { unit: "meters" });
```

```typescript
// ✅ Correct
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
await geodesicBufferOperator.load();
geodesicBufferOperator.execute(latLonPoint, 1000, { unit: "meters" });
```

**Impact:** measured: it does not distort; it throws "Unable to convert from a linear unit to an
angular unit". Forgetting `load()` in the correct version also throws.

### Pitfall 2: Measuring self-intersecting geometry

```typescript
// ❌ Anti-pattern
areaOperator.execute(bowtie); // a figure-eight ring
```

```typescript
// ✅ Correct
const clean = simplifyOperator.isSimple(bowtie) ? bowtie : simplifyOperator.execute(bowtie);
areaOperator.execute(clean as Polygon);
```

**Impact:** measured on a 10×10 bowtie: the area of the raw ring is **0** (the two lobes cancel);
after `simplifyOperator` it is 2 rings and 50. The intersection with a box gave 50 either way.

### Pitfall 3: Expecting executeMany to keep the UI responsive

```typescript
// ❌ Anti-pattern
const buffers = bufferOperator.executeMany(bigGeoms, distances, { union: true }); // "it's batched"
```

```typescript
// ✅ Correct
// Both execute and executeMany are synchronous. For heavy work, run it in a Web Worker,
// or split it in chunks between frames.
```

**Impact:** measured with 5,000 points: a loop of `execute` took 150 ms and `executeMany` 113 ms,
both blocking the main thread; with `union: true` it took 2.9 s.

## When to Read references/

| If you need... | Read |
|---|---|
| Operator + geometryEngine signatures | `references/api-detail.md` |
| Buffer / overlay / relate examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-coordinates-projection` — project before planar math
- `arcgis-spatial-analysis` — server-side geoprocessing
- `arcgis-interaction` — get geometries from sketch/hitTest

## Reference Samples

- [Geometry operators](https://developers.arcgis.com/javascript/latest/sample-code/geometry-operator-worker/)
- [geometryEngine](https://developers.arcgis.com/javascript/latest/sample-code/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. The Quick Start threw on the most common input: a planar `bufferOperator` on a
  lon/lat point with meters throws "Unable to convert from a linear unit to an angular unit" (it does not "distort").
  The geodesic fix also needs `load()` (it throws without it). `geometryEngine`, presented as the fallback, is
  deprecated since 4.32: now operators only, with the migration map. Operators are from 4.31, not "new in 5.0".
  Measured: Web Mercator planar error by latitude, bowtie area 0, `executeMany` is synchronous too, mixed spatial
  references give `null`. Run in `tests/runtime/casos/arcgis-geometry-operations.ts`.
- **0.1.0** (2026-05-31): Initial release.
