// snippet-unique-value.ts — UniqueValueRenderer (category symbology). Smoke-tested.
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";

const renderer = new UniqueValueRenderer({
  field: "sub_region",
  uniqueValueInfos: [
    { value: "Pacific", symbol: new SimpleFillSymbol({ color: "blue" }) },
    { value: "Mtn", symbol: new SimpleFillSymbol({ color: "red" }) },
  ],
  defaultSymbol: new SimpleFillSymbol({ color: "gray" }), // the other seven sub-regions
});

// USA states, a public service; values are matched with their exact case.
const layer = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2", renderer });

export { layer, renderer };
