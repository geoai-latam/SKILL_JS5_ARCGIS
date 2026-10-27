# API Reference: Spatial Analysis

## Table of Contents

- [geoprocessor](#geoprocessor)
- [GP input types](#gp-input-types)
- [Statistics queries](#statistics-queries)

---

## geoprocessor

`@arcgis/core/rest/geoprocessor.js`

| Function | Returns | Use |
|---|---|---|
| `execute(url, params?, options?, requestOptions?)` | `Promise<object>` (`{ results, messages }`) | Synchronous GP task |
| `submitJob(url, params?, options?, requestOptions?)` | `Promise<JobInfo>` | Asynchronous GP task |

`JobInfo` (`rest/support/JobInfo.js`): `jobId`, `jobStatus`, `messages`, `waitForJobCompletion({ interval,
statusCallback })`, `fetchResultData(name)`, `cancelJob()`. `waitForJobCompletion()` **rejects with the JobInfo**
when the job fails (measured: `jobStatus` `job-failed`).

---

## GP input types

Read each parameter's `dataType` from `<task url>?f=json`:

| `dataType` | Pass |
|---|---|
| `GPFeatureRecordSetLayer` | `FeatureSet` (or its `toJSON()`); a single `Graphic` fails |
| `GPLinearUnit` | `new LinearUnit({ distance, units })`; a bare number fails |
| `GPString` / `GPDouble` / `GPLong` / `GPBoolean` | Plain values |
| `GPRasterDataLayer` (output) | Fetched with `fetchResultData(name)` |

---

## Statistics queries

`query.outStatistics` is an array of `StatisticDefinition`:

| Property | Type | Description |
|---|---|---|
| `statisticType` | `"count" \| "sum" \| "avg" \| "min" \| "max" \| "stddev"` | Aggregate |
| `onStatisticField` | `string` | Field to aggregate |
| `outStatisticFieldName` | `string` | Output alias (else the server names it, e.g. `sum_expr0`) |

Combine with `query.groupByFieldsForStatistics` for grouped results (one feature per group, geometry `null`; measured
51 groups for US states). Run via `layer.queryFeatures(query)`.
