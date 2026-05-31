// snippet-reactive.ts — reactiveUtils.watch to react to view state. Smoke-tested.
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import type MapView from "@arcgis/core/views/MapView.js";

export function trackZoom(view: MapView) {
  const handle = reactiveUtils.watch(
    () => view.zoom,
    (zoom) => console.log("zoom is now", zoom),
  );
  // Always remove handles when done to avoid leaks.
  return () => handle.remove();
}

// Wait until the view stops updating, then run once.
export async function whenIdle(view: MapView) {
  await reactiveUtils.whenOnce(() => !view.updating);
  console.log("view is idle");
}
