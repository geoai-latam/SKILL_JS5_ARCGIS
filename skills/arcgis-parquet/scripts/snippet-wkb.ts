// snippet-wkb.ts — a WKB column without GeoParquet metadata. Smoke-tested; run against SDK 5.1.27.
// All three properties are needed: without geometryType it stays "point"; without spatialReference every
// geometry is null. Neither case raises an error.
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";
import GeometryEncodingWkb from "@arcgis/core/layers/support/GeometryEncodingWkb.js";
import type Extent from "@arcgis/core/geometry/Extent.js";

const layer = new ParquetLayer({
  data: new ParquetFilesData({ urls: ["https://example.com/predios.parquet"] }),
  geometryEncoding: new GeometryEncodingWkb({ field: "geom" }),
  geometryType: "polygon",
  spatialReference: { wkid: 4326 },
});

/** fullExtent is null without GeoParquet metadata: compute it. */
async function extension(): Promise<Extent | null> {
  const { extent } = await layer.queryExtent();
  return extent;
}

export { layer, extension };
