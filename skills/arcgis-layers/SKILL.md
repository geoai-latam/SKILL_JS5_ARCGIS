---
name: arcgis-layers
description: >
  Add and query data layers with the ArcGIS Maps SDK for JavaScript 5.1:
  FeatureLayer, GeoJSONLayer, CSVLayer, GraphicsLayer, and TileLayer. Covers
  queryFeatures with createQuery (which carries definitionExpression; a plain
  where drops it), the silent maxRecordCount cap and exceededTransferLimit,
  pagination (start/num), outFields, and load errors. Use this skill whenever the
  user adds data to a map, queries features, or filters/loads a layer.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: layers
tags:
  - featurelayer
  - geojson
  - query
  - graphicslayer
  - tilelayer
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Layers

> **When to use:** Activate this skill whenever the user adds data to a map, runs a feature query,
> filters with a definition expression, or loads GeoJSON/CSV/graphics/tiles.

## Overview

Layers are the data you put on a map. Pick the layer type by data source, then query and filter it on the server.

- **Problem it solves:** loading the right layer type and reading its features correctly and efficiently.
- **Who it serves:** developers adding operational data to a map or scene.
- **Pattern it teaches:** source-driven layer choice, `createQuery()` for every read, server-side filters, paging.
- **What it does NOT cover:** symbology (see `arcgis-visualization`) or 3D layers (see `arcgis-3d-layers`).

## Quick Start

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0", outFields: ["NAME", "POP"] });
map.add(layer);

const query = layer.createQuery(); // starts from the layer's definitionExpression
query.where = `(${query.where}) AND POP > 1000000`; // add to it, do not overwrite it
query.outFields = ["NAME", "POP"];
const { features, exceededTransferLimit } = await layer.queryFeatures(query);
```

Measured with 5.1.27 on a public 3557-row service: `queryFeatures()` with no paging returns **1000 rows** (the
service's `maxRecordCount`) and `exceededTransferLimit: true`, with no error.

## Decision Tree

1. **What is the data source?**
   - Hosted/ArcGIS feature service → `FeatureLayer`.
   - `.geojson` file/URL → `GeoJSONLayer` (WGS84; geometry type and fields are inferred).
   - `.csv` with coordinates → `CSVLayer` (`lat`/`lon` style names are detected; others need
     `latitudeField`/`longitudeField`).
   - Client-side graphics you draw → `GraphicsLayer`.
   - Pre-rendered tiles → `TileLayer`.

2. **Reading features?**
   - Always start from `layer.createQuery()`; add to its `where`.
   - More rows than `maxRecordCount` → page with `start`/`num` + `orderByFields`, or `queryFeatureCount` first.

**Default:** `FeatureLayer` + `createQuery()` for service data; `GraphicsLayer` for ad-hoc client graphics.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Query from "@arcgis/core/rest/support/Query.js";
```

### Dynamic Imports (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recommended for new projects)

```typescript
// Layers are still created with the Core API, then added to the component's map.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: definitionExpression lives in createQuery, not in queryFeatures

`definitionExpression` filters what the layer **draws**. For queries, it only applies because `createQuery()` copies
it into `query.where`. Measured with `definitionExpression: "st = 'TX'"`: replacing `query.where` with
`"pop2000 > 500000"` counted 29 cities (the whole country); a plain `{ where }` object or `new Query()` gave the same
29; `(${query.where}) AND pop2000 > 500000` gave the right 6.

### Concept 2: createQuery() vs new Query()

`createQuery()` starts with `where` = the layer filter (or `1=1`), `returnGeometry: true` and `outFields: ["*"]`,
even when the layer has its own `outFields` (measured: all 6 fields came back). `new Query()` starts with
`returnGeometry: false` and `outFields: null`: measured, geometry `null` and only the display field. The layer's
`outFields` controls what the **view** loads for drawing, hit tests and popups, not what `queryFeatures` returns.

### Concept 3: The silent cap and paging

A query returns at most the service's `maxRecordCount` rows and sets `exceededTransferLimit: true`; nothing throws.
Page with `start`/`num` and a stable `orderByFields` (measured: page 1 New York, Los Angeles, Chicago; page 2
Houston, Philadelphia, Phoenix), or count first with `queryFeatureCount`.

## Common Pitfalls (Top 3)

### Pitfall 1: Overwriting the where that carries the layer filter

```typescript
// ❌ Anti-pattern
const layer = new FeatureLayer({ url, definitionExpression: "st = 'TX'" });
const q = layer.createQuery();
q.where = "pop2000 > 500000"; // the TX filter is gone
```

```typescript
// ✅ Correct
const q = layer.createQuery();
q.where = `(${q.where}) AND pop2000 > 500000`;
```

**Impact:** measured: 29 results instead of 6. The map shows Texas only, while the list, the count and the export
cover the whole country.

### Pitfall 2: Filtering client-side what the server capped

```typescript
// ❌ Anti-pattern
const all = await layer.queryFeatures();
const capitals = all.features.filter((f) => f.attributes.capital === "Y");
```

```typescript
// ✅ Correct
const q = layer.createQuery();
q.where = "capital = 'Y'";
const { features } = await layer.queryFeatures(q);
```

**Impact:** measured: the unfiltered query stopped at 1000 of 3557 rows (`exceededTransferLimit: true`), so the
client filter found **11** capitals; the server-side `where` found all **51**. It is wrong, not only slow.

### Pitfall 3: Building a `new Query()` and expecting geometry

```typescript
// ❌ Anti-pattern
const q = new Query({ where: "1=1", num: 10 }); // returnGeometry false, outFields null
const { features } = await layer.queryFeatures(q);
view.goTo(features); // geometry is null
```

```typescript
// ✅ Correct
const q = layer.createQuery(); // returnGeometry true; or set q.returnGeometry = true and q.outFields
q.num = 10;
```

**Impact:** measured: `geometry === null` and the attributes held only the display field.

## When to Read references/

| If you need... | Read |
|---|---|
| Layer + Query signatures | `references/api-detail.md` |
| GeoJSON, CSV, query examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-core-maps` — the map/view the layers go on
- `arcgis-visualization` — symbolize the layers
- `arcgis-3d-layers` — 3D layer types

## Reference Samples

- [intro-feature-layer](https://developers.arcgis.com/javascript/latest/sample-code/layers-featurelayer/)
- [GeoJSONLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-geojson/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Measured in `tests/runtime/casos/arcgis-layers.ts` on a public 3557-row service.
  New top pitfall: overwriting `createQuery().where` drops the layer's `definitionExpression` (29 results instead of
  6). The Quick Start used `outFields: ["*"]` against its own advice. The old pitfall 3 ("returnGeometry defaults
  vary") is now precise: `createQuery()` is `true`, `new Query()` is `false`. Client-side filtering is shown to be
  wrong, not only slow (1000-row cap: 11 capitals instead of 51). Layer `outFields` do not limit `queryFeatures`.
- **0.1.0** (2026-05-31): Initial release.
