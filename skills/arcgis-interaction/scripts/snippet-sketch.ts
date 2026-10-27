// snippet-sketch.ts — draw geometries with SketchViewModel (SDK 5.1). Smoke-tested.
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import type MapView from "@arcgis/core/views/MapView.js";
import type { CreateEvent } from "@arcgis/core/widgets/Sketch/types.js";

export function startDrawing(view: MapView) {
  const layer = new GraphicsLayer();
  view.map?.add(layer);
  const sketch = new SketchViewModel({ view, layer });
  sketch.on("create", (event: CreateEvent) => {
    if (event.state === "complete") console.log("drew", event.graphic?.geometry?.type);
  });
  void sketch.create("polygon"); // returns a Promise in 5.x
  return sketch;
}
