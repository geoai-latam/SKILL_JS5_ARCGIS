# Agent Guide: arcgis-feature-effects

Quick-reference for layer/feature effects. Read before adding visual emphasis.

## Quick Decision Tree

1. **Whole layer?** → `layer.effect = "<filter string>"`.
2. **Subset emphasis?** → `layer.featureEffect` = `FeatureEffect({ filter, includedEffect, excludedEffect })`.
3. **Truly remove features?** → use `definitionExpression`, not `opacity(0%)`.

## Setup Checklist

- [ ] Effect values include units (`2px`, `40%`).
- [ ] `FeatureFilter` uses `where` / `geometry` / `timeExtent`.
- [ ] Reserve heavy effects (bloom) for small/focus layers.
- [ ] Remember effects are visual only — not a filter.

## Anti-patterns (one-liner reminders)

- ❌ `blur(2)` without a unit.
- ❌ Using `opacity(0%)` to "hide" (still in hitTest): use `layerView.filter`.
- ❌ `featureEffect` without `filter` expecting a subset (everything is "included").
- ❌ Effects in a SceneView or on a heatmap (ignored).
- ❌ Bloom on a dense full layer.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — effect / FeatureEffect signatures
- `references/examples.md` — highlight / dim / filter
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-layer-effect.ts`, `snippet-feature-effect.ts`
