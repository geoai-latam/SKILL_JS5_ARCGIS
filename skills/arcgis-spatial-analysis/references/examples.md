# Examples: Spatial Analysis

## Example 1: Synchronous GP tool

**Use case:** run a fast viewshed.

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";

const result = (await geoprocessor.execute(gpUrl, {
  Input_Observation_Point: observerJson,
  Viewshed_Distance: 5000,
})) as { results: Array<{ paramName: string; value: unknown }> };
```

**Notes:**

- `execute` is for synchronous services.
- Cast the loosely-typed result to the tool's shape.

---

## Example 2: Asynchronous job

**Use case:** a long hotspot analysis.

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";

const job = await geoprocessor.submitJob(asyncGpUrl, { Input_Features: fsJson });
await job.waitForJobCompletion();
const output = await job.fetchResultData("Output_Features");
```

**Notes:**

- Use `submitJob` for async services.
- Poll or await completion before reading outputs.

---

## Example 3: Statistics query

**Use case:** total population by region without downloading features.

```typescript
const q = layer.createQuery();
q.outStatistics = [
  { statisticType: "sum", onStatisticField: "POP", outStatisticFieldName: "total" },
];
q.groupByFieldsForStatistics = ["REGION"];
const { features } = await layer.queryFeatures(q);
```

**Notes:**

- `outStatistics` + `groupByFieldsForStatistics` aggregates server-side.
- Returns one feature per group with the computed values.
