# API Reference: Advanced Widgets (Components)

## Table of Contents

- [Advanced components](#advanced-components)
- [Notes](#notes)
- [Deprecated widget equivalents](#deprecated-widget-equivalents)

---

## Advanced components

| Component | Import | Purpose | View |
|---|---|---|---|
| `arcgis-print` | `dist/components/arcgis-print` | Export layouts (PDF/PNG) | 2D/3D |
| `arcgis-bookmarks` | `dist/components/arcgis-bookmarks` | Saved viewpoints | 2D/3D |
| `arcgis-compass` | `dist/components/arcgis-compass` | Orientation / reset | 2D/3D |
| `arcgis-daylight` | `dist/components/arcgis-daylight` | Sun position & shadows | 3D |
| `arcgis-elevation-profile` | `dist/components/arcgis-elevation-profile` | Terrain/line profile | 2D/3D |

---

## Notes

- All accept `reference-element` and `position` (like core UI components).
- `arcgis-print` requires a print service; ArcGIS Online provides a default.
- `arcgis-daylight` needs a `SceneView` to be meaningful.

---

## Deprecated widget equivalents

> ⚠️ Deprecated in 5.0, removed in 6.0 (Q1 2027).

| Widget | Replacement component |
|---|---|
| `@arcgis/core/widgets/Print.js` | `arcgis-print` |
| `@arcgis/core/widgets/Bookmarks.js` | `arcgis-bookmarks` |
| `@arcgis/core/widgets/Compass.js` | `arcgis-compass` |
| `@arcgis/core/widgets/Daylight.js` | `arcgis-daylight` |
| `@arcgis/core/widgets/ElevationProfile.js` | `arcgis-elevation-profile` |
