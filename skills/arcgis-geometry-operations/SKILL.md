---
name: arcgis-geometry-operations
description: >
  Perform client-side geometry operations with the ArcGIS Maps SDK for JavaScript
  5.0: the new per-operation operators API (bufferOperator, intersectionOperator,
  unionOperator, ...) and the classic synchronous geometryEngine (contains,
  intersects, geodesicBuffer, simplify). Use this skill whenever the user buffers,
  intersects, unions, measures, or tests spatial relationships between geometries.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Geometry Operations

> **When to use:** Activate this skill whenever the user buffers, intersects, unions, measures, or
> tests spatial relationships between geometries on the client.

## Overview

The SDK computes geometry locally — buffers, overlays, relationships, and measurements — without a service.

- **Problem it solves:** spatial math (buffer/overlay/relate/measure) in the browser.
- **Who it serves:** developers building analysis and selection tools.
- **Pattern it teaches:** prefer the 5.0 operators API; fall back to geometryEngine for breadth.
- **What it does NOT cover:** server geoprocessing (see `arcgis-spatial-analysis`) or projection (`arcgis-coordinates-projection`).

## Quick Start

```typescript
import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator.js";
const ring = bufferOperator.execute(point, 1000, { unit: "meters" });
```

## Decision Tree

1. **Single, well-defined operation (buffer/intersection/union/...)?**
   - Yes → the matching operator module (`bufferOperator`, `intersectionOperator`, ...).

2. **Need many operations or a relationship test not yet an operator?**
   - Yes → `geometryEngine` (sync) methods like `contains`, `within`, `crosses`.

3. **Geodesic (large areas / lat-lon)?**
   - Yes → use geodesic variants (`geodesicBuffer`, `geodesicBufferOperator`).

**Default:** operators for new code; geometryEngine where an operator doesn't exist.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";
```

### Dynamic Imports (CDN)

```javascript
const geometryEngine = await $arcgis.import("@arcgis/core/geometry/geometryEngine.js");
```

### Map Components (recommended for new projects)

```typescript
// Operate on geometries you read from the component's view (hitTest, sketch, query).
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: Operators API (new in 5.0)

Each operation is its own module exporting `execute` (single) and `executeMany` (batch), e.g.
`bufferOperator.execute(geometry, distance, { unit })`. Tree-shakeable and worker-friendly.

### Concept 2: geometryEngine (classic, synchronous)

`geometryEngine` exposes many operations and relationship tests in one module: `contains`,
`intersects`, `simplify`, `geodesicBuffer`, `geodesicLength`, `union`.

### Concept 3: Planar vs geodesic

Planar math is fine within a projected zone; for large extents or geographic coordinates use the
geodesic variants to avoid distance/area distortion.

## Common Pitfalls (Top 3)

### Pitfall 1: Planar buffer on geographic coordinates

```typescript
// ❌ Anti-pattern
bufferOperator.execute(latLonPoint, 1000, { unit: "meters" }); // distorted over large areas
```

```typescript
// ✅ Correct
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
geodesicBufferOperator.execute(latLonPoint, 1000, { unit: "meters" });
```

**Impact:** wrong buffer size/shape away from the equator.

### Pitfall 2: Operating on invalid/self-intersecting geometry

```typescript
// ❌ Anti-pattern
intersectionOperator.execute(messyPolygon, other); // may return wrong result
```

```typescript
// ✅ Correct
const clean = geometryEngine.simplify(messyPolygon);
intersectionOperator.execute(clean, other);
```

**Impact:** incorrect overlay results from non-simple geometry.

### Pitfall 3: Blocking the UI with huge batch ops

```typescript
// ❌ Anti-pattern
bigGeoms.forEach((g) => bufferOperator.execute(g, 100)); // sync on main thread
```

```typescript
// ✅ Correct
const buffers = bufferOperator.executeMany(bigGeoms, distances); // batched
```

**Impact:** frame drops when buffering thousands of geometries one by one.

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
- [geometryEngine](https://developers.arcgis.com/javascript/latest/sample-code/geometryengine-buffer/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
