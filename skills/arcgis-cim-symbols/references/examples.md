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

**Use case:** a filled marker with an outline by adding a stroke layer.

```typescript
// Inside the CIMPolygonSymbol.symbolLayers, draw bottom → top:
const symbolLayers = [
  { type: "CIMSolidFill", enable: true, color: [255, 0, 0, 255] },
  { type: "CIMSolidStroke", enable: true, width: 1.5, color: [0, 0, 0, 255] },
];
```

**Notes:**

- Order matters: later layers draw on top.
- Combine fills and strokes for outlined symbols.

---

## Example 3: Using the CIM symbol in a renderer

**Use case:** apply a CIM symbol to a whole layer.

```typescript
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";

const symbol = new CIMSymbol({ data: { type: "CIMSymbolReference", symbol: { type: "CIMPointSymbol", symbolLayers: [] } } });
layer.renderer = new SimpleRenderer({ symbol });
```

**Notes:**

- CIM symbols plug into any renderer's `symbol`.
- Pair with `primitiveOverrides` for data-driven details.
