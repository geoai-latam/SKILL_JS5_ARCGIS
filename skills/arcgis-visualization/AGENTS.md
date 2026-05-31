# Agent Guide: arcgis-visualization

Quick-reference for renderers. Read before styling a layer.

## Quick Decision Tree

1. **Uniform?** → `SimpleRenderer`.
2. **Categories?** → `UniqueValueRenderer` (`field` + `uniqueValueInfos`).
3. **Numeric ranges?** → `ClassBreaksRenderer` (contiguous `classBreakInfos`).
4. **Point density?** → `HeatmapRenderer`.
5. **Continuous value?** → `visualVariables` (color/size) on a SimpleRenderer.

## Setup Checklist

- [ ] Set `layer.renderer` (not per-graphic symbols) for data-driven styling.
- [ ] Keep class breaks contiguous (no gaps/overlaps).
- [ ] Provide a `defaultSymbol` for values outside the breaks/categories.
- [ ] Use heatmaps only on point layers.

## Anti-patterns (one-liner reminders)

- ❌ Looping to set `feature.symbol` instead of a renderer.
- ❌ Gappy class breaks.
- ❌ Heatmap on polygons.
- ❌ Missing `defaultSymbol`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — renderer + visualVariable signatures
- `references/examples.md` — one example per renderer
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-unique-value.ts`, `snippet-class-breaks.ts`, `snippet-heatmap.ts`, `snippet-visual-variables.ts`
