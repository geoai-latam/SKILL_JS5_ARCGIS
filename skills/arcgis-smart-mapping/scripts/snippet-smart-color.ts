// snippet-smart-color.ts — generate a data-driven color renderer with Smart Mapping.
// Smoke-tested.
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import type MapView from "@arcgis/core/views/MapView.js";
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";

export async function applySmartColor(layer: FeatureLayer, view: MapView) {
  const { renderer } = await colorRendererCreator.createContinuousRenderer({
    layer,
    view,
    field: "POP",
  });
  layer.renderer = renderer;
  return renderer;
}
