// snippet-related.ts — query related records from a FeatureLayer.
// Runtime-checked on SDK 5.1 (tests/runtime/casos/arcgis-tables-forms.ts).
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import RelationshipQuery from "@arcgis/core/rest/support/RelationshipQuery.js";

// San Diego service requests; relationship 0 is the comments table.
const layer = new FeatureLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0",
});

export async function relatedRecords(objectIds: number[]) {
  await layer.load();
  const rel = layer.relationships?.[0];
  if (!rel) return new Map<number, unknown[]>();
  const result = await layer.queryRelatedFeatures(
    new RelationshipQuery({ objectIds, relationshipId: rel.id, outFields: ["*"] }),
  );
  // Parents without related rows are not keys of the result.
  return new Map(objectIds.map((id) => [id, result[id]?.features ?? []]));
}

export { layer };
