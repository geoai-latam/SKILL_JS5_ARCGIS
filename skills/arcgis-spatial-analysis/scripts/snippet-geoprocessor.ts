// snippet-geoprocessor.ts — run a geoprocessing service task. Smoke-tested.
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";

export async function runViewshed(gpUrl: string, observerJson: unknown) {
  const result = (await geoprocessor.execute(gpUrl, {
    Input_Observation_Point: observerJson,
    Viewshed_Distance: 5000,
  })) as { results: Array<{ paramName: string; value: unknown }> };
  return result.results;
}
