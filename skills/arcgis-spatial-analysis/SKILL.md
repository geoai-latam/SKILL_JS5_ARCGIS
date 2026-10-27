---
name: arcgis-spatial-analysis
description: >
  Run server-side spatial analysis with the ArcGIS Maps SDK for JavaScript 5.1:
  geoprocessing services via the geoprocessor module (execute for synchronous
  tasks, submitJob for asynchronous ones), typed GP inputs (FeatureSet,
  LinearUnit), failed jobs (waitForJobCompletion rejects with the JobInfo), and
  summary statistics with outStatistics instead of downloading capped features.
  Use this skill whenever the user runs a GP tool, a viewshed/hotspot/enrichment
  task, or computes aggregate statistics over features.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: spatial
tags:
  - geoprocessing
  - geoprocessor
  - statistics
  - analysis
  - jobs
requires:
  - arcgis-rest-services
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Spatial Analysis

> **When to use:** Activate this skill whenever the user runs a geoprocessing tool/job or computes
> aggregate statistics over features.

## Overview

Heavy analysis runs on a server via geoprocessing; aggregation runs as statistics queries.

- **Problem it solves:** analysis too heavy or proprietary for client-side geometry.
- **Who it serves:** developers running GP models, enrichment, and statistics.
- **Pattern it teaches:** `execute` for synchronous tasks, `submitJob` for asynchronous ones, typed inputs.
- **What it does NOT cover:** client geometry (see `arcgis-geometry-operations`) or routing (see `arcgis-rest-services`).

## Quick Start

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";
import LinearUnit from "@arcgis/core/rest/support/LinearUnit.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";

const VIEWSHED = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed";
const observer = new FeatureSet({ features: [new Graphic({ geometry: new Point({ longitude: -122.42, latitude: 37.77 }) })] });
const { results } = (await geoprocessor.execute(VIEWSHED, {
  Input_Observation_Point: observer,                                   // GPFeatureRecordSetLayer → FeatureSet
  Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }), // GPLinearUnit → LinearUnit
})) as { results: Array<{ paramName: string; value: FeatureSet }> };
const viewshed = results.find((p) => p.paramName === "Viewshed_Result")?.value; // 73 polygons, measured
```

## Decision Tree

1. **What does the task page say under "Execution Type"?**
   - `esriExecutionTypeSynchronous` → `geoprocessor.execute(url, params)`.
   - `esriExecutionTypeAsynchronous` → `geoprocessor.submitJob(url, params)` + `waitForJobCompletion()` +
     `fetchResultData(name)`.

2. **Each input's `dataType` on the same page?**
   - `GPFeatureRecordSetLayer` → `FeatureSet`; `GPLinearUnit` → `LinearUnit`; `GPString`/`GPDouble` → plain values.

3. **Just aggregates over features?**
   - Yes → a statistics query (`outStatistics`), not a GP task and not a client-side loop.

**Default:** read the task's REST page first (`<task url>?f=json`): execution type, parameter names and data types.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
```

### Dynamic Imports (CDN)

```javascript
const geoprocessor = await $arcgis.import("@arcgis/core/rest/geoprocessor.js");
```

### Map Components (recommended for new projects)

```typescript
// Feed inputs from the component view (sketch/query); render outputs as layers or graphics.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: execute vs submitJob

The service decides. Measured with 5.1.27: `execute` on an asynchronous task failed with
`Error performing execute operation`. An asynchronous job went `job-executing` → `job-succeeded`, and
`fetchResultData("Hotspot_Raster")` returned a `raster-data-layer` parameter.

### Concept 2: Parameters are typed by the service

Inputs are keyed by the task's parameter names and must match its `dataType`. Measured: the server matched names
case-insensitively (`input_observation_point` worked), but a misspelled name, a bare number for a `GPLinearUnit` or
a single `Graphic` for a `GPFeatureRecordSetLayer` all failed with the same `Unable to complete operation.`, which
names neither the parameter nor the problem. A `FeatureSet` and its `toJSON()` both worked.

### Concept 3: Results

`execute` resolves to `{ results, messages }`; each result is a parameter value with `paramName`, `dataType` and
`value` (a real `FeatureSet` for feature outputs, measured). Find outputs by `paramName`, not by index.

## Common Pitfalls (Top 3)

### Pitfall 1: Aggregating features on the client

```typescript
// ❌ Anti-pattern
const { features } = await layer.queryFeatures({ where: "1=1", outFields: ["POP"] });
const total = features.reduce((s, f) => s + f.attributes.POP, 0);
```

```typescript
// ✅ Correct
const q = layer.createQuery();
q.outStatistics = [{ statisticType: "sum", onStatisticField: "POP", outStatisticFieldName: "total" }];
const total = (await layer.queryFeatures(q)).features[0].attributes.total;
```

**Impact:** measured on US cities: the client loop summed **54,124,707** from the first 1000 rows
(`exceededTransferLimit: true`); the statistics query returned the real **165,628,942**. It is a wrong number, not
just a slow one.

### Pitfall 2: Plain values for typed GP inputs

```typescript
// ❌ Anti-pattern
geoprocessor.execute(VIEWSHED, { Input_Observation_Point: graphic, Viewshed_Distance: 5000 });
```

```typescript
// ✅ Correct
geoprocessor.execute(VIEWSHED, {
  Input_Observation_Point: new FeatureSet({ features: [graphic] }),
  Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }),
});
```

**Impact:** measured: each of those two plain values made the task fail with `Unable to complete operation.`. Check
each parameter's `dataType` on the task page.

### Pitfall 3: Treating a failed job as a resolved one

```typescript
// ❌ Anti-pattern
const done = await job.waitForJobCompletion();
if (done.jobStatus !== "job-succeeded") showError(done.jobStatus); // never runs on failure
```

```typescript
// ✅ Correct
try {
  await job.waitForJobCompletion();
} catch (failed) {
  const info = failed as JobInfo; // it rejects with the JobInfo, not an Error
  showError(info.jobStatus, info.messages.at(-1)?.description);
}
```

**Impact:** measured: a job with an invalid input rejected with a `JobInfo` (`jobStatus` `job-failed`, last message
`Failed.`). `e.message` is `undefined`, so a generic error handler shows nothing useful.

## When to Read references/

| If you need... | Read |
|---|---|
| geoprocessor / statistics signatures | `references/api-detail.md` |
| GP + statistics examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-rest-services` — other REST tasks (route, locator)
- `arcgis-geometry-operations` — client-side geometry
- `arcgis-layers` — the layers you analyze

## Reference Samples

- [Geoprocessing](https://developers.arcgis.com/javascript/latest/sample-code/)
- [Query statistics](https://developers.arcgis.com/javascript/latest/api-reference/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Measured against public GP services in
  `tests/runtime/casos/arcgis-spatial-analysis.ts`. The old example and snippet passed `Viewshed_Distance: 5000`, which
  fails (`GPLinearUnit` needs a `LinearUnit`). The old failed-job pitfall checked `jobStatus` after
  `waitForJobCompletion()`, but a failed job rejects with the JobInfo. The client-side sum is not just slow but wrong
  (54 M of 165 M, capped at 1000 rows). Parameter names were not case-sensitive on the server; their spelling and
  type are what fail, with an opaque message. Replaced the comment-only auth pitfall.
- **0.1.0** (2026-05-31): Initial release.
