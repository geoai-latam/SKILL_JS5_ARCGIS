# API Reference: Performance

## Table of Contents

- [Bundle / imports](#bundle--imports)
- [Layer draw controls](#layer-draw-controls)
- [View lifecycle](#view-lifecycle)

---

## Bundle / imports

| Technique | How |
|---|---|
| Per-module ESM | `import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js"` |
| Code-splitting | `const { default: X } = await import("@arcgis/core/.../X.js")` |
| Component tree-shaking | import only the `arcgis-*` components you render |

---

## Layer draw controls

| Property | Type | Description |
|---|---|---|
| `featureReduction` | `{ type: "cluster" \| "selection" \| "binning" }` | Aggregate dense features |
| `definitionExpression` | `string` | SQL filter limiting fetched features |
| `minScale` / `maxScale` | `number` | Only draw within a scale range |
| `SceneView.qualityProfile` | `"low" \| "medium" \| "high"` | 3D rendering quality vs cost |

---

## View lifecycle

| Member | Description |
|---|---|
| `view.destroy()` | Releases the WebGL context and resources |
| `handle.remove()` | Stops a watch/when/event subscription |
| `view.updating` | `true` while the view is fetching/drawing (watch to defer work) |
