// snippet-class-breaks.ts — ClassBreaksRenderer (graduated symbology). Smoke-tested.
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";

const renderer = new ClassBreaksRenderer({
  field: "POP",
  classBreakInfos: [
    { minValue: 0, maxValue: 1000, symbol: new SimpleMarkerSymbol({ color: "yellow", size: 6 }) },
    { minValue: 1000, maxValue: 1000000, symbol: new SimpleMarkerSymbol({ color: "red", size: 16 }) },
  ],
  defaultSymbol: new SimpleMarkerSymbol({ color: "gray", size: 4 }),
});

export { renderer };
