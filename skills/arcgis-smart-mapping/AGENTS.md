# Agent Guide: arcgis-smart-mapping

Quick-reference for auto-generated renderers (SDK 5.1). Read before computing symbology.

## Quick Decision Tree

1. **Encode by?** color → `smartMapping/renderers/color.js`; size → `.../size.js`;
   category → `.../type.js`.
2. **Continuous vs classed?** `createContinuousRenderer` vs `createClassBreaksRenderer` (+ `classificationMethod`).
3. **Categories?** `type.createRenderer` with `numTypes` decided (default 10).

## Setup Checklist

- [ ] Pass `{ layer, field }` (+ `view` for background-aware colors).
- [ ] Assign `result.renderer` to `layer.renderer`.
- [ ] Set `classificationMethod` (default equal-interval).
- [ ] Numeric fields for continuous; `type` module for strings.
- [ ] Filter with `definitionExpression` or a geometry filter, not `filter.where`.

## Anti-patterns (one-liner reminders)

- ❌ Default class breaks on skewed data (3553 of 3557 in one class).
- ❌ Type renderer on many categories without `numTypes` (only 10 + "Other").
- ❌ Continuous on a text field: no error, made-up stops.
- ❌ Expecting the view's extent to scope the statistics.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — creator signatures
- `references/examples.md` — color / size / type
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-smart-color.ts`
