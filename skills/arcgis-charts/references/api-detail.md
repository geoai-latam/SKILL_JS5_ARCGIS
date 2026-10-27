# API Reference: Charts

## Table of Contents

- [arcgis-chart](#arcgis-chart)
- [Chart config](#chart-config)
- [Interactivity](#interactivity)

---

## arcgis-chart

`@arcgis/charts-components/components/arcgis-chart`

| Property | Type | Description |
|---|---|---|
| `layer` | `FeatureLayer` | Data source |
| `config` | chart config | Type, fields, aggregation |
| `selectionData` | object | Current chart selection |

| Event | Description |
|---|---|
| `arcgisSelectionComplete` | Fires when the user selects chart elements |

---

## Chart config

A chart config describes the chart:

| Field | Description |
|---|---|
| chart type | `bar`, `line`, `scatter`, `histogram`, `pie` |
| category/value fields | Fields to plot |
| aggregation | sum/avg/count/bin for grouping |

Configs can be loaded from a saved layer chart or authored in code.

---

## Interactivity

| Direction | Mechanism |
|---|---|
| Chart → map | Handle selection events; highlight features |
| Map → chart | Apply a filter/selection to the chart's layer |
