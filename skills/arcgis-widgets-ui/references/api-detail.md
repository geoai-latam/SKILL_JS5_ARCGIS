# API Reference: Widgets & UI (Components)

## Table of Contents

- [Core UI components](#core-ui-components)
- [Placement and binding](#placement-and-binding)
- [Deprecated widget equivalents](#deprecated-widget-equivalents)

---

## Core UI components

All import from `@arcgis/map-components/components/<tag>`.

| Component | Purpose | Useful attributes |
|---|---|---|
| `arcgis-legend` | Symbology key | `basemap-legend-visible`, `hide-layers-not-in-current-view`, `legend-style` |
| `arcgis-layer-list` | Toggle/reorder layers | `drag-enabled`, `show-filter` |
| `arcgis-search` | Geocode / find features | `sources`, `max-results`, `popup-disabled`; World Geocoding Service by default |
| `arcgis-basemap-gallery` | Switch basemap | `source` |
| `arcgis-expand` | Collapse other components | `expanded`, `group`, `mode` |

---

## Placement and binding

| How | Description |
|---|---|
| `slot="top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | Corner of the map for a nested component (also `-start`/`-end`); several in one slot stack |
| `reference-element="#mapId"` | Bind a component that is not nested; must match the map's id |
| Nested in `arcgis-expand` | Still binds to the map the expand is in |

There is no `position` property; the attribute is ignored.

---

## Deprecated widget equivalents

| Widget | Deprecated since | Replacement component |
|---|---|---|
| `@arcgis/core/widgets/BasemapGallery.js` | 4.32 | `arcgis-basemap-gallery` |
| `@arcgis/core/widgets/Search.js` | 4.33 | `arcgis-search` |
| `@arcgis/core/widgets/Legend.js` | 4.34 | `arcgis-legend` |
| `@arcgis/core/widgets/Expand.js` | 4.34 | `arcgis-expand` |
| `@arcgis/core/widgets/LayerList.js` | 5.0 | `arcgis-layer-list` |
