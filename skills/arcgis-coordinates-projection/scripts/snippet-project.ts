// snippet-project.ts — reproject geometry with projectOperator (SDK 5.1). Smoke-tested.
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import type Point from "@arcgis/core/geometry/Point.js";

export async function toWebMercator(geometry: Point) {
  if (!projectOperator.isLoaded()) await projectOperator.load(); // load the engine once
  return projectOperator.execute(geometry, new SpatialReference({ wkid: 3857 }));
}
