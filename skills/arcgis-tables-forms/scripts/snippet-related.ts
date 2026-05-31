// snippet-related.ts — query related records from a FeatureLayer. Smoke-tested.
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import RelationshipQuery from "@arcgis/core/rest/support/RelationshipQuery.js";

const layer = new FeatureLayer({
  url: "https://services.arcgis.com/example/arcgis/rest/services/Assets/FeatureServer/0",
});

export async function relatedInspections(objectId: number, relationshipId: number) {
  const query = new RelationshipQuery({
    objectIds: [objectId],
    relationshipId,
    outFields: ["*"],
  });
  const result = await layer.queryRelatedFeatures(query);
  return result[objectId]?.features ?? [];
}

export { layer };
