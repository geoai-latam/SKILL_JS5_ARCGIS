// snippet-scenelayer.ts — 3D object/building SceneLayer. Smoke-tested.
import SceneLayer from "@arcgis/core/layers/SceneLayer.js";

const layer = new SceneLayer({
  url: "https://tiles.arcgis.com/tiles/example/arcgis/rest/services/Buildings/SceneServer",
  popupEnabled: true,
});

export { layer };
