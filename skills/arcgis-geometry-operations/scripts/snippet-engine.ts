// snippet-engine.ts — the classic synchronous geometryEngine. Smoke-tested.
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";
import type Polygon from "@arcgis/core/geometry/Polygon.js";
import type Point from "@arcgis/core/geometry/Point.js";

export function analyze(area: Polygon, candidate: Point) {
  const contains = geometryEngine.contains(area, candidate);
  const buffered = geometryEngine.geodesicBuffer(candidate, 500, "meters");
  return { contains, buffered };
}
