// snippet-graphics.ts — GraphicsLayer with a client-side Graphic. Smoke-tested.
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";

const graphicsLayer = new GraphicsLayer();

const marker = new Graphic({
  geometry: new Point({ longitude: -74.08, latitude: 4.6 }),
  symbol: new SimpleMarkerSymbol({ color: "red", size: 10 }),
});

graphicsLayer.add(marker);

export { graphicsLayer };
