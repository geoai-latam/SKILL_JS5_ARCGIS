// snippet-wms.ts — OGC WMSLayer. Smoke-tested.
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";

const layer = new WMSLayer({
  url: "https://demo.mapserver.org/cgi-bin/wms",
  sublayers: [{ name: "cities" }],
});

export { layer };
