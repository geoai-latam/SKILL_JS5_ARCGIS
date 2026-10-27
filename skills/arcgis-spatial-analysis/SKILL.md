---
name: arcgis-spatial-analysis
description: >
  Run server-side spatial analysis with the ArcGIS Maps SDK for JavaScript 5.0:
  geoprocessing services via the geoprocessor module (execute and submitJob for
  async jobs), plus summary statistics from FeatureLayer queries. Use this skill
  whenever the user runs a GP tool, a viewshed/hotspot/enrichment task, or computes
  aggregate statistics over features.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Spatial Analysis

> **When to use:** Activate this skill whenever the user runs a geoprocessing tool/job or computes
> aggregate statistics over features.

## Overview

Heavy analysis runs on a server via geoprocessing; light aggregation runs as statistic queries.

- **Problem it solves:** analysis too heavy or proprietary for client-side geometry.
- **Who it serves:** developers running GP models, enrichment, and statistics.
- **Pattern it teaches:** `execute` for fast tools, `submitJob` for long async jobs.
- **What it does NOT cover:** client geometry (see `arcgis-geometry-operations`) or routing (see `arcgis-rest-services`).

## Quick Start

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
const result = await geoprocessor.execute(gpUrl, { Input: value });
```

## Decision Tree

1. **Is the GP task synchronous (fast)?**
   - Yes → `geoprocessor.execute(url, params)`.

2. **Is it a long-running task?**
   - Yes → `geoprocessor.submitJob(url, params)` then poll/`waitForJobCompletion`.

3. **Just aggregates over features?**
   - Yes → a statistics query (`outStatistics`) on the FeatureLayer.

**Default:** `execute` for quick tools; `submitJob` for anything that can take seconds+.

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
// Feed inputs from the component view (sketch/query); render outputs as layers.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: execute vs submitJob

`execute` returns results directly (synchronous GP services). `submitJob` returns a job you poll
(asynchronous services); fetch outputs once it completes.

### Concept 2: Parameter names

GP inputs are keyed by the tool's exact parameter names (case-sensitive), e.g.
`Input_Observation_Point`. Read the service page to get them right.

### Concept 3: Statistics queries

For counts/sums/averages, set `query.outStatistics` (StatisticDefinition[]) and optionally
`groupByFieldsForStatistics` — far cheaper than downloading features.

## Common Pitfalls (Top 3)

### Pitfall 1: Using execute on an async service

```typescript
// ❌ Anti-pattern
const r = await geoprocessor.execute(asyncGpUrl, params); // times out / errors
```

```typescript
// ✅ Correct
const job = await geoprocessor.submitJob(asyncGpUrl, params);
const result = await job.waitForJobCompletion();
```

**Impact:** the call fails because the service only supports jobs.

### Pitfall 2: Wrong parameter names

```typescript
// ❌ Anti-pattern
geoprocessor.execute(url, { input: 5 }); // tool expects "Input_Field"
```

```typescript
// ✅ Correct
geoprocessor.execute(url, { Input_Field: 5 });
```

**Impact:** the tool ignores the input or errors.

### Pitfall 3: Downloading features just to count them

```typescript
// ❌ Anti-pattern
const { features } = await layer.queryFeatures();
const total = features.reduce((s, f) => s + f.attributes.POP, 0);
```

```typescript
// ✅ Correct
const q = layer.createQuery();
q.outStatistics = [{ statisticType: "sum", onStatisticField: "POP", outStatisticFieldName: "total" }];
const { features } = await layer.queryFeatures(q);
```

**Impact:** huge downloads when a single statistics query would do.

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

- **0.1.0** (2026-05-31): Initial release.
