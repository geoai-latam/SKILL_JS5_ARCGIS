// snippet-operators.ts: buffer + intersection with operators, for projected geometry (SDK 5.1).
// The planar bufferOperator throws on lon/lat input with a linear unit; use geodesicBufferOperator there.
import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator.js";
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";
import Point from "@arcgis/core/geometry/Point.js";

export function bufferAndIntersect(a: Point, b: Point) {
  const bufA = bufferOperator.execute(a, 1000, { unit: "meters" });
  const bufB = bufferOperator.execute(b, 1000, { unit: "meters" });
  if (!bufA || !bufB) return null;
  return intersectionOperator.execute(bufA, bufB); // null if the spatial references differ
}
