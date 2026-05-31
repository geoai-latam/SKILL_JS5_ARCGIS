# Examples: Advanced Layers

## Example 1: WMS layer with a named sublayer

**Use case:** overlay a GeoServer WMS layer.

```typescript
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";

const layer = new WMSLayer({
  url: "https://example/geoserver/wms",
  sublayers: [{ name: "topp:states" }],
});
map.add(layer);
```

**Notes:**

- WMS renders server-side images; you cannot query its features.
- Use the exact published layer `name`.

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

const layer = new CatalogLayer({ url: "https://example/arcgis/rest/services/MyCatalog/MapServer" });
await layer.load();
console.log("catalog:", layer.title);
map.add(layer);
```

**Notes:**

- New in 5.0; great for data discovery UIs.
- `await layer.load()` before reading its contents.
