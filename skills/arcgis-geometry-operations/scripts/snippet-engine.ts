// snippet-engine.ts: geometryEngine is deprecated since 4.32. This is the same analysis it used to do,
// written with operators (SDK 5.1). Smoke-tested.
import * as containsOperator from "@arcgis/core/geometry/operators/containsOperator.js";
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
import type Polygon from "@arcgis/core/geometry/Polygon.js";
import type Point from "@arcgis/core/geometry/Point.js";

export async function analyze(area: Polygon, candidate: Point) {
  await geodesicBufferOperator.load(); // geodesic operators throw before load()
  const contains = containsOperator.execute(area, candidate);
  const buffered = geodesicBufferOperator.execute(candidate, 500, { unit: "meters" });
  return { contains, buffered };
}
