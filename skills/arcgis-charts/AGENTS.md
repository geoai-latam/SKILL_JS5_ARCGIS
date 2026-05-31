# Agent Guide: arcgis-charts

Quick-reference for charts. Read before adding a chart.

## Quick Decision Tree

1. **Chart type?** categories → bar/pie; trend → line; correlation → scatter; distribution → histogram.
2. **Time series?** → line over a date field.
3. **Link to map?** → sync chart ↔ feature selection.

## Setup Checklist

- [ ] Set the chart's `layer` (FeatureLayer) and `config`.
- [ ] Aggregate large datasets in the config.
- [ ] Use date fields for time series, numeric for value axes.
- [ ] Wire selection events for map-chart interactivity.

## Anti-patterns (one-liner reminders)

- ❌ Chart with no layer/config (empty).
- ❌ Plotting raw huge datasets unaggregated.
- ❌ Wrong field type for the axis.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — arcgis-chart / config
- `references/examples.md` — bar / line / map-link
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-chart.ts`
