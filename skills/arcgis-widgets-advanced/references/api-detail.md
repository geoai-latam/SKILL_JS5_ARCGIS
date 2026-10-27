# API Reference: Advanced Widgets (Components)

## Table of Contents

- [Advanced components](#advanced-components)
- [Placement](#placement)
- [Elevation profile results](#elevation-profile-results)
- [Deprecated widget equivalents](#deprecated-widget-equivalents)

---

## Advanced components

All import from `@arcgis/map-components/components/<tag>`.

| Component | Purpose | View | Useful attributes |
|---|---|---|---|
| `arcgis-print` | Export layouts (PDF, PNG…) | 2D/3D | `print-service-url` (ArcGIS Online by default), `allowed-formats`, `allowed-layouts` |
| `arcgis-bookmarks` | Saved viewpoints | 2D/3D | `show-add-bookmark-button`, `show-edit-bookmark-button`, `show-filter` |
| `arcgis-compass` | Orientation / reset rotation | 2D/3D | `visual-scale` |
| `arcgis-daylight` | Sun position and shadows | 3D | `hide-shadows-toggle`, `hide-play-buttons`, `play-speed-multiplier` |
| `arcgis-elevation-profile` | Terrain profile along a line | 2D/3D | `geometry`, `profiles`, `distance-unit`, `elevation-unit` |

---

## Placement

- Nested in `arcgis-map` or `arcgis-scene`: `slot="top-left" | "top-right" | "bottom-left" | "bottom-right"` (also
  `-start`/`-end` variants).
- Elsewhere on the page: `reference-element="#map"`.
- There is no `position` property: the attribute is ignored and the component falls into the default slot.

---

## Elevation profile results

```typescript
const analysisView = await mapEl.whenAnalysisView(profileEl.analysis!);
// typed as a union: check analysisView.type === "elevation-profile-view-2d" (or "-3d" in a scene), then
// analysisView.progress (0..1), analysisView.results[i].available / .statistics, analysisView.statistics
```

The profile lines in `profileEl.profiles` hold configuration (type, color, title); they have no `statistics` in 5.x.

---

## Deprecated widget equivalents

| Widget | Deprecated since | Replacement component |
|---|---|---|
| `@arcgis/core/widgets/Compass.js` | 4.32 | `arcgis-compass` |
| `@arcgis/core/widgets/Print.js` | 4.33 | `arcgis-print` |
| `@arcgis/core/widgets/Bookmarks.js` | 4.34 | `arcgis-bookmarks` |
| `@arcgis/core/widgets/Daylight.js` | 4.34 | `arcgis-daylight` |
| `@arcgis/core/widgets/ElevationProfile.js` | 5.0 | `arcgis-elevation-profile` |
