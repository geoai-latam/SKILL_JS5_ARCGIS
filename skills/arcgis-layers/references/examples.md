# Examples: Layers

## Example 1: FeatureLayer query with pagination

**Use case:** the ten most populous cities, sorted.

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({ url: "https://.../Cities/FeatureServer/0", outFields: ["NAME", "POP"] });
const query = layer.createQuery();
query.where = "POP > 1000000";
query.orderByFields = ["POP DESC"];
query.returnGeometry = true;
query.num = 10;
const { features } = await layer.queryFeatures(query);
```

**Notes:**

- `num`/`start` page the results; combine with `orderByFields` for stable paging.
- `returnGeometry = true` is required to zoom to or highlight results.

---

## Example 2: GeoJSONLayer with a popup

**Use case:** display live earthquakes from a GeoJSON feed.

```typescript
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";

const layer = new GeoJSONLayer({
  url: "https://example.com/earthquakes.geojson",
  popupTemplate: { title: "{place}", content: "Magnitude {mag}" },
});
map.add(layer);
```

**Notes:**

- Field names in the popup come straight from the GeoJSON properties.
- The layer infers geometry type from the feed.

---

## Example 3: GraphicsLayer with a client graphic

**Use case:** drop a marker the user clicked.

```typescript
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";

const layer = new GraphicsLayer();
layer.add(new Graphic({
  geometry: new Point({ longitude: -74.08, latitude: 4.6 }),
  symbol: new SimpleMarkerSymbol({ color: "red", size: 10 }),
}));
```

**Notes:**

- `GraphicsLayer` is client-side; no service required.
- Use it for sketches, highlights, and temporary markers.
