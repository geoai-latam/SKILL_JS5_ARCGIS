// snippet-wms.ts — OGC WMSLayer. Smoke-tested.
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";

const layer = new WMSLayer({
  url: "https://example.com/geoserver/wms",
  sublayers: [{ name: "topp:states" }],
});

export { layer };
