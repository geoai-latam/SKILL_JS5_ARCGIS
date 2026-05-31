// snippet-visual-variables.ts — SimpleRenderer driven by color + size visual variables.
// Smoke-tested.
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import ColorVariable from "@arcgis/core/renderers/visualVariables/ColorVariable.js";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable.js";

const renderer = new SimpleRenderer({
  symbol: new SimpleMarkerSymbol({ color: "gray" }),
  visualVariables: [
    new ColorVariable({
      field: "POP",
      stops: [
        { value: 0, color: "white" },
        { value: 100000, color: "red" },
      ],
    }),
    new SizeVariable({
      field: "POP",
      stops: [
        { value: 0, size: 4 },
        { value: 100000, size: 30 },
      ],
    }),
  ],
});

export { renderer };
