// snippet-sceneview.ts — 3D SceneView via the Core API. Smoke-tested with tsc --noEmit.
import Map from "@arcgis/core/Map.js";
import SceneView from "@arcgis/core/views/SceneView.js";

const map = new Map({
  basemap: "arcgis/imagery",
  ground: "world-elevation",
});

const view = new SceneView({
  container: "viewDiv",
  map,
  camera: {
    position: { longitude: -74.08, latitude: 4.6, z: 8000 },
    tilt: 65,
  },
});

view.when(() => {
  console.log("SceneView ready");
});

export { map, view };
