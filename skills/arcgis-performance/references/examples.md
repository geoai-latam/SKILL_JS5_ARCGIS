# Examples: Performance

## Example 1: Route teardown that keeps the map

**Use case:** an SPA that mounts a view per route over one shared map.

```typescript
import type MapView from "@arcgis/core/views/MapView.js";

interface Removable { remove(): void; }

export function makeTeardown(view: MapView, handles: Removable[], keepMap = true) {
  return () => {
    handles.forEach((h) => h.remove());
    handles.length = 0;
    if (keepMap) view.map = null; // otherwise destroy() takes the map and its layers
    view.destroy();
  };
}
```

**Notes:**

- Call the returned function in your framework's unmount hook.
- With `keepMap = false` the map and every layer are destroyed too (measured).

---

## Example 2: Recompute only when the view settles

**Use case:** refresh a side panel with what is in view.

```typescript
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";

const handle = reactiveUtils.when(
  () => view.stationary && view.extent,
  (extent) => refreshPanel(extent),
);
// handle.remove() on teardown
```

**Notes:**

- Fires once per pan or zoom, not once per frame (1 vs 92 measured on a `goTo`).

---

## Example 3: Detail layer only when zoomed in, clustered points

**Use case:** parcels at street level, dense incidents everywhere.

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const parcels = new FeatureLayer({ url: parcelsUrl, minScale: 50000 });
const incidents = new FeatureLayer({
  url: incidentsUrl,
  featureReduction: { type: "cluster", clusterRadius: 60 },
  definitionExpression: "status = 'open'",
});
```

**Notes:**

- Outside `minScale` the parcels layer view is suspended and requests nothing (measured).
- Toggle with `layer.visible` instead of re-adding layers.
