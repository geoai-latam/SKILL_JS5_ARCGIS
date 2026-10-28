# API Reference: Parquet Layers

## Table of Contents

- [ParquetLayer](#parquetlayer)
- [Data sources](#data-sources)
- [Geometry encodings](#geometry-encodings)
- [parquetUtils](#parquetutils)
- [ParquetLayerView](#parquetlayerview)
- [Field types](#field-types)

---

## ParquetLayer

`@arcgis/core/layers/ParquetLayer.js` — `@beta`, since 4.33. `type` is `"parquet"`. 2D only.

| Property | Type | Notes |
|---|---|---|
| `data` | `ParquetFilesData \| ParquetPortalItemData` | 5.1. Replaces `urls` |
| `urls` | `Collection<string>` | `@deprecated` since 5.1; still loads and fills `data` |
| `geometryEncoding` | `GeometryEncodingWkb \| GeometryEncodingLocation` | 4.34. Detected from GeoParquet metadata or known x/y names |
| `geometryType` | `"point" \| "polygon" \| "polyline" \| "multipoint"` | Required when there is no GeoParquet metadata |
| `spatialReference` | `SpatialReference` | WGS84 or Web Mercator only. Reads 4326 by default even when unset |
| `isTable` | `boolean` (read-only) | 4.34. `true` when no geometry was found or declared |
| `definitionExpression` | `string` | 5.1. Filters the drawing and `createQuery()` |
| `fields` / `fieldsIndex` / `objectIdField` | | `objectIdField` is a generated `__OBJECTID` (measured), not the file's `OBJECTID` |
| `outFields` | `string[]` | What the view loads for hit tests and popups |
| `fullExtent` | `Extent` | From GeoParquet metadata; `null` for WKB without it (measured) |
| `renderer` | simple, class-breaks, unique-value, dot-density, dictionary, pie-chart, heatmap | Typed in the `.d.ts` |
| `popupTemplate` / `popupEnabled` / `labelingInfo` / `labelsVisible` | | Popups show the topmost feature only (docs) |
| `orderBy`, `effect`, `featureEffect`, `featureReduction`, `blendMode` | | From the mixins |
| `capabilities` | `FeatureLayerCapabilities` | Measured: `query.maxRecordCount` 8000, `supportsEditing` false |

| Method | Returns | Notes |
|---|---|---|
| `createQuery()` | `Query` | 5.1. `where` = `definitionExpression` (or `1=1`), `outFields: ["*"]` |
| `queryFeatures(query?)` | `Promise<FeatureSet>` | 4.34. At most 8000 rows; `exceededTransferLimit` stays `false` |
| `queryFeatureCount(query?)` | `Promise<number>` | Counts rows, including rows without coordinates |
| `queryObjectIds(query?)` | `Promise<ObjectId[]>` | 4.34. All ids without `where`; 8000 with one (measured) |
| `queryExtent(query?)` | `Promise<{ count, extent }>` | With a filter, counts only rows with geometry |
| `createPopupTemplate(options?)` | `PopupTemplate` | All fields |
| `getField(name)` / `getFieldDomain(name)` | | Case-insensitive name lookup |

There is no `applyEdits`, no `elevationInfo` and no `source`.

---

## Data sources

| Class | Module | Property | Notes |
|---|---|---|---|
| `ParquetFilesData` | `layers/support/ParquetFilesData.js` | `urls: Collection<string>` | 5.1, `@beta`. Several files read as one layer; schema from the first |
| `ParquetPortalItemData` | `layers/support/ParquetPortalItemData.js` | `portalItem: PortalItem` | 5.1, `@beta`. `type` is `"portal-item"`. A public item loads without sign-in |

The host must answer `HEAD` with the size and `Range` with `206`, with CORS. `blob:` URLs work.

---

## Geometry encodings

| Class | Module | Properties | Notes |
|---|---|---|---|
| `GeometryEncodingWkb` | `layers/support/GeometryEncodingWkb.js` | `field`, `orientation` | `type` `"wkb"`. `@beta`. The docs call it `ParquetGeometryEncodingWkb` |
| `GeometryEncodingLocation` | `layers/support/GeometryEncodingLocation.js` | `xField`, `yField` | `type` `"location"`. `xField` holds the longitude (measured; the docs word it the other way round) |

Both accept an autocast object too: `{ type: "location", xField, yField }`.
Detected x/y names (case-insensitive): `lng/lat`, `lon/lat`, `long/lat`, `longitude/latitude`, `x/y`,
`xcenter/ycenter`, `longitude83/latitude83`, `longdecdeg/latdecdeg`, `point-x/point-y`. When a file has several
pairs, detection picked `lng/lat` over `LONGITUDE/LATITUDE` in the Kansas file.

---

## parquetUtils

`@arcgis/core/layers/support/parquetUtils.js` (since 4.33)

| Function | Returns | Notes |
|---|---|---|
| `getParquetLayerInfo(data, options?)` | `Promise<ParquetLayerInfo>` | Reads the **first** file: `fields`, `geometryEncoding`, `geometryType`, `spatialReference`, `data`. Throws on an empty file. For custom x/y names it returns `geometryEncoding: null` |

---

## ParquetLayerView

`@arcgis/core/views/layers/ParquetLayerView.js` (since 4.33) extends `FeatureLikeLayerView`: `queryFeatures`,
`queryFeatureCount`, `queryObjectIds`, `queryExtent` on what is in the view, `filter`, `featureEffect`,
`highlight`, `dataUpdating`, `availableFields`. Measured on Kansas: all 310 702 points were in the view at zoom 6.

---

## Field types

Measured with files written by pyarrow:

| Parquet type | Field `type` | Value |
|---|---|---|
| `int64` | `big-integer` | number |
| `int32` / `uint32` | `integer` | number |
| `int16` | `small-integer` | number |
| `double` | `double` | number |
| `timestamp[ms]` | `date` | epoch milliseconds; `DATE '2020-01-01'` works in `where` |
| `timestamp[us]` (pandas default) | `big-integer` | epoch **microseconds** |
| `date32` | `integer` | days since 1970-01-01 |
| WKB `binary` without metadata | not a field | read through `GeometryEncodingWkb` |
