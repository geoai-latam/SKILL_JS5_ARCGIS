# API Reference: Core Maps

## Table of Contents

- [Map](#map)
- [MapView](#mapview)
- [SceneView](#sceneview)
- [arcgis-map / arcgis-scene (components)](#arcgis-map--arcgis-scene-components)

---

## Map

`@arcgis/core/Map.js`

### Constructor

| Signature | Description |
|---|---|
| `new Map(properties?)` | Creates the map data model |

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `basemap` | `string \| Basemap` | `null` | Basemap style id (e.g. `"arcgis/topographic"`) |
| `ground` | `string \| Ground` | `null` | Elevation; `"world-elevation"` for 3D terrain |
| `layers` | `Collection<Layer>` | `[]` | Operational layers |

---

## MapView

`@arcgis/core/views/MapView.js` — 2D rendering.

### Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `container` | `string \| HTMLElement` | — | DOM id or element |
| `map` | `Map` | — | The map model |
| `center` | `number[] \| Point` | — | `[lon, lat]` |
| `zoom` | `number` | — | Zoom level |
| `extent` | `Extent` | — | Initial extent (alternative to center/zoom) |

### Methods

| Method | Returns | Description |
|---|---|---|
| `when(cb?)` | `Promise<MapView>` | Resolves when the view is ready |
| `goTo(target, options?)` | `Promise<void>` | Animate to a geometry/extent/camera |
| `hitTest(screenPoint)` | `Promise<HitTestResult>` | What is under a screen point |

---

## SceneView

`@arcgis/core/views/SceneView.js` — 3D rendering. Shares most of `MapView` plus:

### Properties

| Property | Type | Description |
|---|---|---|
| `camera` | `Camera` | `{ position: {longitude, latitude, z}, tilt, heading }` |
| `qualityProfile` | `"low" \| "medium" \| "high"` | Rendering quality |
| `environment` | `SceneViewEnvironment` | Lighting, atmosphere, stars |

---

## arcgis-map / arcgis-scene (components)

`@arcgis/map-components/dist/components/arcgis-map` (and `arcgis-scene`).

### Attributes / Properties

| Attribute | Type | Description |
|---|---|---|
| `basemap` | `string` | Basemap style id |
| `center` | `string` | `"lon,lat"` |
| `zoom` | `string` | Zoom level |
| `item-id` | `string` | Webmap/Webscene portal item id |

### Events

| Event | Detail | Description |
|---|---|---|
| `arcgisViewReadyChange` | `{ view }` | Fires when the underlying view becomes ready |
| `arcgisViewChange` | — | Fires on viewpoint changes (pan/zoom) |
