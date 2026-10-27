# API Reference: Map Tools

## Table of Contents

- [arcgis-sketch](#arcgis-sketch)
- [Measurement components](#measurement-components)
- [arcgis-snapping-controls](#arcgis-snapping-controls)

---

## arcgis-sketch

`@arcgis/map-components/components/arcgis-sketch`

| Member | Description |
|---|---|
| `reference-element` / nested | Bind to the map |
| `creationMode` | `single` \| `continuous` \| `update` |
| `arcgisCreate` / `arcgisUpdate` / `arcgisDelete` events | Geometry lifecycle |

---

## Measurement components

| Component | View | Measures |
|---|---|---|
| `arcgis-measurement` | 2D/3D | distance or area (switchable) |
| `arcgis-distance-measurement-2d` | 2D | distance |
| `arcgis-area-measurement-2d` | 2D | area |
| `arcgis-direct-line-measurement-3d` | 3D | direct distance |
| `arcgis-area-measurement-3d` | 3D | area |

---

## arcgis-snapping-controls

`@arcgis/map-components/components/arcgis-snapping-controls`

| Option | Description |
|---|---|
| feature snapping | Snap to other features' vertices/edges |
| self snapping | Snap to the geometry being drawn |
| grid snapping | Snap to a grid |

Wire snapping sources so there are targets to snap to.
