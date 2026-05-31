// snippet-imagery.ts — ImageryLayer with a raster function. Smoke-tested.
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
import RasterFunction from "@arcgis/core/layers/support/RasterFunction.js";

const ndvi = new RasterFunction({
  functionName: "NDVI",
  functionArguments: { VisibleBandID: 2, InfraredBandID: 3 },
});

const layer = new ImageryLayer({
  url: "https://example.com/arcgis/rest/services/Landsat/ImageServer",
  rasterFunction: ndvi,
});

export { layer };
