# Examples: Geometry Operations

## Example 1: Buffer + intersection (operators)

**Use case:** find where two 1 km buffers overlap.

```typescript
import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator.js";
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";

const a = bufferOperator.execute(pointA, 1000, { unit: "meters" });
const b = bufferOperator.execute(pointB, 1000, { unit: "meters" });
const overlap = a && b ? intersectionOperator.execute(a, b) : null;
```

**Notes:**

- Operators are tree-shakeable and worker-friendly.
- `execute` may return null/undefined — guard it.

---

## Example 2: Relationship test (geometryEngine)

**Use case:** is a clicked point inside an area?

```typescript
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";

const inside = geometryEngine.contains(areaPolygon, clickedPoint);
```

**Notes:**

- `geometryEngine` is synchronous — fine for small inputs.
- It covers tests not yet exposed as operators.

---

## Example 3: Geodesic measurement

**Use case:** measure a route's true length.

```typescript
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";

const km = geometryEngine.geodesicLength(routePolyline, "kilometers");
```

**Notes:**

- Use geodesic length/area for geographic coordinates.
- Planar measures distort over large extents.
