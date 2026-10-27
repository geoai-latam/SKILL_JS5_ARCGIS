// snippet-imagery.ts: ImageryLayer with an NDVI raster function (SDK 5.1). Smoke-tested.
// rasterFunctionUtils returns real NDVI (-1..1); the classic server "NDVI" function returns 0-200.
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
import * as rasterFunctionUtils from "@arcgis/core/layers/support/rasterFunctionUtils.js";

// Band ids are 0-based. Toronto sample: Blue 0, Green 1, Red 2, NIR 3. Landsat 8: Red 3, NIR 4.
const ndvi = rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 });
const layer = new ImageryLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Toronto/ImageServer",
  rasterFunction: ndvi,
});
export { layer };
