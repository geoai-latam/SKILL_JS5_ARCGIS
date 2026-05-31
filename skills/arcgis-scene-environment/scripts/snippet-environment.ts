// snippet-environment.ts — configure 3D lighting/atmosphere on a SceneView. Smoke-tested.
import SceneView from "@arcgis/core/views/SceneView.js";
import type Map from "@arcgis/core/Map.js";

export function makeScene(map: Map) {
  const view = new SceneView({
    map,
    environment: {
      lighting: { type: "sun", directShadowsEnabled: true },
      atmosphereEnabled: true,
      starsEnabled: true,
    },
  });
  return view;
}
