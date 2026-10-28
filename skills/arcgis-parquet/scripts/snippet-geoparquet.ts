// snippet-geoparquet.ts — ParquetLayer (beta) from a URL with `data` (5.1). Smoke-tested; also run against
// SDK 5.1.27 (tests/runtime/casos/arcgis-parquet.ts). Esri's public sample file: 310 702 points, lng/lat
// columns detected on load. Add it to a MapView: a SceneView rejects the layer view.
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";

const layer = new ParquetLayer({
  data: new ParquetFilesData({
    urls: ["https://jsapi.maps.arcgis.com/sharing/rest/content/items/6ab6f959c1684eb5a54db91644a89747/data"],
  }),
  title: "Kansas water wells",
  outFields: ["COUNTY", "STATUS"], // what hit tests and popups get; without it a hit carries only __OBJECTID
});

/** Loads the layer and fails loudly where ParquetLayer stays silent. */
async function cargar(): Promise<ParquetLayer> {
  await layer.load();
  if (layer.isTable) throw new Error("no geometry found: declare geometryEncoding, geometryType and spatialReference");
  return layer;
}

export { layer, cargar };
