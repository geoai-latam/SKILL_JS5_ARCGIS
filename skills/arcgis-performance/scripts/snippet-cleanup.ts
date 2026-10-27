// snippet-cleanup.ts — destroy views and remove handles to avoid leaks. Smoke-tested (SDK 5.1).
import type MapView from "@arcgis/core/views/MapView.js";

interface Removable {
  remove(): void;
}

// Track every handle, then tear everything down on teardown (e.g. SPA route change).
// view.destroy() also destroys view.map and its layers: detach the map first if another view will use it.
export function makeTeardown(view: MapView, handles: Removable[], keepMap = true) {
  return () => {
    for (const h of handles) h.remove();
    handles.length = 0;
    if (keepMap) view.map = null;
    view.destroy();
  };
}
