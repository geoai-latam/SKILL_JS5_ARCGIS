# API Reference: Advanced Layers

## Table of Contents

- [WMSLayer / WFSLayer / KMLLayer](#wmslayer--wfslayer--kmllayer)
- [MapImageLayer](#mapimagelayer)
- [CatalogLayer](#cataloglayer)

---

## WMSLayer / WFSLayer / KMLLayer

| Class | Module | Notes |
|---|---|---|
| `WMSLayer` | `layers/WMSLayer.js` | `sublayers: [{ name }]`; rendered images |
| `WFSLayer` | `layers/WFSLayer.js` | Vector features; queryable client-side |
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

`@arcgis/core/layers/CatalogLayer.js` (new in 5.0)

| Member | Description |
|---|---|
| `url` | Catalog service URL |
| `load()` | Loads catalog metadata; required before browsing |
| `title` | Display title once loaded |

A catalog service exposes many datasets; `CatalogLayer` lets users browse footprints and add the
underlying layers on demand.
