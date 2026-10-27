# Examples: Spatial Analysis

## Example 1: Synchronous GP tool

**Use case:** run a viewshed (public sample service).

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";
import LinearUnit from "@arcgis/core/rest/support/LinearUnit.js";

const result = (await geoprocessor.execute(gpUrl, {
  Input_Observation_Point: new FeatureSet({ features: [observerGraphic] }),
  Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }),
})) as { results: Array<{ paramName: string; value: FeatureSet }> };
const viewshed = result.results.find((p) => p.paramName === "Viewshed_Result")?.value;
```

**Notes:**

- `execute` is for synchronous services.
- Measured: 73 viewshed polygons for a point in San Francisco; a bare `5000` for the distance failed.

---

## Example 2: Asynchronous job

**Use case:** a hotspot analysis (public sample service).

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
import type JobInfo from "@arcgis/core/rest/support/JobInfo.js";

const job = await geoprocessor.submitJob(asyncGpUrl, { Query: "\"DATE\" > date '1998-01-01 00:00:00'" });
try {
  await job.waitForJobCompletion({ interval: 1500 });
  const output = await job.fetchResultData("Hotspot_Raster");
} catch (failed) {
  console.error((failed as JobInfo).jobStatus); // "job-failed"
}
```

**Notes:**

- Use `submitJob` for async services.
- A failed job rejects with the JobInfo.

---

## Example 3: Statistics query

**Use case:** total population by region without downloading features.

```typescript
const q = layer.createQuery();
q.outStatistics = [
  { statisticType: "sum", onStatisticField: "POP", outStatisticFieldName: "total" },
];
q.groupByFieldsForStatistics = ["REGION"];
q.orderByFields = ["total DESC"];
const { features } = await layer.queryFeatures(q);
```

**Notes:**

- `outStatistics` + `groupByFieldsForStatistics` aggregates server-side, over every row (no 1000-row cap).
- Returns one feature per group, with `geometry` `null`.
