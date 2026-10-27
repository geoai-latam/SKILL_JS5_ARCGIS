# Examples: Geometry Operations

Every example is measured in `tests/runtime/casos/arcgis-geometry-operations.ts` (SDK 5.1.27).

## Example 1: Overlap of two 1 km buffers (lon/lat)

**Use case:** find where two service areas overlap.

```typescript
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";
import Point from "@arcgis/core/geometry/Point.js";

await geodesicBufferOperator.load();
const a = geodesicBufferOperator.execute(new Point({ longitude: -74.08, latitude: 4.6 }), 1000, { unit: "meters" });
const b = geodesicBufferOperator.execute(new Point({ longitude: -74.07, latitude: 4.6 }), 1000, { unit: "meters" });
const overlap = a && b ? intersectionOperator.execute(a, b) : null;
```

**Notes:**

- Use the planar `bufferOperator` only on projected geometry: on lon/lat with meters it throws.
- `execute` may return `null`: guard it.

---

## Example 2: Relationship test

**Use case:** is a clicked point inside an area?

```typescript
import * as containsOperator from "@arcgis/core/geometry/operators/containsOperator.js";
import type Polygon from "@arcgis/core/geometry/Polygon.js";
import type Point from "@arcgis/core/geometry/Point.js";

declare const areaPolygon: Polygon;
declare const clickedPoint: Point;
const inside = containsOperator.execute(areaPolygon, clickedPoint);
```

**Notes:**

- Both geometries must share a spatial reference.
- Replaces the deprecated `geometryEngine.contains`.

---

## Example 3: Geodesic measurement

**Use case:** measure a route's true length.

```typescript
import * as geodeticLengthOperator from "@arcgis/core/geometry/operators/geodeticLengthOperator.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";

await geodeticLengthOperator.load();
const route = new Polyline({ paths: [[[-74.08, 4.6], [-75.57, 6.25]]], spatialReference: { wkid: 4326 } });
const km = geodeticLengthOperator.execute(route, { unit: "kilometers" }); // 246.1 (Bogotá → Medellín)
```

**Notes:**

- The geodetic operators need `load()`.
- Replaces the deprecated `geometryEngine.geodesicLength`.
