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
| `outFields` | `string[]` | Attributes to fetch |
| `definitionExpression` | `string` | Server-side SQL filter |
| `popupTemplate` | `PopupTemplate` | Popup configuration |
| `renderer` | `Renderer` | Symbology |

| Method | Returns | Description |
|---|---|---|
| `createQuery()` | `Query` | A query preset to the layer's config |
| `queryFeatures(query?)` | `Promise<FeatureSet>` | Run a query |
| `queryFeatureCount(query?)` | `Promise<number>` | Count matches |
| `queryRelatedFeatures(query)` | `Promise<Record<number, FeatureSet>>` | Related records |
| `load()` | `Promise<Layer>` | Load metadata |

---

## Query

`layer.createQuery()` returns a `Query`.

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
| `GeoJSONLayer` | `layers/GeoJSONLayer.js` | GeoJSON URL |
| `CSVLayer` | `layers/CSVLayer.js` | CSV with lat/lon |
| `GraphicsLayer` | `layers/GraphicsLayer.js` | Client-side graphics |
| `TileLayer` | `layers/TileLayer.js` | Cached tile service |
