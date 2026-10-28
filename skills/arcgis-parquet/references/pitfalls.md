# Extended Pitfalls: Parquet Layers

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Every impact was measured with SDK 5.1.27 in `tests/runtime/casos/arcgis-parquet.ts`, on Esri's public
> sample file (310 702 rows) and on small files written by `tests/runtime/generar-parquet.py`.

## Pitfall 1: Encoding declared, spatial reference left to the default

### Anti-pattern

```typescript
const layer = new ParquetLayer({
  data: new ParquetFilesData({ urls: [url] }),
  geometryEncoding: new GeometryEncodingWkb({ field: "geom" }),
  geometryType: "point",
});
```

### Correct

```typescript
const layer = new ParquetLayer({
  data: new ParquetFilesData({ urls: [url] }),
  geometryEncoding: new GeometryEncodingWkb({ field: "geom" }),
  geometryType: "point",
  spatialReference: { wkid: 4326 },
});
```

### Impact

Every geometry is `null`. With x/y columns, the layer view was created over an OSM basemap and the centre pixel
stayed basemap-coloured; with `spatialReference` it turned red. No error, no warning.

### Diagnosis

`(await layer.queryFeatures({ where: "1=1", num: 1 })).features[0].geometry === null`. Reading
`layer.spatialReference` does not help: it says 4326 either way.

---

## Pitfall 2: The 8000-row cap with `exceededTransferLimit: false`

### Anti-pattern

```typescript
const ids = await layer.queryObjectIds({ where: "STATUS = 'Constructed'" });
const { features } = await layer.queryFeatures({ where: "1=1", num: 20000 });
```

### Correct

```typescript
const total = await layer.queryFeatureCount({ where: "STATUS = 'Constructed'" });
const q = layer.createQuery();
q.where = "STATUS = 'Constructed'";
q.start = 0;
q.num = 8000; // then 8000, 16000… until total
```

### Impact

Measured: `queryFeatures` gave 8000 of 310 702 with `exceededTransferLimit: false`, also with `num: 20000`.
`queryObjectIds()` without a `where` gave all 310 702, but with `STATUS = 'Constructed'` it gave 8000 of 244 149.

### Diagnosis

A result of exactly 8000 (`capabilities.query.maxRecordCount`). Compare with `queryFeatureCount`.

---

## Pitfall 3: "Failed to parse file" that is not about the file

### Anti-pattern

```typescript
// Re-exporting the file because load() said "Failed to parse file".
await layer.load();
```

### Correct

```typescript
const head = await fetch(url, { method: "HEAD" });
const range = await fetch(url, { headers: { Range: "bytes=0-3" } });
if (!head.ok || range.status !== 206) console.error("host: needs HEAD, Range and CORS");
```

### Impact

Measured, same message for: a 404, a host without CORS, a host that ignores `Range` (200 with the whole file), and
a host that answers `HEAD` with 405. The same file served with Range loaded its 10 000 rows.

### Diagnosis

The network tab: a `HEAD` and then `GET`s with `Range: bytes=…` answered `206`. Anything else is the host.

---

## Pitfall 4: A WKB or custom x/y file without `geometryEncoding` becomes a table

### Anti-pattern

```typescript
const layer = new ParquetLayer({ data: new ParquetFilesData({ urls: [url] }) }); // geom is WKB, no "geo" metadata
map.add(layer);
```

### Correct

```typescript
const layer = new ParquetLayer({
  data: new ParquetFilesData({ urls: [url] }),
  geometryEncoding: new GeometryEncodingWkb({ field: "geom" }),
  geometryType: "point",
  spatialReference: { wkid: 4326 },
});
```

### Impact

Measured: `load()` resolves, `loadError` is `null`, `isTable` is `true` and `queryFeatureCount` gives 5, while
`geometryType` still reads `"point"`. Nothing is drawn.

### Diagnosis

`layer.isTable === true` on data that should have geometry.

---

## Pitfall 5: `geometryType` missing or wrong

### Anti-pattern

```typescript
// WKB polygons, geometryType not set (stays "point")
new ParquetLayer({ data, geometryEncoding: new GeometryEncodingWkb({ field: "geom" }), spatialReference: { wkid: 4326 } });
// WKB points declared as polygons
new ParquetLayer({ data, geometryEncoding: new GeometryEncodingWkb({ field: "geom" }), geometryType: "polygon", spatialReference: { wkid: 4326 } });
```

### Correct

```typescript
new ParquetLayer({ data, geometryEncoding: new GeometryEncodingWkb({ field: "geom" }), geometryType: "polygon", spatialReference: { wkid: 4326 } }); // polygon WKB
```

### Impact

Measured: polygons without `geometryType` gave `geometryType: "point"` and `null` geometries; points declared as
polygons gave 5 polygons with `rings: []`. No error in either case.

### Diagnosis

Check the WKB type when writing the file (GeoPandas: `gdf.geom_type.unique()`), or use GeoParquet metadata.

---

## Pitfall 6: Attribute values are case-sensitive

### Anti-pattern

```typescript
await layer.queryFeatureCount({ where: "STATUS = 'constructed'" });
```

### Correct

```typescript
await layer.queryFeatureCount({ where: "UPPER(STATUS) = 'CONSTRUCTED'" });
```

### Impact

Measured: `'constructed'` gave 0, `'Constructed'` 244 149, and `UPPER(...)` 244 149. A `definitionExpression`
`nombre = 'bogotá'` on a file holding `Bogotá` counted 0, without an error.

### Diagnosis

A count of 0 where you expected rows: query the distinct values first.

---

## Pitfall 7: A plain `where` replaces the `definitionExpression`

### Anti-pattern

