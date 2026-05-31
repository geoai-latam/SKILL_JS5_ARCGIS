// snippet-gaussiansplat.ts — GaussianSplatLayer (new in 5.0): photorealistic 3D capture.
// Smoke-tested. Render in a SceneView.
import GaussianSplatLayer from "@arcgis/core/layers/GaussianSplatLayer.js";

const layer = new GaussianSplatLayer({
  url: "https://example.com/splats/site.ply",
});

export { layer };
