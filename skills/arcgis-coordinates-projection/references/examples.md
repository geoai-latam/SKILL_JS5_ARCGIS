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

**Use case:** reproject to Colombia's official plane system (MAGNA-SIRGAS / Origen-Nacional, 9377).

```typescript
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";

if (!projectOperator.isLoaded()) await projectOperator.load();
const projected = projectOperator.execute(geom, new SpatialReference({ wkid: 9377 }));
```

**Notes:**

- Measured with 5.1.27: Plaza de Bolívar (-74.0761, 4.5981) → 4880680.62, 2066175.14 in 9377 (and
  1000156.23, 1000210.06 in the old 3116 "Bogota zone", whose origin is right there).
- Since 2020 official cartography in Colombia goes in 9377; 3116 and the other zones are legacy.

---

## Example 3: Align before comparison

**Use case:** ensure two geometries share an SR before overlay.

```typescript
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";

if (!projectOperator.isLoaded()) await projectOperator.load();
const aligned = projectOperator.execute(geomA, geomB.spatialReference);
```

**Notes:**

- Project one geometry to the other's SR.
- Then run geometry operations safely.

---

## Example 4: Choosing the datum transformation

**Use case:** bring old Colombian data in Bogotá 1975 (4218) to WGS84.

```typescript
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import * as geographicTransformationUtils from "@arcgis/core/geometry/operators/support/geographicTransformationUtils.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import Extent from "@arcgis/core/geometry/Extent.js";

await Promise.all([projectOperator.load(), geographicTransformationUtils.load()]);
const inSR = new SpatialReference({ wkid: 4218 });
const aoi = new Extent({ xmin: -79, ymin: -4.3, xmax: -66.8, ymax: 12.5, spatialReference: SpatialReference.WGS84 });
const candidatas = geographicTransformationUtils.getTransformations(inSR, SpatialReference.WGS84, aoi);
const elegida = candidatas[0]; // check its steps' wkid against your data's documentation
const wgs84 = projectOperator.execute(geom, SpatialReference.WGS84, { geographicTransformation: elegida });
```

**Notes:**

- Measured: 27 candidates, up to 22.3 m apart in Bogotá. The default (`getTransformation`) is
  wkid 1125 with or without this AOI.
- Only equation-based transformations are supported; grid-based ones are not.
