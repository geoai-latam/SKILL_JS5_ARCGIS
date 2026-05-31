# API Reference: Geometry Operations

## Table of Contents

- [Operators API (5.0)](#operators-api-50)
- [geometryEngine (classic)](#geometryengine-classic)

---

## Operators API (5.0)

Each module under `@arcgis/core/geometry/operators/` exports `execute` and `executeMany`.

| Module | execute signature |
|---|---|
| `bufferOperator` | `execute(geometry, distance, { unit }) => Polygon` |
| `geodesicBufferOperator` | `execute(geometry, distance, { unit }) => Polygon` |
| `intersectionOperator` | `execute(geomA, geomB) => Geometry` |
| `unionOperator` | `execute(geometries) => Geometry` |
| `differenceOperator` | `execute(geomA, geomB) => Geometry` |

Import as a namespace: `import * as bufferOperator from ".../operators/bufferOperator.js"`.

---

## geometryEngine (classic)

`@arcgis/core/geometry/geometryEngine.js` — synchronous, broad.

| Method | Returns | Purpose |
|---|---|---|
| `contains(a, b)` / `within(a, b)` | `boolean` | Containment tests |
| `intersects(a, b)` / `crosses(a, b)` | `boolean` | Relationship tests |
| `geodesicBuffer(g, d, unit)` | `Polygon` | Geodesic buffer |
| `geodesicLength(g, unit)` / `geodesicArea(g, unit)` | `number` | Measurement |
| `simplify(g)` / `isSimple(g)` | `Geometry` / `boolean` | Validity |
| `union(geoms)` / `difference(a, b)` | `Geometry` | Overlay |
