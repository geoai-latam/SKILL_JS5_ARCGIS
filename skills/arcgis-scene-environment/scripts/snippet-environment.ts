// snippet-environment.ts — configure 3D lighting/atmosphere on a SceneView. Smoke-tested (SDK 5.1).
import SceneView from "@arcgis/core/views/SceneView.js";
import type Map from "@arcgis/core/Map.js";

export function makeScene(map: Map, instant = new Date("2026-06-21T15:00:00-05:00")) {
  const view = new SceneView({
    map,
    environment: {
      lighting: {
        type: "sun",
        date: instant, // without it the sun sits on 15 March at local noon
        directShadowsEnabled: true, // off by default
        cameraTrackingEnabled: false, // otherwise the date shifts as the camera moves
      },
      atmosphereEnabled: true,
      starsEnabled: true,
    },
  });
  return view;
}
