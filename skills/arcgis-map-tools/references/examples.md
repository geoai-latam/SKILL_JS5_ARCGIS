# Examples: Map Tools

## Example 1: Sketch with working snapping

**Use case:** draw parcels that snap to existing ones.

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="15">
  <arcgis-sketch slot="top-right"></arcgis-sketch>
  <arcgis-snapping-controls slot="bottom-right"></arcgis-snapping-controls>
</arcgis-map>
```

```typescript
import FeatureSnappingLayerSource from "@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource.js";

const sketch = document.querySelector("arcgis-sketch")!;
const controls = document.querySelector("arcgis-snapping-controls")!;
await sketch.componentOnReady();
controls.snappingOptions = sketch.snappingOptions;
sketch.snappingOptions.featureSources.add(new FeatureSnappingLayerSource({ layer: parcels, enabled: true }));
```

**Notes:**

- Without the assignment the controls edit a different object (measured).
- Feature snapping needs at least one source.

---

## Example 2: 2D distance measurement in kilometers

**Use case:** a distance tool with a fixed unit.

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="12">
  <arcgis-distance-measurement-2d slot="top-left" unit="kilometers" hide-unit-select></arcgis-distance-measurement-2d>
</arcgis-map>
```

**Notes:**

- The default `unit` is the `"metric"` system, which switches m/km by size.

---

## Example 3: Measure in code, no UI

**Use case:** the geodesic length of a route you already have.

```typescript
import DistanceMeasurementAnalysis from "@arcgis/core/analysis/DistanceMeasurementAnalysis.js";

const analysis = new DistanceMeasurementAnalysis({ geometry: route });
view.analyses.add(analysis);
const analysisView = await view.whenAnalysisView(analysis);
// whenAnalysisView returns a union: narrow it; the result may take a frame (watch it or wait for !updating)
if (analysisView.type === "distance-measurement-view-2d") console.log(analysisView.result?.length);
```

**Notes:**

- Measured: a 0.05° line at 4.6°N gave 5.5 km (geodesic).
- For a number only, `geodeticLengthOperator` (see `arcgis-geometry-operations`) avoids the view.
