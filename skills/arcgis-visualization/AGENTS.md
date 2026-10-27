# Agent Guide: arcgis-visualization

Quick-reference for renderers on SDK 5.1. Read before styling a layer.

## Quick Decision Tree

1. **Uniform?** → `SimpleRenderer`.
2. **Categories?** → `UniqueValueRenderer` (`field` + `uniqueValueInfos` + `defaultSymbol`).
3. **Numeric ranges?** → `ClassBreaksRenderer` (contiguous `classBreakInfos` + `defaultSymbol`).
4. **Point density?** → `HeatmapRenderer`, on points only.
5. **Continuous value?** → `visualVariables` (color/size) on a `SimpleRenderer`.

## Setup Checklist

- [ ] Style a FeatureLayer through `layer.renderer`; `graphic.symbol` is ignored there.
- [ ] Always set `defaultSymbol`: values with no class, out of range, or null are otherwise not drawn.
- [ ] Match unique values with the exact case of the data (`"Park"` is not `"park"`).
- [ ] Use heatmaps only on point layers: on polygons nothing is drawn and nothing errors.

## Anti-patterns (one-liner reminders)

- ❌ Looping to set `feature.symbol` on FeatureLayer results.
- ❌ A renderer without `defaultSymbol` over data with gaps or nulls.
- ❌ `uniqueValueInfos` values in a different case than the data.
- ❌ Heatmap on polygons.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — renderer + visualVariable signatures
- `references/examples.md` — one example per renderer
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-unique-value.ts`, `snippet-class-breaks.ts`, `snippet-heatmap.ts`, `snippet-visual-variables.ts`
