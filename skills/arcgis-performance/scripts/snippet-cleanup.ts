// snippet-cleanup.ts — destroy views and remove handles to avoid leaks. Smoke-tested.
import type MapView from "@arcgis/core/views/MapView.js";

interface Removable {
  remove(): void;
}

// Track every handle, then tear everything down on teardown (e.g. SPA route change).
export function makeTeardown(view: MapView, handles: Removable[]) {
  return () => {
    for (const h of handles) h.remove();
    handles.length = 0;
    view.destroy();
  };
}
