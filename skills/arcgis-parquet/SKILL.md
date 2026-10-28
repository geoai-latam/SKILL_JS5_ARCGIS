---
name: arcgis-parquet
description: >
  Load Parquet and GeoParquet files on a map with ParquetLayer in the ArcGIS Maps SDK
  for JavaScript 5.1 (beta): data with ParquetFilesData (several files) or
  ParquetPortalItemData, geometryEncoding for GeoParquet, WKB or x/y columns, and the
  spatialReference and geometryType a file without GeoParquet metadata needs (without
  them nothing draws and nothing errors). Covers the silent 8000-row query cap, the
  host requirements (HEAD, Range, CORS) and what the layer cannot do (edit, 3D).
  Use this skill whenever the user loads a .parquet or GeoParquet file.
lang: en
version: 0.1.0
status: beta
sdk_version: ">=5.1 <6.0"
created: 2026-10-28
updated: 2026-10-28
category: layers
tags:
  - parquet
  - geoparquet
  - parquetlayer
  - wkb
  - big-data
requires:
  - arcgis-core-maps
  - arcgis-layers
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Parquet Layers

> **When to use:** Activate this skill whenever the user puts a `.parquet` or GeoParquet file on a map,
> queries one, or asks why a Parquet layer loads but shows nothing.

## Overview

`ParquetLayer` reads Apache Parquet files in the browser (with a WebAssembly reader) and draws their
rows as features in a 2D view. It is **beta** since 4.33; 4.34 added `geometryEncoding`, `isTable`,
`queryFeatures` and `queryObjectIds`, and 5.1 replaced `urls` with `data` and added portal items,
`definitionExpression` and `createQuery()`.

- **Problem it solves:** showing hundreds of thousands of rows from a columnar file without a feature service.
- **Who it serves:** developers with columnar data exported from DuckDB, GeoPandas, BigQuery or ArcGIS.
- **Pattern it teaches:** pick the encoding from what the file carries, declare what it does not, and check the host.
- **What it does NOT cover:** querying in general (see `arcgis-layers`) or renderers (see `arcgis-visualization`).

## Quick Start

```typescript
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";

// GeoParquet (with "geo" metadata) or columns named lon/lat, lng/lat, x/y…: detected on load.
const layer = new ParquetLayer({
  data: new ParquetFilesData({
    urls: ["https://jsapi.maps.arcgis.com/sharing/rest/content/items/6ab6f959c1684eb5a54db91644a89747/data"],
  }),
  title: "Kansas water wells",
});
map.add(layer);
await layer.load();
console.log(layer.isTable, layer.geometryType, layer.geometryEncoding?.type); // false "point" "location"
```

Measured with 5.1.27 on Esri's sample file (310 702 rows, 56 MB): it loads without sign-in, detects its
`lng`/`lat` columns and draws all 310 702 points in a `MapView`.

## Decision Tree

1. **What does the file carry?**
   - GeoParquet `geo` metadata → nothing to declare: encoding, `geometryType`, SR and `fullExtent` are read.
   - Coordinate columns named `lon/lat`, `lng/lat`, `long/lat`, `longitude/latitude`, `x/y`, `xcenter/ycenter`,
     `point-x/point-y`… (any case) → detected.
   - Coordinate columns with other names (`coord_x`, `este`…) → `GeometryEncodingLocation` **plus**
     `geometryType: "point"` **plus** `spatialReference`.
   - A WKB column without `geo` metadata → `GeometryEncodingWkb({ field })` **plus** `geometryType` **plus**
     `spatialReference`.
   - No geometry at all → it loads as a table (`isTable: true`); use it in `map.tables` or a feature table.

2. **Where is the file?**
   - URLs you control → `ParquetFilesData({ urls })`; several files with the **same schema** add up.
   - An ArcGIS Online item of type Apache Parquet → `ParquetPortalItemData({ portalItem: { id } })`.
   - A file the user picks → `URL.createObjectURL(file)` as the URL (measured: it works).

