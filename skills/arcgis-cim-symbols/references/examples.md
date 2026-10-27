# Examples: CIM Symbols

## Example 1: A simple filled vector marker

**Use case:** a red square marker built from CIM JSON.

```typescript
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";

const symbol = new CIMSymbol({
  data: {
    type: "CIMSymbolReference",
    symbol: {
      type: "CIMPointSymbol",
      symbolLayers: [
        {
          type: "CIMVectorMarker",
          enable: true,
          size: 20,
          frame: { xmin: 0, ymin: 0, xmax: 16, ymax: 16 },
          markerGraphics: [
            {
              type: "CIMMarkerGraphic",
              geometry: { rings: [[[0, 0], [16, 0], [16, 16], [0, 16], [0, 0]]] },
              symbol: {
                type: "CIMPolygonSymbol",
                symbolLayers: [{ type: "CIMSolidFill", enable: true, color: [255, 0, 0, 255] }],
              },
            },
          ],
        },
      ],
    },
  },
});
```

**Notes:**

- `frame` defines the marker's coordinate space.
- Geometry rings use the frame coordinates.

---

## Example 2: Stacking two layers

**Use case:** a filled marker with an outline.

```typescript
// Inside the CIMPolygonSymbol.symbolLayers: the FIRST layer draws ON TOP.
const symbolLayers = [
  { type: "CIMSolidStroke", enable: true, width: 1.5, color: [0, 0, 0, 255] }, // outline, on top
  { type: "CIMSolidFill", enable: true, color: [255, 0, 0, 255] },             // fill, below
];
```

**Notes:**

- Measured with 5.1.27: with a red layer at `[0]` and a blue one at `[1]` of the same size, the
  centre is red. Putting the fill first hides half of the outline.

---

## Example 3: Size from data with a primitive override

**Use case:** one CIM symbol whose marker size comes from a field.

```typescript
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";

const symbol = new CIMSymbol({
  data: {
    type: "CIMSymbolReference",
    primitiveOverrides: [{
      type: "CIMPrimitiveOverride",
      primitiveName: "marcador",
      propertyName: "Size", // Proper case: "size" is ignored
      valueExpressionInfo: { type: "CIMExpressionInfo", title: "size from s", expression: "$feature.s", returnType: "Default" },
    }],
    symbol: {
      type: "CIMPointSymbol",
      symbolLayers: [{
        type: "CIMVectorMarker",
        enable: true,
        primitiveName: "marcador",
        size: 10,
        frame: { xmin: 0, ymin: 0, xmax: 16, ymax: 16 },
        markerGraphics: [{
          type: "CIMMarkerGraphic",
          geometry: { rings: [[[0, 0], [16, 0], [16, 16], [0, 16], [0, 0]]] },
          symbol: { type: "CIMPolygonSymbol", symbolLayers: [{ type: "CIMSolidFill", enable: true, color: [255, 0, 0, 255] }] },
        }],
      }],
    },
  },
});
layer.renderer = new SimpleRenderer({ symbol });
```

**Notes:**

- Measured on a MapView: features with `s` = 8 and 40 paint 132 and 2970 px.
- The field must be in the layer's data; on a service layer, add it to `outFields` if nothing else
  requests it.

---

## Example 4: Change a built symbol without touching the JSON

```typescript
import * as cimSymbolUtils from "@arcgis/core/symbols/support/cimSymbolUtils.js";
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import Color from "@arcgis/core/Color.js";
import type CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";

declare const symbol: CIMSymbol;
cimSymbolUtils.scaleCIMSymbolTo(symbol, 40);                 // 20 → 40 pt
cimSymbolUtils.applyCIMSymbolColor(symbol, new Color("#0077b6"));
const preview = await symbolUtils.renderPreviewHTML(symbol); // an <img>: does it paint?
document.body.append(preview);
```
