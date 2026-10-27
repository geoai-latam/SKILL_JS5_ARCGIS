# API Reference: Geometry Operations

Checked against the `@arcgis/core` 5.1.27 typings.

## Table of Contents

- [Operators](#operators)
- [Operators that need load()](#operators-that-need-load)
- [Migrating from geometryEngine](#migrating-from-geometryengine)

---

## Operators

Each module under `@arcgis/core/geometry/operators/` is imported as a namespace
(`import * as bufferOperator from ".../operators/bufferOperator.js"`). All are synchronous.

| Module | execute | Notes |
|---|---|---|
| `bufferOperator` | `execute(geom, distance, { unit }) → Polygon \| null` | Planar; throws on lon/lat with a linear unit |
| `geodesicBufferOperator` | `execute(geom, distance, { unit, curveType }) → Polygon \| null` | Needs `load()` |
| `intersectionOperator` | `execute(a, b) → Geometry \| null` | `null` when spatial references differ |
| `unionOperator` | `execute(a, b)` / `executeMany(geoms)` | |
| `differenceOperator` / `symmetricDifferenceOperator` | `execute(a, b)` | |
| `clipOperator` / `cutOperator` | `execute(geom, extent)` / `execute(geom, cutter)` | |
| `containsOperator`, `withinOperator`, `intersectsOperator`, `crossesOperator`, `touchesOperator`, `overlapsOperator`, `disjointOperator`, `equalsOperator` | `execute(a, b) → boolean` | |
| `relateOperator` | `execute(a, b, "DE-9IM") → boolean` | |
| `simplifyOperator` | `execute(geom)`, `isSimple(geom)` | |
| `areaOperator` / `lengthOperator` / `distanceOperator` | planar measures | |
| `convexHullOperator`, `centroidOperator`, `labelPointOperator`, `generalizeOperator`, `densifyOperator`, `offsetOperator` | | |

`bufferOperator.executeMany(geoms, distances, { union })`: one distance per geometry; with
`union: true` it returns one polygon.

---

## Operators that need load()

`geodesicBufferOperator`, `geodeticAreaOperator`, `geodeticLengthOperator`,
`geodeticDistanceOperator`, `geodeticDensifyOperator`, `geodesicProximityOperator`,
`geodeticUtilsOperator` (and `projectOperator` / `shapePreservingProjectOperator`, see
`arcgis-coordinates-projection`). Each exports
`load(): Promise<void>` and `isLoaded(): boolean`; `execute` throws before `load()` resolves.

---

## Migrating from geometryEngine

`@arcgis/core/geometry/geometryEngine.js` is deprecated since 4.32 (still works in 5.1, no runtime
warning).

| geometryEngine | Operator |
|---|---|
| `buffer(g, d, unit)` | `bufferOperator.execute(g, d, { unit })` |
| `geodesicBuffer(g, d, unit)` | `geodesicBufferOperator.execute(g, d, { unit })` |
| `contains(a, b)` / `within(a, b)` | `containsOperator.execute(a, b)` / `withinOperator.execute(a, b)` |
| `intersects(a, b)` / `crosses(a, b)` | `intersectsOperator.execute(a, b)` / `crossesOperator.execute(a, b)` |
| `intersect(a, b)` | `intersectionOperator.execute(a, b)` |
| `union(geoms)` | `unionOperator.executeMany(geoms)` |
| `difference(a, b)` | `differenceOperator.execute(a, b)` |
| `simplify(g)` / `isSimple(g)` | `simplifyOperator.execute(g)` / `simplifyOperator.isSimple(g)` |
| `planarArea(g, unit)` / `planarLength(g, unit)` | `areaOperator.execute(g, { unit })` / `lengthOperator.execute(g, { unit })` |
| `geodesicArea(g, unit)` / `geodesicLength(g, unit)` | `geodeticAreaOperator.execute(g, { unit })` / `geodeticLengthOperator.execute(g, { unit })` |
| `clip(g, extent)` | `clipOperator.execute(g, extent)` |
