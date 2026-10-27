# Examples: Advanced Layers

## Example 1: WMS layer with a named sublayer

**Use case:** overlay a GeoServer WMS layer.

```typescript
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";

// Public demo server (CORS enabled); its layers: bluemarble, continents, country_bounds, cities.
const layer = new WMSLayer({
  url: "https://demo.mapserver.org/cgi-bin/wms",
  sublayers: [{ name: "cities" }],
});
map.add(layer);
```

**Notes:**

- WMS renders server-side images; you cannot query its features.
- Use the exact published `name`: a wrong one loads without error and draws nothing. GeoServer
  names usually carry the workspace (`topp:states`); MapServer's do not.

---

## Example 2: Toggle MapImageLayer sublayers

**Use case:** show/hide dynamic MapServer sublayers without re-fetching.

```typescript
import MapImageLayer from "@arcgis/core/layers/MapImageLayer.js";

const layer = new MapImageLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer",
  sublayers: [{ id: 2, visible: true }, { id: 1, visible: false }],
});
map.add(layer);
// later: toggle without re-creating
layer.findSublayerById(1)!.visible = true;
```

**Notes:**

- Mutating `sublayer.visible` re-renders only the dynamic image.
- Each sublayer can carry its own `renderer` / `definitionExpression`.

---

## Example 3: Browse a CatalogLayer

**Use case:** expose many datasets from a single catalog service.

```typescript
import CatalogLayer from "@arcgis/core/layers/CatalogLayer.js";

const layer = new CatalogLayer({ url: "https://services3.arcgis.com/TVDq0jswpjtt1Xia/arcgis/rest/services/PNW_Forest_Fuels_Inventory_Status/FeatureServer" });
await layer.load();
map.add(layer);

// Datasets in view are drawn by layer.dynamicGroupLayer (read-only, 10 at a time by default).
// To edit or restyle one, add it as its own layer from its footprint:
view.on("click", async (event) => {
  const hit = await view.hitTest(event, { include: [layer.footprintLayer] });
  const graphic = hit.results.find((r) => r.type === "graphic")?.graphic;
  if (graphic) map.add(await layer.createLayerFromFootprint(graphic));
});
```

**Notes:**

- Since 4.30. The URL is a FeatureServer: a MapServer is rejected.
- Checked against SDK 5.1.27: this service loads with `catalog-footprint` and `catalog-dynamic-group`.

---

## Example 4: WFS 2.0 and OGC API – Features

**Use case:** vector features from an open-data portal.

```typescript
import WFSLayer from "@arcgis/core/layers/WFSLayer.js";
import OGCFeatureLayer from "@arcgis/core/layers/OGCFeatureLayer.js";

const wfs = new WFSLayer({ url: "https://demo.mapserver.org/cgi-bin/wfs", name: "ms:cities" });
const lakes = new OGCFeatureLayer({ url: "https://demo.pygeoapi.io/master", collectionId: "lakes" });
map.addMany([wfs, lakes]);

console.log(await wfs.queryFeatureCount()); // WFSLayer queries on the layer
const lakesView = await view.whenLayerView(lakes);
console.log((await lakesView.queryFeatures()).features.length); // OGCFeatureLayer: on the layer view
```

**Notes:**

- `WFSLayer` needs WFS 2.0.0 with GeoJSON output; check `outputFormat` in the GetCapabilities.
- Both run against SDK 5.1.27 (12.686 cities; the lakes collection loads as polygons).
