// snippet-featurelayer-query.ts — FeatureLayer with a query. Smoke-tested.
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({
  url: "https://services.arcgis.com/example/arcgis/rest/services/Cities/FeatureServer/0",
  outFields: ["NAME", "POP"],
  definitionExpression: "POP > 100000",
});

export async function topCities() {
  const query = layer.createQuery();
  query.where = "POP > 1000000";
  query.orderByFields = ["POP DESC"];
  query.returnGeometry = true;
  query.num = 10; // pagination: page size
  query.start = 0; // pagination: offset
  const { features } = await layer.queryFeatures(query);
  return features.map((f) => f.attributes.NAME as string);
}

export { layer };
