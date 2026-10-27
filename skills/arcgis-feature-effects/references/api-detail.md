# API Reference: Feature Effects

## Table of Contents

- [layer.effect](#layereffect)
- [FeatureEffect](#featureeffect)
- [FeatureFilter](#featurefilter)

---

## layer.effect

A CSS-like filter string applied to the whole layer, or an array of `{ scale, value }` stops.
An invalid string (for example a missing unit) is ignored with an `Invalid Effect` console warning.
Not applied in a SceneView or with a heatmap renderer.

| Function | Example | Notes |
|---|---|---|
| `bloom(strength, radius, threshold)` | `bloom(1.5, 0.5px, 0.1)` | Glow |
| `blur(radius)` | `blur(2px)` | Needs a unit |
| `drop-shadow(x, y, blur, color)` | `drop-shadow(2px, 2px, 3px, #000)` | Shadow |
| `brightness(n)` / `contrast(%)` / `grayscale(%)` / `opacity(%)` / `saturate(%)` / `sepia(%)` / `invert(%)` | `brightness(1.2)` | Chainable with spaces |
| `hue-rotate(deg)` | `hue-rotate(270deg)` | |

---

## FeatureEffect

`@arcgis/core/layers/support/FeatureEffect.js`

| Property | Type | Description |
|---|---|---|
| `filter` | `FeatureFilter` | Which features match |
| `includedEffect` | `string` | Effect for matched features |
| `excludedEffect` | `string` | Effect for non-matched features |
| `excludedLabelsVisible` | `boolean` | Show labels of excluded features (default `false`: hidden) |

Assign to `layer.featureEffect` (inherited by the layer view; `layerView.featureEffect` wins if set).
Without `filter`, every feature counts as included.

---

## FeatureFilter

`@arcgis/core/layers/support/FeatureFilter.js`

| Property | Type | Description |
|---|---|---|
| `where` | `string` | SQL filter |
| `geometry` | `Geometry` | Spatial filter |
| `spatialRelationship` | `string` | e.g. `"intersects"` |
| `timeExtent` | `TimeExtent` | Temporal filter |
