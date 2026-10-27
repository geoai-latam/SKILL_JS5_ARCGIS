# API Reference: Charts

## Table of Contents

- [arcgis-chart](#arcgis-chart)
- [createModel](#createmodel)
- [Chart models](#chart-models)
- [Renamed in 5.1](#renamed-in-51)

---

## arcgis-chart

`@arcgis/charts-components/components/arcgis-chart` (CDN: `https://js.arcgis.com/5.1/charts-components/`)

| Property | Type | Description |
|---|---|---|
| `layer` | `FeatureLayer` \| `FeatureLayerView` \| imagery layer | Data source. Imagery (`ImageryLayer`, `ImageryTileLayer`, `WCSLayer`) since 5.1, for histograms and scatterplots |
| `model` | chart model \| `WebChart` | What to draw. There is **no public `config` property** (only an internal one; setting it draws nothing) |
| `chartIndex` | `number` | Show the n-th chart saved on the layer |
| `view` | `MapView` \| `SceneView` | Needed to sync selection, extent or time with the map |
| `syncViewSelection` | `boolean` | Chart and map selection in step (5.1) |
| `filterByViewExtent` | `boolean` | Only features in the view extent (5.1; was `filterByExtent`) |
| `selectionData` | object | Current chart selection |

| Event | Detail |
|---|---|
| `arcgisDataProcessComplete` | Data fetched and processed: the chart will draw |
| `arcgisSelectionComplete` | `{ selectionData, model }` |
| `arcgisRuntimeError` | Runtime error in the chart |

---

## createModel

```typescript
import { createModel } from "@arcgis/charts-components/model/shared/setup-utils"; // no ".js"
const model = await createModel({ layer, chartType: "barChart" });
```

Accepted props: `{ layer, chartType }`, `{ layer, config }` (a `WebChart` spec without its source),
or `{ config }` (a spec with its source). `chartType`: `"barChart"`, `"lineChart"`,
`"comboBarLineChart"`, `"pieChart"`, `"scatterplot"`, `"histogram"`, `"boxPlot"`, `"gauge"`,
`"radarChart"`, `"heatChart"`.

The `.js` path printed in the 5.1 release notes is not in the package's export map and fails in
Vite; importing from the package index is deprecated in 5.1 and removed in 6.0.

---

## Chart models

| Member (bar/line/combo) | Description |
|---|---|
| `xAxisField` | Category or date field |
| `numericFields` | Value field(s) for `sum`/`avg`/… |
| `aggregationType` | `"count"`, `"sum"`, `"avg"`, `"min"`, `"max"`, … |
| `splitByField` | One series per value |
| `binTemporalData` | Bin a date `xAxisField` into periods |
| `config` | The resulting `WebChart` spec (read it to save or inspect) |

Scatterplots use `xAxisField` + `yAxisField`; pie and box plot use `numericFields`.

---

## Renamed in 5.1

The old names still exist but are deprecated: `filterByExtent` → `filterByViewExtent`,
`syncSelectionsBetweenChartAndLayerViewPolicy` → `syncViewSelection`, plus the boolean renames in the
5.1 release notes (`disableInteractions` → `interactionsDisabled`, `useAnimatedCharts` →
`animationEnabled`…). The checker in `scripts/check-code-blocks.mjs` flags them from the `.d.ts`.
