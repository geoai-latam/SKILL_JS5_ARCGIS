// snippet-mapimage.ts — dynamic MapImageLayer with sublayers. Smoke-tested.
import MapImageLayer from "@arcgis/core/layers/MapImageLayer.js";

const layer = new MapImageLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer",
  sublayers: [
    { id: 2, visible: true },
    { id: 1, visible: false },
  ],
});

export { layer };