3. **Which view?** `MapView` / `<arcgis-map>` only. In a `SceneView` the layer view is rejected.

**Default:** `ParquetFilesData` with GeoParquet in EPSG:4326, Snappy or GZIP.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";
import ParquetPortalItemData from "@arcgis/core/layers/support/ParquetPortalItemData.js";
import GeometryEncodingWkb from "@arcgis/core/layers/support/GeometryEncodingWkb.js";
import GeometryEncodingLocation from "@arcgis/core/layers/support/GeometryEncodingLocation.js";
import { getParquetLayerInfo } from "@arcgis/core/layers/support/parquetUtils.js";
```

The class the docs call `ParquetGeometryEncodingWkb` does not exist as a module: it is `GeometryEncodingWkb`.

### Dynamic Imports (CDN)

```javascript
const [ParquetLayer, ParquetFilesData] = await $arcgis.import([
  "@arcgis/core/layers/ParquetLayer.js",
  "@arcgis/core/layers/support/ParquetFilesData.js",
]);
```

### Map Components (recommended for new projects)

```typescript
// The layer is Core API; add it to the component's map. 2D only: <arcgis-map>, not <arcgis-scene>.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: `data` replaced `urls` in 5.1

`data` takes a `ParquetFilesData` (one or more URLs) or a `ParquetPortalItemData`. The old `urls` still works but
is `@deprecated` since 5.1 and logs a warning. Several files are read as one layer; the fields come from the
**first** file, so they must share a schema (see pitfalls). `getParquetLayerInfo(data)` returns the fields,
encoding, geometry type and SR it infers from the first file, ready to pass to `new ParquetLayer(info)`.

### Concept 2: `geometryEncoding` and the two properties that go with it

With GeoParquet metadata everything is detected. Without it, `geometryEncoding` alone is not enough:

| Declared | Measured result (5.1.27) |
|---|---|
| nothing (WKB or custom x/y) | loads as a table, `isTable: true`, no error |
| encoding only, polygons | `geometryType` stays `"point"`, geometry `null` |
| encoding + `geometryType`, no `spatialReference` | geometry `null`, the view draws nothing, no error |
| encoding + `geometryType` + `spatialReference` | correct |

`layer.spatialReference` reads `4326` by default even when it was not set, so checking it proves nothing: set it.
Only WGS84 and Web Mercator are supported; a projected file (EPSG:9377, UTM) is rejected on `load()`.

### Concept 3: Queries run in the client, with a cap

`queryFeatures`, `queryFeatureCount`, `queryObjectIds`, `queryExtent`, `orderByFields` and `outStatistics` work
(measured). Two behaviors differ from a feature service: a query returns at most **8000** rows
(`capabilities.query.maxRecordCount`) with `exceededTransferLimit: false`, and attribute values in `where` are
**case-sensitive** (`'constructed'` gave 0 of 244 149; `UPPER(STATUS) = 'CONSTRUCTED'` works).

### Concept 4: The host must answer HEAD and Range, with CORS

The reader asks `HEAD` for the size and then reads 64 KB pieces with `Range` (`206`). A host without CORS, one
that ignores `Range` (answers `200` with the whole file), one that refuses `HEAD`, and a 404 all reject `load()`
with the same message: `Failed to parse file`. An ArcGIS Online item's `/data` URL and Vite's dev server qualify
(measured); check any other host before blaming the file. Compression must be none, Snappy or GZIP (ZSTD is rejected).

### Concept 5: What the layer does not do

- **No editing:** no `applyEdits`, `capabilities.operations.supportsEditing` is `false`.
- **No 3D:** `SceneView.whenLayerView()` rejects with "layerview creation failed".
- **Beta:** `ParquetLayer`, `ParquetFilesData`, `ParquetPortalItemData` and `GeometryEncodingWkb` are `@beta`;
  pin the SDK version and re-test on upgrades.

