// snippet-smart-color.ts — generate a data-driven color renderer with Smart Mapping.
// Smoke-tested (SDK 5.1).
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import type MapView from "@arcgis/core/views/MapView.js";
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";

export async function applySmartColor(layer: FeatureLayer, view: MapView, field = "POP") {
  await layer.load();
  const tipo = layer.fieldsIndex.get(field)?.type;
  if (tipo === "string") throw new Error(`${field} is text: use smartMapping/renderers/type.js`); // no error otherwise
  const { renderer } = await colorRendererCreator.createClassBreaksRenderer({
    layer,
    view,
    field,
    classificationMethod: "quantile", // equal-interval by default
  });
  layer.renderer = renderer; // the creator does not assign it
  return renderer;
}
