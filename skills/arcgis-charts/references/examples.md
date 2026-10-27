# Examples: Charts

## Example 1: Bar chart bound to a layer

**Use case:** count features by category.

```typescript
import "@arcgis/charts-components/components/arcgis-chart";
import { createModel } from "@arcgis/charts-components/model/shared/setup-utils";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2",
});
const model = await createModel({ layer, chartType: "barChart" });
model.xAxisField = "sub_region";
model.aggregationType = "count";

const chartEl = document.querySelector("arcgis-chart")!;
chartEl.addEventListener("arcgisDataProcessComplete", () => console.log("chart data ready"));
chartEl.layer = layer;
chartEl.model = model;
```

**Notes:**

- Checked against SDK 5.1.27 with Calcite 5.1.2: `arcgisDataProcessComplete` fires
  (`tests/runtime/casos/arcgis-charts.ts`).
- Give the element a size in CSS; it does not size itself.

---

## Example 2: Time series line chart

**Use case:** values over time.

```typescript
import { createModel } from "@arcgis/charts-components/model/shared/setup-utils";

const chartEl = document.querySelector("arcgis-chart")!;
if (layer.getField("REPORT_DATE")?.type !== "date") throw new Error("not a date field");
const model = await createModel({ layer, chartType: "lineChart" });
model.xAxisField = "REPORT_DATE";
model.binTemporalData = true; // group dates into periods
model.numericFields = ["CASES"];
model.aggregationType = "sum";
chartEl.layer = layer;
chartEl.model = model;
```

**Notes:**

- The model accepts a string field as `xAxisField` without complaint (measured), so check the
  field type yourself before building a time series.

---

## Example 3: Link selection to the map

**Use case:** select bars and see those features selected on the map, and the other way around.

```typescript
const chartEl = document.querySelector("arcgis-chart")!;
chartEl.view = view;              // the view of <arcgis-map> (viewElement.view)
chartEl.syncViewSelection = true; // 5.1
chartEl.addEventListener("arcgisSelectionComplete", (e) => {
  console.log("selected:", e.detail.selectionData);
});
```

**Notes:**

- `syncViewSelection` replaces `syncSelectionsBetweenChartAndLayerViewPolicy` (deprecated in 5.1).
- Without `view` the chart cannot reach the map's layer view.
