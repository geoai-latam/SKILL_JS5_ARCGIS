---
name: arcgis-charts
description: >
  Add data charts to a mapping app with the ArcGIS Maps SDK for JavaScript 5.1
  charts components: the arcgis-chart element driven by a model from createModel()
  (bar, line, pie, scatterplot, histogram, box plot, gauge, heat), bound to a
  FeatureLayer or imagery, time series, and map-chart selection sync. Use this skill whenever the user visualizes feature
  attributes as a chart or links a chart to the map.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/charts-components@^5.1"
  - "@arcgis/core@^5.1"
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
- **Pattern it teaches:** bind `arcgis-chart` to a layer + a model from `createModel()`; sync selection with the map.
- **What it does NOT cover:** map symbology (see `arcgis-visualization`) or the layers themselves (`arcgis-layers`).

## Quick Start

```typescript
import "@arcgis/charts-components/components/arcgis-chart";
import { createModel } from "@arcgis/charts-components/model/shared/setup-utils"; // no ".js"

const model = await createModel({ layer, chartType: "barChart" });
model.xAxisField = "sub_region";
model.aggregationType = "count";

const chart = document.querySelector("arcgis-chart")!;
chart.layer = layer;
chart.model = model;
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

```html
<!-- One module script loads core and every component package, charts included (a classic
     <script> without type="module" fails: "Cannot use import statement outside a module") -->
<script type="module" src="https://js.arcgis.com/5.1/"></script>
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: The chart is driven by a model, not a `config` object

`arcgis-chart` has **no public `config` property** (the typings have none; an internal one exists at
runtime and setting it draws nothing). A chart is a `model` (or a saved `WebChart` from the
layer) plus a `layer`. Build the model with `createModel()`:

- `createModel({ layer, chartType })` — `chartType` is one of `"barChart"`, `"lineChart"`,
  `"comboBarLineChart"`, `"pieChart"`, `"scatterplot"`, `"histogram"`, `"boxPlot"`, `"gauge"`,
  `"radarChart"`, `"heatChart"`.
- Then set the model's fields: `xAxisField`, `numericFields`, `aggregationType` (`"count"`, `"sum"`,
  `"avg"`, …), `splitByField`, `binTemporalData`…
- In 5.1 import it from `@arcgis/charts-components/model/shared/setup-utils` **without `.js`**: the
  package's export map has no `.js` entry, so the path the release notes print fails in Vite
  ("Missing specifier"). The import from the package index is deprecated (removed in 6.0).

### Concept 2: Binding to a layer

Set `chart.layer` (a `FeatureLayer`, a `FeatureLayerView`, or since 5.1 an `ImageryLayer`,
`ImageryTileLayer` or `WCSLayer` for histograms and scatterplots). The chart queries the layer for
the values it plots. A layer with saved charts can be shown with `chart.layer = layer` +
`chart.chartIndex = 0`.

### Concept 3: Map-chart interactivity

Give the chart the view (`chart.view = view`) and turn on `syncViewSelection` (5.1; it replaces
`syncSelectionsBetweenChartAndLayerViewPolicy`) to keep chart and map selection in step. The
`arcgisSelectionComplete` event carries `{ selectionData, model }`.

### Concept 4: Version pin: Calcite 5.2 breaks charts 5.1

Measured on 2026-10-27: with `@esri/calcite-components` 5.2.0 (what `^5.1.1` resolves to today),
`arcgis-chart` 5.1.27 never renders — amCharts throws "Unknown color syntax: light-dark(...)" and
`arcgisDataProcessComplete` never fires. With Calcite 5.1.2 it renders. Pin `"~5.1.2"` until the
charts package is updated.

## Common Pitfalls (Top 3)

### Pitfall 1: Inventing a `config` object for the chart

```typescript
// ❌ Anti-pattern
chartEl.layer = featureLayer;
chartEl.config = { type: "bar", category: { field: "TYPE" }, aggregation: "count" };
```

```typescript
// ✅ Correct
const model = await createModel({ layer: featureLayer, chartType: "barChart" });
model.xAxisField = "TYPE";
model.aggregationType = "count";
chartEl.layer = featureLayer;
chartEl.model = model;
```

**Impact:** measured with 5.1.27: the made-up `config` is ignored, no model is created and
`arcgisDataProcessComplete` never fires — an empty chart with no error. It only "compiles" if the
element is cast to a loose type.

### Pitfall 2: Charting unaggregated huge datasets

```typescript
// ❌ Anti-pattern
// Plotting hundreds of thousands of raw rows
```

```typescript
// ✅ Correct
model.aggregationType = "count"; // group by xAxisField; histograms bin
```

**Impact:** slow charts and unreadable visuals.

### Pitfall 3: Letting Calcite float to 5.2

```json
// ❌ Anti-pattern (package.json)
"@esri/calcite-components": "^5.1.1"
```

```json
// ✅ Correct (until charts-components is updated)
"@esri/calcite-components": "~5.1.2"
```

**Impact:** measured on 2026-10-27: `^5.1.1` installs Calcite 5.2.0, and with it `arcgis-chart`
5.1.27 never draws (amCharts: "Unknown color syntax: light-dark(...)"). No chart, no useful error
in the UI. With 5.1.2 the same code renders.

## When to Read references/

| If you need... | Read |
|---|---|
| arcgis-chart / model signatures | `references/api-detail.md` |
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

- **0.2.0** (2026-10-27): SDK 5.1. Rewritten on the real API: `arcgis-chart` has no `config`; charts are
  `createModel()` + `model` (measured: the old code rendered nothing). `createModel` import without `.js`;
  Calcite 5.2 breaks charts 5.1 (measured, pin `~5.1.2`); `syncViewSelection` and the 5.1 renames;
  module CDN script (the 5.1 core script already brings charts). Run in `tests/runtime/casos/arcgis-charts.ts`.
- **0.1.0** (2026-05-31): Initial release.
