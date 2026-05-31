# API Reference: Widgets & UI (Components)

## Table of Contents

- [Core UI components](#core-ui-components)
- [Common attributes](#common-attributes)
- [Deprecated widget equivalents](#deprecated-widget-equivalents)

---

## Core UI components

| Component | Import | Purpose |
|---|---|---|
| `arcgis-legend` | `dist/components/arcgis-legend` | Symbology key |
| `arcgis-layer-list` | `dist/components/arcgis-layer-list` | Toggle/reorder layers |
| `arcgis-search` | `dist/components/arcgis-search` | Geocode / find features |
| `arcgis-basemap-gallery` | `dist/components/arcgis-basemap-gallery` | Switch basemap |
| `arcgis-expand` | `dist/components/arcgis-expand` | Collapse other components |

---

## Common attributes

| Attribute | Description |
|---|---|
| `reference-element` | Selector/ref of the map element |
| `position` | `top-left` \| `top-right` \| `bottom-left` \| `bottom-right` |
| `hide-*` | Component-specific visibility toggles |

Nested inside `<arcgis-map>`, components auto-bind without `reference-element`.

---

## Deprecated widget equivalents

> ⚠️ Deprecated in 5.0, removed in 6.0 (Q1 2027).

| Widget | Replacement component |
|---|---|
| `@arcgis/core/widgets/Legend.js` | `arcgis-legend` |
| `@arcgis/core/widgets/LayerList.js` | `arcgis-layer-list` |
| `@arcgis/core/widgets/Search.js` | `arcgis-search` |
| `@arcgis/core/widgets/BasemapGallery.js` | `arcgis-basemap-gallery` |
