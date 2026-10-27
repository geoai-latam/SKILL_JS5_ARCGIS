# API Reference: Interaction

## Table of Contents

- [view.hitTest](#viewhittest)
- [view events](#view-events)
- [promiseUtils.debounce](#promiseutilsdebounce)
- [SketchViewModel](#sketchviewmodel)
- [arcgis-sketch](#arcgis-sketch)

---

## view.hitTest

`hitTest(screenPoint | MouseEvent, options?) => Promise<HitTestResult>`

| Option | Type | Description |
|---|---|---|
| `include` | layer, graphic, or iterables of them | Only test these (5.0+) |
| `exclude` | same | Skip these (5.0+) |

`results` is ordered top layer first. Each item has a `type`:

| `type` | Extra fields | Comes from |
|---|---|---|
| `"graphic"` | `graphic`, `layer`, `mapPoint` | Feature, Graphics, GeoJSON, CSV, Scene layers; also label hits |
| `"media"` | `element`, `sourcePoint` | MediaLayer |
| `"route"` | `networkFeature` | RouteLayer |
| `"raster"` | `pixelValue`, `bandIds`, `mapPoint` | ImageryLayer / ImageryTileLayer (2D) |
| `"layer"` | `layer` | GaussianSplatLayer (3D, 5.1) |

`graphic.attributes` holds only what the client loaded. For a service FeatureLayer that is the object id plus
renderer, label and popup fields: set `outFields` to read more.

In a SceneView the result also has `ground: { mapPoint, distance }`, always present even when the ground is
excluded; terrain is never an item of `results`.

---

## view events

| Event | Handler arg | Notes |
|---|---|---|
| `click` | `{ x, y, mapPoint, native, ... }` | Single click/tap; `mapPoint` is filled |
| `double-click` | `{ x, y, mapPoint }` | Also zooms; `event.stopPropagation()` to prevent it |
| `pointer-move` | `{ x, y, native }` | Not throttled by the SDK; no `mapPoint` (use `view.toMap(e)`) |

`view.on(name, handler)` returns a handle with `.remove()`.

---

## promiseUtils.debounce

`@arcgis/core/core/promiseUtils.js`

`debounce(fn)` returns a function that runs `fn` at most once at a time; calls made while one is pending reject
with an `AbortError` except the last. Check it with `promiseUtils.isAbortError(err)`.

---

## SketchViewModel

`@arcgis/core/widgets/Sketch/SketchViewModel.js`

| Member | Description |
|---|---|
| `new SketchViewModel({ view, layer })` | Draw into a GraphicsLayer (or MapNotesLayer) |
| `create(tool, options?)` | `Promise<void>`; tool: point, multipoint, polyline, polygon, rectangle, circle, freehandPolyline/Polygon, text, mesh |
| `update(graphics, options?)` | Edit existing graphics |
| `complete()` / `cancel()` | Finish keeping the geometry / abort |
| `on("create" \| "update" \| "delete" \| "undo" \| "redo", cb)` | Events; check `event.state` |
| `destroy()` | Removes listeners; leaves the drawn graphics in the layer |

Create event states: `start`, `active`, `complete`, `cancel`. A second `create()` mid-operation fires `cancel` for
the first.

---

## arcgis-sketch

`@arcgis/map-components/components/arcgis-sketch`, placed inside `arcgis-map` / `arcgis-scene`.

| Property / event | Default / note |
|---|---|
| `layer` | Created and added to the map if you don't pass one |
| `creationMode` | `"continuous"` (also `"single"`, `"update"`) |
| `availableCreateTools` | point, polyline, freehandPolyline, polygon, freehandPolygon, rectangle, circle |
| `arcgisCreate` / `arcgisUpdate` | Same payload as the view model's `create` / `update` |
