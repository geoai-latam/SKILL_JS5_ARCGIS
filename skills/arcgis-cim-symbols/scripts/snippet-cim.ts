// snippet-cim.ts — a multi-layer CIMSymbol built from CIM JSON. Smoke-tested.
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

export { symbol };
