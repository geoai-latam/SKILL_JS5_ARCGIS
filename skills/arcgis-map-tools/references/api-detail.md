# API Reference: Map Tools

## Table of Contents

- [arcgis-sketch](#arcgis-sketch)
- [Measurement components](#measurement-components)
- [Measurement analyses](#measurement-analyses)
- [Snapping](#snapping)

---

## arcgis-sketch

`@arcgis/map-components/components/arcgis-sketch`

| Member | Description |
|---|---|
| nested in `arcgis-map` / `arcgis-scene`, or `reference-element` | Bind to the view |
| `layer` | Created ("Sketch Layer") and added to the map if not set |
| `creationMode` | `"continuous"` (default), `"single"`, `"update"` |
| `snappingOptions` | Its own `SnappingOptions`; share it with snapping controls |
| `arcgisCreate` / `arcgisUpdate` / `arcgisDelete` | Geometry lifecycle; check `detail.state` |

---

## Measurement components

| Component | View | Notes |
|---|---|---|
| `arcgis-measurement` | 2D/3D | `activeTool`: `"distance"`, `"area"` (2D) or `"direct-line"`, `"area"` (3D); `null` at start |
| `arcgis-distance-measurement-2d` | 2D | `unit`, `unitOptions`, `start()`, `clear()`, `analysis` |
| `arcgis-area-measurement-2d` | 2D | same, area units |
| `arcgis-direct-line-measurement-3d` | 3D | `state: "unsupported"` in a 2D map |
| `arcgis-area-measurement-3d` | 3D | |
| `arcgis-volume-measurement` | 3D | volumes (5.x) |

`unit` defaults to the system `"metric"`; `unitOptions` lists metric, imperial and the explicit units (meters,
kilometers, feet, miles, nautical-miles, ...). `hideUnitSelect`, `hideStartButton`, `hideVisualization` trim the UI.

---

## Measurement analyses

| Class | Geometry | Result (`whenAnalysisView(a).result`) |
|---|---|---|
| `analysis/DistanceMeasurementAnalysis.js` | `Polyline` | `{ length, mode }` |
| `analysis/AreaMeasurementAnalysis.js` | `Polygon` | `{ area, perimeter, mode }` |

Add them to `view.analyses`; `mode` was `"geodesic"` for WGS84 input.

---

## Snapping

`@arcgis/core/views/interactive/snapping/SnappingOptions.js`

| Property | Sketch default (measured) |
|---|---|
| `enabled` | `false` |
| `selfEnabled` | `true` |
| `featureEnabled` | `true` (needs `featureSources`) |
| `featureSources` | empty: add `FeatureSnappingLayerSource({ layer, enabled: true })` |
| `distance` | `5` (px) |
| `gridEnabled` | `false` |

`arcgis-snapping-controls` edits whatever `snappingOptions` you give it.
