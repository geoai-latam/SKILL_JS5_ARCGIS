# Examples: Core Maps

## Example 1: 2D MapView (Core API)

**Use case:** a topographic map of Bogotá with programmatic control.

```typescript
import esriConfig from "@arcgis/core/config.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;

const map = new Map({ basemap: "arcgis/topographic" });
const view = new MapView({ container: "viewDiv", map, center: [-74.08, 4.6], zoom: 11 });
await view.when();
await view.goTo({ center: [-74.06, 4.65], zoom: 13 });
```

**Notes:**

- `await view.when()` guarantees the view is interactive before `goTo`.
- `center` is `[longitude, latitude]`, not `[lat, lon]`.

---

## Example 2: 3D SceneView with terrain

**Use case:** a tilted 3D imagery scene over elevation.

```typescript
import Map from "@arcgis/core/Map.js";
import SceneView from "@arcgis/core/views/SceneView.js";

const map = new Map({ basemap: "arcgis/imagery", ground: "world-elevation" });
const view = new SceneView({
  container: "viewDiv",
  map,
  camera: { position: { longitude: -74.08, latitude: 4.6, z: 8000 }, tilt: 65 },
});
```

**Notes:**

- `ground: "world-elevation"` is what makes terrain 3D.
- Use `camera`, not `center/zoom`, to express a 3D viewpoint.

---

## Example 3: Load a Webmap by item id (component)

**Use case:** render an existing ArcGIS Online webmap with one element.

```typescript
import "@arcgis/map-components/dist/components/arcgis-map";
// <arcgis-map item-id="<webmap-item-id>"></arcgis-map>
const el = document.querySelector("arcgis-map");
el?.addEventListener("arcgisViewReadyChange", (e) => {
  const { view } = (e as CustomEvent).detail;
  console.log("layers:", view.map.layers.length);
});
```

**Notes:**

- `item-id` pulls basemap, layers, and popups from the saved webmap.
- The view is only valid inside the `arcgisViewReadyChange` handler.
