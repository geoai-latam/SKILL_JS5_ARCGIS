# API Reference: Performance

## Table of Contents

- [View lifecycle](#view-lifecycle)
- [Watching state](#watching-state)
- [Layer draw controls](#layer-draw-controls)
- [Bundle / imports](#bundle--imports)

---

## View lifecycle

| Member | Description |
|---|---|
| `view.destroy()` | Frees the WebGL context **and destroys `view.map` and its layers** |
| `view.map = null` | Detach the map first to keep it for another view |
| `view.fatalError` | Set when the view lost its WebGL context; `view.tryFatalErrorRecovery()` retries |
| `handle.remove()` | Stops a `watch` / `on` subscription |

---

## Watching state

| Watch | Fires (measured, one 1.5 s `goTo`) |
|---|---|
| `() => view.center` | 92 times |
| `() => view.stationary` (true) | once |
| `() => view.updating` | when fetching/drawing starts or ends |

`reactiveUtils.when(() => view.stationary, cb)` and `reactiveUtils.whenOnce(...)` are the settled-state helpers.

---

## Layer draw controls

| Property | Type | Description |
|---|---|---|
| `minScale` / `maxScale` | `number` | Outside the range the layer view is `suspended` and fetches nothing |
| `visible` | `boolean` | Toggle without re-fetching (0 requests over 3 toggles, measured) |
| `featureReduction` | `{ type: "cluster" \| "binning" \| "selection" }` | Aggregate dense points; plain objects autocast |
| `definitionExpression` | `string` | Server-side filter for what the layer draws |
| `SceneView.qualityProfile` | `"low" \| "medium" \| "high"` | 3D quality vs cost; set automatically per device |

---

## Bundle / imports

| Technique | Measured effect (Vite, `tests/bundle/medir.mjs`) |
|---|---|
| Per-module ESM (`@arcgis/core/<path>.js`) | The only form that resolves; no root or barrel modules |
| SDK internal splitting | Map + MapView + FeatureLayer: 748 chunks, 1494 KB (430 KB gzip) initial |
| `import()` of CSVLayer + KMLLayer | −24 KB (−6 KB gzip) initial |
| Components | Import only the `arcgis-*` tags the page renders |
