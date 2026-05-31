# Examples: Coordinates & Projection

## Example 1: Fast web-mercator conversion

**Use case:** convert a WGS84 point to web mercator.

```typescript
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import Point from "@arcgis/core/geometry/Point.js";

const wm = webMercatorUtils.geographicToWebMercator(new Point({ longitude: -74.08, latitude: 4.6 }));
```

**Notes:**

- Synchronous; no engine load.
- Only for the 4326 ↔ 3857 pair.

---

## Example 2: General reprojection

**Use case:** reproject to a national grid (e.g. wkid 3116).

```typescript
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";

await projectOperator.load();
const projected = projectOperator.execute(geom, new SpatialReference({ wkid: 3116 }));
```

**Notes:**

- `await load()` once before any `execute`.
- Works for arbitrary coordinate systems.

---

## Example 3: Align before comparison

**Use case:** ensure two geometries share an SR before overlay.

```typescript
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";

await projectOperator.load();
const aligned = projectOperator.execute(geomA, geomB.spatialReference);
```

**Notes:**

- Project one geometry to the other's SR.
- Then run geometry operations safely.
