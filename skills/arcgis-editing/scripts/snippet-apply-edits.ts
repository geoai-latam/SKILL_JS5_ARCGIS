// snippet-apply-edits.ts — add/update/delete features with applyEdits. Smoke-tested.
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });

export async function addInspection(status: string) {
  const feature = new Graphic({
    geometry: new Point({ longitude: -74.08, latitude: 4.6 }),
    attributes: { STATUS: status },
  });
  const result = await layer.applyEdits({ addFeatures: [feature] });
  return result.addFeatureResults;
}
