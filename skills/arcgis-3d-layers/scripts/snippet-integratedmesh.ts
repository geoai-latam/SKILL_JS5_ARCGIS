// snippet-integratedmesh.ts — IntegratedMeshLayer (reality-capture city mesh). Smoke-tested.
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer.js";

const layer = new IntegratedMeshLayer({
  url: "https://tiles.arcgis.com/tiles/example/arcgis/rest/services/CityMesh/SceneServer",
});

export { layer };
