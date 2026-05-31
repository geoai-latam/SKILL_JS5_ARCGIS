# API Reference: Feature Effects

## Table of Contents

- [layer.effect](#layereffect)
- [FeatureEffect](#featureeffect)
- [FeatureFilter](#featurefilter)

---

## layer.effect

A CSS-like filter string applied to the whole layer.

| Function | Example | Notes |
|---|---|---|
| `bloom(strength, radius, threshold)` | `bloom(1.5, 0.5px, 0.1)` | Glow |
| `blur(radius)` | `blur(2px)` | Needs a unit |
| `drop-shadow(x, y, blur, color)` | `drop-shadow(2px, 2px, 3px, #000)` | Shadow |
| `brightness(n)` / `grayscale(%)` / `opacity(%)` | `brightness(1.2)` | Chainable with spaces |

---

## FeatureEffect

`@arcgis/core/layers/support/FeatureEffect.js`

| Property | Type | Description |
|---|---|---|
| `filter` | `FeatureFilter` | Which features match |
| `includedEffect` | `string` | Effect for matched features |
| `excludedEffect` | `string` | Effect for non-matched features |

Assign to `layer.featureEffect`.

---

## FeatureFilter

`@arcgis/core/layers/support/FeatureFilter.js`

| Property | Type | Description |
|---|---|---|
| `where` | `string` | SQL filter |
| `geometry` | `Geometry` | Spatial filter |
| `spatialRelationship` | `string` | e.g. `"intersects"` |
| `timeExtent` | `TimeExtent` | Temporal filter |