```typescript
const layer = new ParquetLayer({ data, definitionExpression: "STATUS = 'Plugged'" });
await layer.queryFeatureCount({ where: "COUNTY = 'Sedgwick'" });
```

### Correct

```typescript
const q = layer.createQuery();
q.where = `(${q.where}) AND COUNTY = 'Sedgwick'`;
await layer.queryFeatureCount(q);
```

### Impact

Measured: 73 538 (every Sedgwick well) instead of 14 703 (the plugged ones). `queryFeatureCount()` with no
argument does apply it (64 254).

### Diagnosis

The count does not change when you change the `definitionExpression`.

---

## Pitfall 8: Several files with different schemas

### Anti-pattern

```typescript
new ParquetFilesData({ urls: ["2024.parquet", "2025-with-new-columns.parquet"] });
```

### Correct

```typescript
// Write every file with the same columns (DuckDB: UNION BY NAME, then split), or one layer per schema.
new ParquetFilesData({ urls: ["2024.parquet", "2025.parquet"] });
```

### Impact

Measured: the layer loads, takes the fields of the first file and counts the rows of both (6), but
`queryFeatures({ outFields: ["poblacion"] })` rejects with `Unknown field: poblacion`, a field that **is** in the
first file.

### Diagnosis

`Unknown field` for a field listed in `layer.fields`.

---

## Pitfall 9: Timestamps in microseconds and dates in days

### Anti-pattern

```typescript
const when = new Date(feature.attributes.fecha); // fecha was written by pandas: timestamp[us]
```

### Correct

```typescript
const f = layer.getField("fecha");
const ms = f?.type === "big-integer" ? Number(feature.attributes.fecha) / 1000 : feature.attributes.fecha;
// Better: write timestamp[ms] (pyarrow: coerce_timestamps="ms"), which becomes a real date field.
```

### Impact

Measured: `timestamp[ms]` became a `date` field (epoch ms, `DATE '2020-01-01'` works in `where`);
`timestamp[us]`, the pandas default, became `big-integer` holding 1577836800000000 for 2020-01-01, a date in the
year 51 970 if read as milliseconds; `date32` became `integer` (18262, days since 1970).

### Diagnosis

`layer.fields` shows `big-integer` or `integer` where you expected `date`.

---

## Pitfall 10: `queryExtent().count` is not the row count

### Anti-pattern

```typescript
const { count } = await layer.queryExtent(); // used as "rows matching the filter"
```

### Correct

```typescript
const rows = await layer.queryFeatureCount(); // rows, with or without coordinates
const { count: located } = await layer.queryExtent(); // only rows with geometry, when a filter applies
```

### Impact

Measured with `definitionExpression: "STATUS = 'Plugged'"`: `queryFeatureCount` 64 254, `queryExtent().count`
64 079; the difference is the 175 rows without `lat`/`lng`. Without a filter both said 310 702 even though 389 rows
lack coordinates.

### Diagnosis

Count `lat IS NULL OR lng IS NULL` (or the geometry column) to explain the gap.

---

## Pitfall 11: No GeoParquet metadata, no `fullExtent`

### Anti-pattern

```typescript
const map = new Map({ layers: [layer] }); // no basemap; layer is WKB without metadata
const view = new MapView({ container: "viewDiv", map });
await view.when();
view.goTo(layer.fullExtent);
```

### Correct

```typescript
const map = new Map({ basemap: "osm", layers: [layer] });
const view = new MapView({ container: "viewDiv", map });
const { extent } = await layer.queryExtent();
await view.goTo(extent);
```

### Impact

Measured: WKB with `spatialReference` had `fullExtent: null` (x/y columns with `spatialReference` did get one).
A `MapView` whose map has no basemap and only that layer never resolved `view.when()` (pending at 8 s). With x/y
columns and no `spatialReference`, `queryExtent()` itself rejects with
`Cannot read properties of undefined (reading 'toJSON')`.

### Diagnosis

`layer.fullExtent == null` after `load()`.

---

## Pitfall 12: Projected coordinates, ZSTD, and 3D

### Anti-pattern

```typescript
// GeoParquet in EPSG:9377 (or UTM columns), compressed with ZSTD, in a SceneView
sceneView.map?.add(new ParquetLayer({ data: new ParquetFilesData({ urls: [url] }) }));
```

### Correct

```typescript
// Write it as EPSG:4326 (or 3857) with Snappy or GZIP, and use a MapView:
// gdf.to_crs(4326).to_parquet("out.parquet", compression="snappy")
mapView.map?.add(new ParquetLayer({ data: new ParquetFilesData({ urls: [url] }) }));
```

### Impact

These fail loudly, which is good: `Only WGS84 and Web Mercator are supported` (EPSG:9377 GeoParquet, and UTM
columns declared with `wkid: 26914`), `Compression codec zstd is unsupported. Must be of type
uncompressed,snappy,gzip`, and in a `SceneView` `whenLayerView` rejects with `layerview creation failed`.

### Diagnosis

Read `layer.loadError.message`: unlike pitfall 3, these messages name the cause.

---

## Not measured

- `orderByFields` above 500 000 features (the documented limit; the sample has 310 702).
- Private portal items and ArcGIS Enterprise items: the validation does not sign in.
- Hosts other than ArcGIS Online and Vite's dev server (S3, Google Cloud Storage, Azure, GitHub): only the
  HEAD/Range/CORS behaviour was measured, through a local host that removes each one.
- Labels, clustering or binning (`featureReduction`), heatmap and the other renderers beyond simple and color
  visual variables: typed in the `.d.ts`, not run.
- `big-integer` precision above 2^53, files larger than 56 MB, and memory use.
- Spatial queries in the spatial references the docs exclude (4742, 8042, 8086, 4757).
