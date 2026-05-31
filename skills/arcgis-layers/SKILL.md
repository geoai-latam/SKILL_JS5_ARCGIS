---
name: arcgis-layers
description: >
  Add and query data layers with the ArcGIS Maps SDK for JavaScript 5.0:
  FeatureLayer, GeoJSONLayer, CSVLayer, GraphicsLayer, and TileLayer. Covers
  queryFeatures with QueryParameters, pagination (start/num), outFields,
  definitionExpression, and lazy loading. Use this skill whenever the user adds
  data to a map, queries features, or filters/loads a layer.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Layers

> **When to use:** Activate this skill whenever the user adds data to a map, runs a feature query,
> filters with a definition expression, or loads GeoJSON/CSV/graphics/tiles.

## Overview

Layers are the data you put on a map. Pick the layer type by data source, then query/filter it.

- **Problem it solves:** loading the right layer type and reading its features efficiently.
- **Who it serves:** developers adding operational data to a map or scene.
- **Pattern it teaches:** source-driven layer choice, server-side querying, filtering before drawing.
- **What it does NOT cover:** symbology (see `arcgis-visualization`) or 3D layers (see `arcgis-3d-layers`).

## Quick Start

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
const layer = new FeatureLayer({ url: "https://.../FeatureServer/0", outFields: ["*"] });
map.add(layer);
```

## Decision Tree

1. **What is the data source?**
   - Hosted/ArcGIS feature service → `FeatureLayer`.
   - `.geojson` file/URL → `GeoJSONLayer`.
   - `.csv` with lat/lon → `CSVLayer`.
   - Client-side graphics you draw → `GraphicsLayer`.
   - Pre-rendered tiles → `TileLayer`.

2. **Do you need attributes back from a query?**
   - Yes → set `outFields` and use `queryFeatures`.

**Default:** `FeatureLayer` for service data; `GraphicsLayer` for ad-hoc client graphics.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
```

### Dynamic Imports (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recommended for new projects)

```typescript
// Layers are still created with the Core API, then added to the component's map.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: outFields and definitionExpression

`outFields` controls which attributes are fetched (use `["*"]` sparingly). `definitionExpression`
is a server-side SQL filter so only matching features are ever requested.

### Concept 2: Querying with pagination

`layer.createQuery()` returns a `Query`. Set `where`, `orderByFields`, `returnGeometry`, and page
with `start`/`num`. `await layer.queryFeatures(query)` resolves to a `FeatureSet`.

### Concept 3: Lazy loading and visibility

Layers load when added to a loaded map/view. Set `visible: false` (or scale limits) to defer
drawing. `await layer.load()` to force metadata without rendering.

## Common Pitfalls (Top 3)

### Pitfall 1: Requesting all fields by default

```typescript
// ❌ Anti-pattern
const layer = new FeatureLayer({ url, outFields: ["*"] }); // pulls every attribute
```

```typescript
// ✅ Correct
const layer = new FeatureLayer({ url, outFields: ["OBJECTID", "NAME", "POP"] });
```

**Impact:** larger payloads and slower draws for wide tables.

### Pitfall 2: Filtering client-side instead of server-side

```typescript
// ❌ Anti-pattern
const all = await layer.queryFeatures();
const open = all.features.filter((f) => f.attributes.STATUS === "open");
```

```typescript
// ✅ Correct
const q = layer.createQuery();
q.where = "STATUS = 'open'";
const { features } = await layer.queryFeatures(q);
```

**Impact:** the client downloads everything, then throws most of it away.

### Pitfall 3: Reading geometry without requesting it

```typescript
// ❌ Anti-pattern
const q = layer.createQuery(); // returnGeometry defaults vary
const { features } = await layer.queryFeatures(q);
features[0].geometry; // may be null
```

```typescript
// ✅ Correct
const q = layer.createQuery();
q.returnGeometry = true;
const { features } = await layer.queryFeatures(q);
```

**Impact:** `geometry` is `null`, so map highlights/zoom-to fail.

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

- **0.1.0** (2026-05-31): Initial release.
