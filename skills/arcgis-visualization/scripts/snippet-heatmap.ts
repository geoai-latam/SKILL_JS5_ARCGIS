// snippet-heatmap.ts — HeatmapRenderer (point density). Smoke-tested.
import HeatmapRenderer from "@arcgis/core/renderers/HeatmapRenderer.js";

const renderer = new HeatmapRenderer({
  radius: 18,
  maxDensity: 0.04,
  minDensity: 0,
  colorStops: [
    { ratio: 0, color: "rgba(0, 0, 255, 0)" },
    { ratio: 0.5, color: "rgba(0, 255, 0, 0.8)" },
    { ratio: 1, color: "rgb(255, 0, 0)" },
  ],
});

export { renderer };
