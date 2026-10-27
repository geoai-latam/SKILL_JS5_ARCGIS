# Agent Guide: arcgis-charts

Quick-reference for charts. Read before adding a chart.

## Quick Decision Tree

1. **Chart type?** categories → `barChart`/`pieChart`; trend → `lineChart`; correlation →
   `scatterplot`; distribution → `histogram`/`boxPlot`.
2. **The layer already has saved charts?** → `chart.layer = layer; chart.chartIndex = 0`.
3. **New chart?** → `createModel({ layer, chartType })`, set the model's fields, `chart.model = model`.
4. **Link to map?** → `chart.view = view; chart.syncViewSelection = true`.

## Setup Checklist

- [ ] `@esri/calcite-components` pinned to `~5.1.2`: Calcite 5.2 stops charts 5.1 from drawing.
- [ ] `createModel` from `@arcgis/charts-components/model/shared/setup-utils` (no `.js`).
- [ ] Set `chart.layer` AND `chart.model`; there is no `config` property on the element.
- [ ] Check the model fields exist on the layer (`layer.getField`).
- [ ] Give the element a size in CSS.
- [ ] Wait for `arcgisDataProcessComplete` before exporting or asserting.

## Anti-patterns (one-liner reminders)

- ❌ `chart.config = {...}`: invented, silently ignored, empty chart.
- ❌ `^5.1.x` for Calcite: resolves to 5.2 and the chart never draws.
- ❌ 5.0 names that 5.1 deprecated (`filterByExtent`, `syncSelectionsBetweenChartAndLayerViewPolicy`).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — arcgis-chart, createModel, models, 5.1 renames
- `references/examples.md` — bar / line / map-link
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-chart.ts`
