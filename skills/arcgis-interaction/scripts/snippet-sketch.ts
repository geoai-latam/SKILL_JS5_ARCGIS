// snippet-sketch.ts — draw geometries with SketchViewModel. Smoke-tested.
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import type MapView from "@arcgis/core/views/MapView.js";

interface SketchCreateEvent {
  state: "start" | "active" | "complete" | "cancel";
  graphic: { geometry: { type: string } | null };
}

export function startDrawing(view: MapView) {
  const layer = new GraphicsLayer();
  view.map?.add(layer);
  const sketch = new SketchViewModel({ view, layer });
  sketch.on("create", (event: SketchCreateEvent) => {
    if (event.state === "complete") console.log("drew", event.graphic.geometry?.type);
  });
  sketch.create("polygon");
  return sketch;
}
