# API Reference: Smart Mapping

## Table of Contents

- [Renderer creator modules](#renderer-creator-modules)
- [Common parameters](#common-parameters)
- [Result object](#result-object)

---

## Renderer creator modules

| Module | Functions |
|---|---|
| `smartMapping/renderers/color.js` | `createContinuousRenderer`, `createClassBreaksRenderer`, `createVisualVariable` |
| `smartMapping/renderers/size.js` | `createContinuousRenderer`, `createClassBreaksRenderer`, `createVisualVariables` |
| `smartMapping/renderers/type.js` | `createRenderer` (category) |

Other modules in the same folder: `heatmap`, `dotDensity`, `predominance`, `relationship`, `univariateColorSize`,
`opacity`, `location`, `pieChart`. Import as a namespace:
`import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js"`.

---

## Common parameters

| Param | Type | Description |
|---|---|---|
| `layer` | `FeatureLayer` (and others) | Layer to analyze; statistics cover the whole layer and respect `definitionExpression` |
| `view` | `MapView \| SceneView` | Optional; read for the background to pick colors |
| `field` | `string` | Numeric (color/size) or category (type) field |
| `theme` | `string` | e.g. `"high-to-low"`, `"above-and-below"` |
| `classificationMethod` | `string` | Class breaks: default equal-interval; `"quantile"`, `"natural-breaks"`, `"standard-deviation"` |
| `numClasses` | `number` | Class breaks: default 5 |
| `numTypes` | `number` | Type: default 10 (the rest go to "Other"); `-1` for all |
| `filter` | `FeatureFilter` | Only geometry `intersects` filters are used; `where` is ignored |
| `basemap` | `Basemap \| string` | Background hint when there is no view |

---

## Result object

| Property | Description |
|---|---|
| `renderer` | The generated renderer; assign it to `layer.renderer` |
| `statistics` | `min`, `max`, `avg`, `stddev`, `count` of the whole (filtered) layer |
| `visualVariable` | Color continuous: the color variable with its stops |
| `basemapId` / `basemapTheme` | The background read (`"light"` / `"dark"`) |
