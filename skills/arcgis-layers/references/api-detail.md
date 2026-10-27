# API Reference: Layers

## Table of Contents

- [FeatureLayer](#featurelayer)
- [Query](#query)
- [Other layer types](#other-layer-types)

---

## FeatureLayer

`@arcgis/core/layers/FeatureLayer.js`

| Property | Type | Description |
|---|---|---|
| `url` | `string` | Feature service layer URL |
| `outFields` | `string[]` | Attributes the view loads (not a query limit) |
| `definitionExpression` | `string` | Server-side filter for drawing; reaches queries only via `createQuery()` |
| `popupTemplate` | `PopupTemplate` | Popup configuration |
| `renderer` | `Renderer` | Symbology |

| Method | Returns | Description |
|---|---|---|
| `createQuery()` | `Query` | `where` = definitionExpression or `1=1`, `returnGeometry: true`, `outFields: ["*"]` |
| `queryFeatures(query?)` | `Promise<FeatureSet>` | Capped at `maxRecordCount`; check `exceededTransferLimit` |
| `queryFeatureCount(query?)` | `Promise<number>` | Count matches |
| `queryRelatedFeatures(query)` | `Promise<Record<number, FeatureSet>>` | Related records |
| `load()` | `Promise<Layer>` | Load metadata |

---

## Query

`layer.createQuery()` returns a `Query` (`@arcgis/core/rest/support/Query.js`). A `new Query()` starts with
`returnGeometry: false` and `outFields: null`, and ignores the layer's `definitionExpression`.

| Property | Type | Description |
|---|---|---|
| `where` | `string` | SQL filter |
| `outFields` | `string[]` | Attributes to return |
| `returnGeometry` | `boolean` | Include geometry |
| `orderByFields` | `string[]` | Sort, e.g. `["POP DESC"]` |
| `start` / `num` | `number` | Pagination offset / page size |
| `geometry` + `spatialRelationship` | `Geometry` | Spatial filter |

---

## Other layer types

| Class | Module | Source |
|---|---|---|
| `GeoJSONLayer` | `layers/GeoJSONLayer.js` | GeoJSON URL or Blob URL (WGS84); adds an `__OBJECTID` field |
| `CSVLayer` | `layers/CSVLayer.js` | CSV; detects `lat`/`lon`-style names, else `latitudeField`/`longitudeField` |
| `GraphicsLayer` | `layers/GraphicsLayer.js` | Client-side graphics |
| `TileLayer` | `layers/TileLayer.js` | Cached tile service |
