// snippet-project.ts — reproject geometry with the 5.0 projectOperator. Smoke-tested.
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import type Point from "@arcgis/core/geometry/Point.js";

export async function toWebMercator(geometry: Point) {
  await projectOperator.load(); // load the projection engine once
  return projectOperator.execute(geometry, new SpatialReference({ wkid: 3857 }));
}
