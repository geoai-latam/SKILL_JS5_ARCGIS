# API Reference: Spatial Analysis

## Table of Contents

- [geoprocessor](#geoprocessor)
- [Statistics queries](#statistics-queries)

---

## geoprocessor

`@arcgis/core/rest/geoprocessor.js`

| Function | Returns | Use |
|---|---|---|
| `execute(url, params, options?)` | `Promise<object>` | Synchronous GP service |
| `submitJob(url, params, options?)` | `Promise<JobInfo>` | Asynchronous GP service |

`JobInfo` exposes `waitForJobCompletion()`, `fetchResultData(name)`, and `jobStatus`.

Result objects from `execute` are loosely typed (`object`) — cast to the tool's known shape.

---

## Statistics queries

`query.outStatistics` is an array of `StatisticDefinition`:

| Property | Type | Description |
|---|---|---|
| `statisticType` | `"count" \| "sum" \| "avg" \| "min" \| "max" \| "stddev"` | Aggregate |
| `onStatisticField` | `string` | Field to aggregate |
| `outStatisticFieldName` | `string` | Output alias |

Combine with `query.groupByFieldsForStatistics` for grouped results. Run via
`layer.queryFeatures(query)`.
