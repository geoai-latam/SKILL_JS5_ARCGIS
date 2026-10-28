# Examples: Parquet Layers

## Example 1: GeoParquet from a URL, inspected first

**Use case:** you do not know what the file carries; let the SDK tell you before building the layer.

```typescript
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";
import { getParquetLayerInfo } from "@arcgis/core/layers/support/parquetUtils.js";

const data = new ParquetFilesData({ urls: ["https://example.com/municipios.parquet"] });
const info = await getParquetLayerInfo(data); // reads the first file only
if (!info.geometryEncoding) {
  console.warn("No GeoParquet metadata or known x/y columns: declare the encoding, type and SR");
}
const layer = new ParquetLayer(info);
map.add(layer);
```

**Notes:**

- Measured on a GeoParquet file: `getParquetLayerInfo` returned `wkb`, `point` and `4326`.
- For columns with custom names it returned `geometryEncoding: null`: that is the signal to go to Example 4.

---

## Example 2: Esri's sample file as a portal item, with a renderer and a popup

**Use case:** a Parquet file uploaded to ArcGIS Online as an item.

```typescript
import Map from "@arcgis/core/Map.js";
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetPortalItemData from "@arcgis/core/layers/support/ParquetPortalItemData.js";

const wells = new ParquetLayer({
  data: new ParquetPortalItemData({ portalItem: { id: "6ab6f959c1684eb5a54db91644a89747" } }),
  title: "Kansas water wells",
  orderBy: [{ field: "DEPTH_OF_COMPLETED_WELL", order: "descending" }],
  renderer: {
    type: "simple",
    symbol: { type: "simple-marker", size: 3, color: [0, 97, 155, 0.4], outline: { width: 0 } },
    visualVariables: [{
      type: "color",
      field: "DEPTH_OF_COMPLETED_WELL",
      stops: [{ value: 0, color: "#50a7da" }, { value: 800, color: "#664015" }],
    }],
  },
  popupTemplate: {
    title: "{COUNTY} county well",
    content: [{ type: "fields", fieldInfos: [{ fieldName: "STATUS" }, { fieldName: "DEPTH_OF_COMPLETED_WELL", label: "Depth (ft)" }] }],
  },
});
viewElement.map = new Map({ basemap: "osm", layers: [wells] });
```

**Notes:**

- A public item loads without sign-in (measured); a private one needs a session (not measured).
- The item is the same 56 MB file as the URL `…/items/<id>/data`; both gave 310 702 rows.

---

## Example 3: WKB column without GeoParquet metadata

**Use case:** a file written with plain pyarrow or DuckDB, where `geom` holds WKB.

```typescript
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";
import GeometryEncodingWkb from "@arcgis/core/layers/support/GeometryEncodingWkb.js";

const parcels = new ParquetLayer({
  data: new ParquetFilesData({ urls: ["https://example.com/predios.parquet"] }),
  geometryEncoding: new GeometryEncodingWkb({ field: "geom" }),
  geometryType: "polygon", // must match the WKB: points declared as polygons come back with rings []
  spatialReference: { wkid: 4326 }, // without it every geometry is null
});
const { extent } = await parcels.queryExtent(); // fullExtent is null without metadata
await view.goTo(extent);
```

**Notes:**

- Measured: with the three properties, polygons came back with their 5-vertex rings.
- `fullExtent` stayed `null`; `queryExtent()` computed it.

---

## Example 4: Coordinate columns with custom names

**Use case:** a table of stations with `coord_x` / `coord_y` in degrees.

```typescript
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";
import GeometryEncodingLocation from "@arcgis/core/layers/support/GeometryEncodingLocation.js";

const stations = new ParquetLayer({
  data: new ParquetFilesData({ urls: ["https://example.com/estaciones.parquet"] }),
  geometryEncoding: new GeometryEncodingLocation({ xField: "coord_x", yField: "coord_y" }), // x = longitude
  geometryType: "point",
  spatialReference: { wkid: 4326 },
});
```

**Notes:**

- Measured: without `spatialReference` the geometries are `null` and the map shows only the basemap.
- Coordinates in a projected system (UTM, EPSG:9377) are rejected: `Only WGS84 and Web Mercator are supported`.
  Reproject when writing the file.

---

## Example 5: A file the user picks

**Use case:** drag-and-drop or `<input type="file">`, no server.

```typescript
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";

const input = document.querySelector<HTMLInputElement>("#parquet")!;
input.addEventListener("change", async () => {
  const file = input.files?.[0];
  if (!file) return;
  const layer = new ParquetLayer({
    data: new ParquetFilesData({ urls: [URL.createObjectURL(file)] }),
    title: file.name,
  });
  await layer.load(); // rejects on ZSTD or a projected CRS, with a readable message
  map.add(layer);
});
```

**Notes:**

- Measured: a GeoParquet passed as a `blob:` URL loaded and counted its 5 rows.

---

## Example 6: Counting, aggregating and paging

**Use case:** a dashboard over 310 702 rows, filtered by the layer's `definitionExpression`.

```typescript
const plugged = new ParquetLayer({
  data: new ParquetFilesData({ urls: ["https://jsapi.maps.arcgis.com/sharing/rest/content/items/6ab6f959c1684eb5a54db91644a89747/data"] }),
  definitionExpression: "STATUS = 'Plugged'", // values are case-sensitive
});

const q = plugged.createQuery(); // carries the definitionExpression
q.where = `(${q.where}) AND COUNTY = 'Sedgwick'`;
const count = await plugged.queryFeatureCount(q); // 14 703

const stats = plugged.createQuery();
stats.outStatistics = [{ statisticType: "avg", onStatisticField: "DEPTH_OF_COMPLETED_WELL", outStatisticFieldName: "avgDepth" }];
const { features } = await plugged.queryFeatures(stats); // one row, no 8000 cap involved
console.log(count, features[0].attributes.avgDepth);
```

**Notes:**

- Measured: `{ where: "COUNTY = 'Sedgwick'" }` passed as a plain object gave 73 538 (the whole county), not 14 703.
- To list rows, page in steps of `capabilities.query.maxRecordCount` (8000): see Pitfall 2 in `SKILL.md`.

---

## Example 7: A Parquet without geometry as a table

**Use case:** attributes to join or chart, no map symbols.

```typescript
const table = new ParquetLayer({ data: new ParquetFilesData({ urls: ["https://example.com/censo.parquet"] }) });
await table.load();
if (table.isTable) map.tables.add(table);
else map.add(table);
```

**Notes:**

- `isTable` is also `true` for a WKB or custom-x/y file loaded **without** `geometryEncoding`: if you expected
  geometry, that `true` is the bug (see `pitfalls.md`).
