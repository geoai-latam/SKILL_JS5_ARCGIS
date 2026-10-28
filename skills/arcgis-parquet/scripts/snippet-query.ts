// snippet-query.ts — reading every row of a ParquetLayer. Smoke-tested; run against SDK 5.1.27.
// queryFeatures stops at capabilities.query.maxRecordCount (8000) and exceededTransferLimit stays false,
// so page by the count. Values in `where` are case-sensitive; start from createQuery() so the
// layer's definitionExpression is kept.
import type ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import type Graphic from "@arcgis/core/Graphic.js";

export async function todas(layer: ParquetLayer, where: string, outFields: string[]): Promise<Graphic[]> {
  const base = layer.createQuery();
  base.where = `(${base.where}) AND (${where})`;
  const total = await layer.queryFeatureCount(base);
  const size = layer.capabilities?.query?.maxRecordCount ?? 8000;
  const out: Graphic[] = [];
  for (let start = 0; start < total; start += size) {
    const q = base.clone();
    q.start = start;
    q.num = size;
    q.outFields = outFields;
    q.returnGeometry = false;
    out.push(...(await layer.queryFeatures(q)).features);
  }
  return out;
}
