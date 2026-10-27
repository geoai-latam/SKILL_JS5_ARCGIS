// snippet-tools.ts — sketch with shared snapping, and a measurement analysis (SDK 5.1). Smoke-tested.
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-sketch";
import "@arcgis/map-components/components/arcgis-snapping-controls";
import "@arcgis/map-components/components/arcgis-measurement";
import DistanceMeasurementAnalysis from "@arcgis/core/analysis/DistanceMeasurementAnalysis.js";
import type Polyline from "@arcgis/core/geometry/Polyline.js";
import type MapView from "@arcgis/core/views/MapView.js";

// The two components hold separate SnappingOptions until you share one.
export async function shareSnapping() {
  const sketch = document.querySelector("arcgis-sketch");
  const controls = document.querySelector("arcgis-snapping-controls");
  if (!sketch || !controls) return;
  await sketch.componentOnReady();
  controls.snappingOptions = sketch.snappingOptions;
}

export async function measure(view: MapView, line: Polyline) {
  const analysis = new DistanceMeasurementAnalysis({ geometry: line });
  view.analyses.add(analysis);
  const analysisView = await view.whenAnalysisView(analysis);
  return analysisView.type === "distance-measurement-view-2d" ? analysisView.result?.length : undefined;
}
