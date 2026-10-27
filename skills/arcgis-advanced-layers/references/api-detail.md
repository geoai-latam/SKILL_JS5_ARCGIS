# API Reference: Advanced Layers

## Table of Contents

- [WMSLayer / WFSLayer / KMLLayer](#wmslayer--wfslayer--kmllayer)
- [MapImageLayer](#mapimagelayer)
- [CatalogLayer](#cataloglayer)

---

## WMSLayer / WFSLayer / KMLLayer

| Class | Module | Notes |
|---|---|---|
| `WMSLayer` | `layers/WMSLayer.js` | `sublayers: [{ name }]`; rendered images; `allSublayers` after load lists real names |
| `WMTSLayer` | `layers/WMTSLayer.js` | OGC tile matrix sets; `activeLayer` |
| `WFSLayer` | `layers/WFSLayer.js` | `url` + `name` (typename); WFS 2.0.0 + GeoJSON output required; `queryFeatures`/`queryFeatureCount` |
| `OGCFeatureLayer` | `layers/OGCFeatureLayer.js` | `url` (landing page) + `collectionId`; no `queryFeatures` on the layer |
| `KMLLayer` | `layers/KMLLayer.js` | KML/KMZ document URL |

---

## MapImageLayer

`@arcgis/core/layers/MapImageLayer.js`

| Member | Type | Description |
|---|---|---|
| `url` | `string` | MapServer URL |
| `sublayers` | `Collection<Sublayer>` | `{ id, visible, renderer?, definitionExpression? }` |
| `findSublayerById(id)` | `Sublayer` | Look up a sublayer to toggle/style |

---

## CatalogLayer

`@arcgis/core/layers/CatalogLayer.js` (since 4.30)

| Member | Description |
|---|---|
| `url` | FeatureServer (or its catalog sublayer) URL — not a MapServer |
| `load()` | Loads catalog metadata; required before browsing |
| `footprintLayer` | `CatalogFootprintLayer`: one polygon per dataset |
| `dynamicGroupLayer` | `CatalogDynamicGroupLayer`: datasets in view, read-only; `maximumVisibleSublayers` (default 10) |
| `createLayerFromFootprint(graphic)` | Promise of an editable layer for one dataset |
