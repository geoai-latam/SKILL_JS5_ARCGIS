# Agent Guide: arcgis-smart-mapping

Quick-reference for auto-generated renderers. Read before computing symbology.

## Quick Decision Tree

1. **Encode by?** color → `smartMapping/renderers/color.js`; size → `.../size.js`;
   category → `.../type.js`.
2. **Continuous vs classed?** `createContinuousRenderer` vs `createClassBreaksRenderer`.
3. **Always** `await view.when()` before calling a creator.

## Setup Checklist

- [ ] Pass `{ layer, view, field }` to the creator.
- [ ] `await view.when()` first (creators sample the view).
- [ ] Assign `result.renderer` to `layer.renderer`.
- [ ] Use numeric fields for continuous; `type` module for categories.

## Anti-patterns (one-liner reminders)

- ❌ Calling a creator before the view is ready.
- ❌ Discarding the returned `renderer`.
- ❌ Continuous renderer on a string field.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — creator signatures
- `references/examples.md` — color / size / type
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-smart-color.ts`
