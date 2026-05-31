# API Reference: CIM Symbols

## Table of Contents

- [CIMSymbol](#cimsymbol)
- [CIM structure](#cim-structure)
- [Common symbol layers](#common-symbol-layers)

---

## CIMSymbol

`@arcgis/core/symbols/CIMSymbol.js`

| Property | Type | Description |
|---|---|---|
| `data` | `CIMSymbolReference` | The CIM JSON payload |

---

## CIM structure

```text
CIMSymbolReference
└── symbol: CIMPointSymbol | CIMLineSymbol | CIMPolygonSymbol
    └── symbolLayers: CIMSymbolLayer[]   (drawn bottom → top)
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
| `CIMVectorMarker` | Custom marker geometry | `size`, `frame`, `markerGraphics` |
| `CIMSolidFill` | Polygon fill | `enable`, `color` (RGBA 0–255) |
| `CIMSolidStroke` | Line/outline | `enable`, `width`, `color` |
| `CIMMarkerGraphic` | A graphic inside a vector marker | `geometry`, `symbol` |

Primitive overrides bind a symbol property to an Arcade expression via `primitiveOverrides`.
