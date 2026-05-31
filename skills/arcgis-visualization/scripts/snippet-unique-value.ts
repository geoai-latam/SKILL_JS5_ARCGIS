// snippet-unique-value.ts — UniqueValueRenderer (category symbology). Smoke-tested.
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";

const renderer = new UniqueValueRenderer({
  field: "TYPE",
  uniqueValueInfos: [
    { value: "residential", symbol: new SimpleFillSymbol({ color: "blue" }) },
    { value: "commercial", symbol: new SimpleFillSymbol({ color: "red" }) },
  ],
  defaultSymbol: new SimpleFillSymbol({ color: "gray" }),
});

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0", renderer });

export { layer, renderer };