## Common Pitfalls (Top 3)

### Pitfall 1: Declaring the encoding but not the spatial reference

```typescript
// ❌ Anti-pattern
const layer = new ParquetLayer({
  data: new ParquetFilesData({ urls: ["https://example.com/stations.parquet"] }),
  geometryEncoding: new GeometryEncodingLocation({ xField: "coord_x", yField: "coord_y" }),
  geometryType: "point", // no spatialReference: "it defaults to WGS84"
});
```

```typescript
// ✅ Correct
const layer = new ParquetLayer({
  data: new ParquetFilesData({ urls: ["https://example.com/stations.parquet"] }),
  geometryEncoding: new GeometryEncodingLocation({ xField: "coord_x", yField: "coord_y" }), // x = longitude
  geometryType: "point",
  spatialReference: { wkid: 4326 },
});
```

**Impact:** measured: `load()` resolves, the layer view is created, every geometry is `null` and nothing is
drawn; no error anywhere. The same happens with a WKB column. Setting `spatialReference` fixes both.

### Pitfall 2: Trusting `exceededTransferLimit`

```typescript
// ❌ Anti-pattern
const { features, exceededTransferLimit } = await layer.queryFeatures({ where: "1=1", outFields: ["DEPTH"] });
if (!exceededTransferLimit) exportAll(features); // 8000 of 310 702 rows
```

```typescript
// ✅ Correct
const total = await layer.queryFeatureCount();
const size = layer.capabilities?.query?.maxRecordCount ?? 8000;
for (let start = 0; start < total; start += size) {
  const q = layer.createQuery();
  q.start = start;
  q.num = size;
  const { features } = await layer.queryFeatures(q);
  exportAll(features);
}
```

**Impact:** measured on 310 702 rows: 8000 features and `exceededTransferLimit: false`, also with `num: 20000`.
Paging works (`start: 310000` returned the last 702). For totals, prefer `outStatistics` over downloading rows.

### Pitfall 3: Debugging the file when the host is the problem

```typescript
// ❌ Anti-pattern
await layer.load(); // "Failed to parse file" → re-export the parquet, try another compression…
```

```typescript
// ✅ Correct
const url = "https://example.com/data.parquet";
const head = await fetch(url, { method: "HEAD" });
const piece = await fetch(url, { headers: { Range: "bytes=0-3" } });
console.log(head.ok, head.headers.get("content-length"), piece.status); // true, size, 206
```

**Impact:** measured: 404, no CORS, no `Range` support and no `HEAD` all give `Failed to parse file`. A real format
problem says so (`Compression codec zstd is unsupported…`, `Only WGS84 and Web Mercator are supported`).

## When to Read references/

| If you need... | Read |
|---|---|
| ParquetLayer, data and encoding signatures | `references/api-detail.md` |
| GeoParquet, WKB, x/y, portal item, local file, paging | `references/examples.md` |
| More pitfalls (12, measured) and what was not measured | `references/pitfalls.md` |

## Related Skills

- `arcgis-layers` — queries, `createQuery` and paging on any feature layer
- `arcgis-visualization` — renderers for the layer
- `arcgis-tables-forms` — showing a non-spatial Parquet (`isTable`) in a table
- `arcgis-core-maps` — the `MapView` the layer needs

## Reference Samples

- [Intro to ParquetLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-parquetlayer/)
- [ParquetLayer API reference](https://developers.arcgis.com/javascript/latest/references/core/layers/ParquetLayer/)

## Changelog

- **0.1.0** (2026-10-28): Initial release, SDK 5.1.27. Every claim executed in
  `tests/runtime/casos/arcgis-parquet.ts` (32 checks) against Esri's public sample file and generated
  GeoParquet/WKB/x-y files: the missing `spatialReference` that draws nothing, the 8000-row cap without
  `exceededTransferLimit`, case-sensitive values, mixed schemas, µs timestamps and the host requirements.
