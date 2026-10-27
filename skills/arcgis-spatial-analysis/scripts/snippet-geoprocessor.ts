// snippet-geoprocessor.ts — run a synchronous geoprocessing task. Smoke-tested (SDK 5.1).
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";
import LinearUnit from "@arcgis/core/rest/support/LinearUnit.js";
import type Graphic from "@arcgis/core/Graphic.js";

export async function runViewshed(gpUrl: string, observer: Graphic, km = 5) {
  const result = (await geoprocessor.execute(gpUrl, {
    Input_Observation_Point: new FeatureSet({ features: [observer] }), // a bare Graphic fails
    Viewshed_Distance: new LinearUnit({ distance: km, units: "kilometers" }), // a bare number fails
  })) as { results: Array<{ paramName: string; value: FeatureSet }> };
  return result.results.find((p) => p.paramName === "Viewshed_Result")?.value ?? null;
}
