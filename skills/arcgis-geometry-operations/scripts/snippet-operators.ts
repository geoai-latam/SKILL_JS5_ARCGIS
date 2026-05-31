// snippet-operators.ts — the new 5.0 operators API (buffer + intersection). Smoke-tested.
import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator.js";
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";
import Point from "@arcgis/core/geometry/Point.js";

export function bufferAndIntersect(a: Point, b: Point) {
  const bufA = bufferOperator.execute(a, 1000, { unit: "meters" });
  const bufB = bufferOperator.execute(b, 1000, { unit: "meters" });
  if (!bufA || !bufB) return null;
  return intersectionOperator.execute(bufA, bufB);
}
