// snippet-gaussiansplat.ts — GaussianSplatLayer (5.0): photorealistic 3D capture.
// Smoke-tested; also run against SDK 5.1.27 (tests/runtime/casos/arcgis-3d-layers.ts).
// The source is a published 3D Tiles service, not a .ply file. Render in a SceneView.
import GaussianSplatLayer from "@arcgis/core/layers/GaussianSplatLayer.js";

const layer = new GaussianSplatLayer({
  url: "https://tiles.arcgis.com/tiles/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Portcoast_industrial/3DTilesServer/tileset.json",
});

export { layer };
