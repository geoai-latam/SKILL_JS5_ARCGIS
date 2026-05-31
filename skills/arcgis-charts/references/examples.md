# Examples: Charts

## Example 1: Bar chart bound to a layer

**Use case:** count features by category.

```typescript
import "@arcgis/charts-components/dist/components/arcgis-chart";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });
const chartEl = document.querySelector("arcgis-chart") as { layer?: FeatureLayer; config?: unknown };
chartEl.layer = layer;
chartEl.config = { type: "bar", category: { field: "TYPE" }, aggregation: "count" };
```

**Notes:**

- Set both `layer` and `config`.
- Aggregate to keep the chart readable.

---

## Example 2: Time series line chart

**Use case:** values over time.

```typescript
const chartEl = document.querySelector("arcgis-chart") as { config?: unknown };
chartEl.config = { type: "line", x: { field: "DATE" }, y: { field: "VALUE" } };
```

**Notes:**

- Use a date field on the x-axis.
- Numeric field on the value axis.

---

## Example 3: Link selection to the map

**Use case:** highlight features when a bar is selected.

```typescript
const chartEl = document.querySelector("arcgis-chart");
chartEl?.addEventListener("arcgisSelectionComplete", (e) => {
  const detail = (e as CustomEvent).detail;
  console.log("selected objectIds:", detail);
  // apply to layerView.highlight(...) on the map
});
```

**Notes:**

- Use the selection event to drive map highlights.
- Conversely, filter the chart's layer from map selection.
