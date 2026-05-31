// snippet-hittest.ts — identify what the user clicked via view.hitTest. Smoke-tested.
import type MapView from "@arcgis/core/views/MapView.js";

interface ViewClickEvent {
  x: number;
  y: number;
  mapPoint: { longitude: number; latitude: number } | null;
}

export function wireClick(view: MapView) {
  return view.on("click", async (event: ViewClickEvent) => {
    const response = await view.hitTest(event);
    if (response.results.length > 0) {
      console.log("hits:", response.results.length, "at", event.mapPoint?.longitude);
    }
  });
}
