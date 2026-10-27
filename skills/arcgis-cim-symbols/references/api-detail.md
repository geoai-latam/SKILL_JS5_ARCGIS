# API Reference: CIM Symbols

## Table of Contents

- [CIMSymbol](#cimsymbol)
- [CIM structure](#cim-structure)
- [Common symbol layers](#common-symbol-layers)
- [Primitive overrides](#primitive-overrides)
- [Utilities](#utilities)

---

## CIMSymbol

`@arcgis/core/symbols/CIMSymbol.js`

| Property | Type | Description |
|---|---|---|
| `data` | `CIMSymbolReference` | The CIM JSON payload (types in `@arcgis/core/symbols/cim/types.js`) |

---

## CIM structure

```text
CIMSymbolReference              (primitiveOverrides live here)
└── symbol: CIMPointSymbol | CIMLineSymbol | CIMPolygonSymbol
    └── symbolLayers: CIMSymbolLayer[]   ([0] draws on top)
```

| Symbol type | Used for |
|---|---|
| `CIMPointSymbol` | Points / markers |
| `CIMLineSymbol` | Lines |
| `CIMPolygonSymbol` | Polygon fills/outlines |

---

## Common symbol layers

| Layer type | Purpose | Key fields |
|---|---|---|
| `CIMVectorMarker` | Custom marker geometry | `size` (points), `frame`, `markerGraphics`, `markerPlacement` |
| `CIMPictureMarker` | Image marker | `url`, `size` |
| `CIMSolidFill` | Polygon fill | `enable`, `color` (RGBA, alpha 0–255) |
| `CIMSolidStroke` | Line/outline | `enable`, `width` (points), `color` |
| `CIMMarkerGraphic` | A graphic inside a vector marker | `geometry` (frame units), `symbol` |

`enable` is required by the typings; at runtime an omitted `enable` still draws and only
`enable: false` hides the layer (measured).

---

## Primitive overrides

| Field | Value |
|---|---|
| `type` | `"CIMPrimitiveOverride"` |
| `primitiveName` | The `primitiveName` set on a symbol layer |
| `propertyName` | Proper case: `"Size"`, `"Color"`, `"TextString"`… |
| `valueExpressionInfo` | `{ type: "CIMExpressionInfo", title, expression, returnType: "Default" }` |

---

## Utilities

| Module | Functions |
|---|---|
| `symbols/support/cimSymbolUtils.js` | `getCIMSymbolSize`, `scaleCIMSymbolTo`, `getCIMSymbolColor`, `applyCIMSymbolColor`, `getCIMSymbolRotation`, `applyCIMSymbolRotation` |
| `symbols/support/symbolUtils.js` | `renderPreviewHTML(symbol)` |

New in 5.1 (beta): `CIMSymbolAnimationMoveAlongLine` (on a `CIMVectorMarker` inside a
`CIMLineSymbol`, `movementType: "Distance" | "Speed"`) and `CIMMarkerPlacementAtMeasuredUnits`.
In 5.1.27 the `CIMSymbolAnimation` union type does not list `MoveAlongLine` yet, so a typed object
needs a cast.
