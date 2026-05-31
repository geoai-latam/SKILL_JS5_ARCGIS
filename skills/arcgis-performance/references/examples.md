# Examples: Performance

## Example 1: Code-split a heavy layer

**Use case:** only load `CSVLayer` when the user enables a data overlay.

```typescript
import type Map from "@arcgis/core/Map.js";

export async function addCsvLayer(map: Map, url: string) {
  const { default: CSVLayer } = await import("@arcgis/core/layers/CSVLayer.js");
  const layer = new CSVLayer({ url });
  map.add(layer);
  return layer;
}
```

**Notes:**

- The CSVLayer code lands in a separate chunk, shrinking the initial bundle.
- Great for optional/feature-flagged functionality.

---

## Example 2: Cluster dense points

**Use case:** 200k incident points that must stay smooth.

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({
  url: "https://example/FeatureServer/0",
  featureReduction: { type: "cluster", clusterRadius: 60 },
  definitionExpression: "status = 'open'",
});
```

**Notes:**

- Clustering aggregates points by screen radius; far fewer graphics to draw.
- `definitionExpression` fetches only the rows you actually need.

---

## Example 3: Deterministic teardown

**Use case:** an SPA that mounts/unmounts the map per route.

```typescript
import type MapView from "@arcgis/core/views/MapView.js";

interface Removable { remove(): void; }

export function makeTeardown(view: MapView, handles: Removable[]) {
  return () => {
    handles.forEach((h) => h.remove());
    view.destroy();
  };
}
```

**Notes:**

- Remove handles before `destroy()` so closures stop referencing view internals.
- Call the returned function in your framework's unmount/cleanup hook.
