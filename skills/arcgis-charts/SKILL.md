---
name: arcgis-charts
description: >
  Add data charts to a mapping app with the ArcGIS Maps SDK for JavaScript 5.0
  charts components: the arcgis-chart element bound to a FeatureLayer with a chart
  config (bar, line, scatter, histogram, pie), including time series and
  map-chart interactivity. Use this skill whenever the user visualizes feature
  attributes as a chart or links a chart to the map.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: new-in-5.0
tags:
  - charts
  - chart
  - visualization
  - time-series
  - components
requires:
  - arcgis-layers
packages:
  - "@arcgis/charts-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Charts

> **When to use:** Activate this skill whenever the user visualizes feature attributes as a chart
> (bar/line/scatter/histogram/pie) or links a chart to the map.

## Overview

The charts components render a layer's attributes as interactive charts, optionally linked to the map.

- **Problem it solves:** turning attribute data into readable, interactive charts.
- **Who it serves:** developers building dashboards and analytical views.
- **Pattern it teaches:** bind `arcgis-chart` to a layer + a chart config; sync selection with the map.
- **What it does NOT cover:** map symbology (see `arcgis-visualization`) or the layers themselves (`arcgis-layers`).

## Quick Start

```typescript
import "@arcgis/charts-components/components/arcgis-chart";
// <arcgis-chart></arcgis-chart> — set .layer and .config in code
```

## Decision Tree

1. **What chart?**
   - Categories → bar/pie; trend → line; correlation → scatter; distribution → histogram.

2. **Time series?**
   - Yes → line chart over a date field.

3. **Link to the map?**
   - Yes → sync chart selection with feature selection on the map.

**Default:** bar chart bound to a FeatureLayer; line chart for time series.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/charts-components/components/arcgis-chart";
```

### Dynamic Imports (CDN)

```javascript
// The unified 5.0 CDN includes charts-components; reference the custom element.
const script = "https://js.arcgis.com/5.0/";
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Chart config

`arcgis-chart` renders from a chart config (type, fields, aggregation). Configs can come from a saved
layer chart or be built in code.

### Concept 2: Binding to a layer

Set the chart's `layer` (a FeatureLayer) so it can read attributes. The chart queries the layer for
the values it plots.

### Concept 3: Map-chart interactivity

Selection can sync both ways: selecting a chart bar highlights features, and selecting features
filters the chart — wire the events to keep them in step.

## Common Pitfalls (Top 3)

### Pitfall 1: Chart with no layer/config

```typescript
// ❌ Anti-pattern
// <arcgis-chart></arcgis-chart> with neither layer nor config
```

```typescript
// ✅ Correct
chartEl.layer = featureLayer;
chartEl.config = chartConfig;
```

**Impact:** the chart renders empty.

### Pitfall 2: Charting unaggregated huge datasets

```typescript
// ❌ Anti-pattern
// Plotting hundreds of thousands of raw rows
```

```typescript
// ✅ Correct
// Aggregate (group/bin) in the chart config.
```

**Impact:** slow charts and unreadable visuals.

### Pitfall 3: Wrong field type for the chart

```typescript
// ❌ Anti-pattern
// A line "time series" over a string field
```

```typescript
// ✅ Correct
// Use a date field for time series, numeric for value axes.
```

**Impact:** broken or meaningless charts.

## When to Read references/

| If you need... | Read |
|---|---|
| arcgis-chart / config signatures | `references/api-detail.md` |
| Bar / line / map-link examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-layers` — the data behind the chart
- `arcgis-interaction` — selection to link with the map
- `arcgis-visualization` — symbolize the same data on the map

## Reference Samples

- [Charts components](https://developers.arcgis.com/javascript/latest/references/charts-components/)
- [Chart + map](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
