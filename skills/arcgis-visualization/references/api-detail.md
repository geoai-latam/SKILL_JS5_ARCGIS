# API Reference: Visualization

## Table of Contents

- [Renderers](#renderers)
- [Visual variables](#visual-variables)

---

## Renderers

| Class | Module | Key properties |
|---|---|---|
| `SimpleRenderer` | `renderers/SimpleRenderer.js` | `symbol`, `visualVariables` |
| `UniqueValueRenderer` | `renderers/UniqueValueRenderer.js` | `field`, `uniqueValueInfos`, `defaultSymbol` |
| `ClassBreaksRenderer` | `renderers/ClassBreaksRenderer.js` | `field`, `classBreakInfos`, `defaultSymbol` |
| `HeatmapRenderer` | `renderers/HeatmapRenderer.js` | `field?`, `colorStops`, `radius`, `maxDensity` |
| `DotDensityRenderer` | `renderers/DotDensityRenderer.js` | `dotValue`, `attributes` |

`uniqueValueInfos`: `{ value: string | number, symbol }[]`; values are matched case-sensitively, the `field` name is not.
`classBreakInfos`: `{ minValue, maxValue, symbol }[]` (keep contiguous; `maxValue` is inclusive).
Without `defaultSymbol`, features with no matching class or a null value are not drawn.

---

## Visual variables

`renderer.visualVariables` is an array of:

| Class | Module | Maps a field to |
|---|---|---|
| `ColorVariable` | `renderers/visualVariables/ColorVariable.js` | color via `stops` |
| `SizeVariable` | `renderers/visualVariables/SizeVariable.js` | size via `stops` |
| `OpacityVariable` | `renderers/visualVariables/OpacityVariable.js` | opacity |
| `RotationVariable` | `renderers/visualVariables/RotationVariable.js` | rotation |

`stops`: `{ value: number, color | size | opacity }[]`.
