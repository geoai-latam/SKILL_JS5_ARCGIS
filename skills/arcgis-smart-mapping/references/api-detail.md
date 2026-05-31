# API Reference: Smart Mapping

## Table of Contents

- [Renderer creator modules](#renderer-creator-modules)
- [Common parameters](#common-parameters)
- [Result object](#result-object)

---

## Renderer creator modules

| Module | Functions |
|---|---|
| `smartMapping/renderers/color.js` | `createContinuousRenderer`, `createClassBreaksRenderer` |
| `smartMapping/renderers/size.js` | `createContinuousRenderer`, `createClassBreaksRenderer` |
| `smartMapping/renderers/type.js` | `createRenderer` (category) |

Import as a namespace: `import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js"`.

---

## Common parameters

| Param | Type | Description |
|---|---|---|
| `layer` | `FeatureLayer` | Layer to analyze |
| `view` | `MapView \| SceneView` | View used to sample statistics |
| `field` | `string` | Numeric (color/size) or category (type) field |
| `theme` | `string` | e.g. `"high-to-low"`, `"above-and-below"` |
| `basemap` | `string` | Influences ramp choice for contrast |

---

## Result object

Creators resolve to:

| Property | Description |
|---|---|
| `renderer` | The generated renderer — assign to `layer.renderer` |
| `statistics` | Computed statistics (min/max/avg/stddev) |
| `colorScheme` / `sizeScheme` | The chosen scheme (for legends/sliders) |
