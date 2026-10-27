// snippet-hittest.ts — identify what the user clicked via view.hitTest (SDK 5.1). Smoke-tested.
import type MapView from "@arcgis/core/views/MapView.js";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import type { ClickEvent } from "@arcgis/core/views/input/types.js";

// The layer needs outFields for every attribute you read: a service hit only carries the object id.
export function wireClick(view: MapView, layer: FeatureLayer) {
  return view.on("click", async (event: ClickEvent) => {
    const { results } = await view.hitTest(event, { include: [layer] });
    const hit = results.find((r) => r.type === "graphic");
    if (hit?.type === "graphic") {
      console.log("hit", hit.graphic.attributes, "at", event.mapPoint?.longitude);
    }
  });
}
