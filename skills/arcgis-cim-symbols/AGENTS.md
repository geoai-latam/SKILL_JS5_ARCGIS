# Agent Guide: arcgis-cim-symbols

Quick-reference for CIM symbols. Read before building layered symbology.

## Quick Decision Tree

1. **Simple symbol enough?** → use SimpleMarker/Line/Fill, not CIM.
2. **Need stacked layers / vector markers / patterns?** → `CIMSymbol`.
3. **Data-driven symbol details?** → `primitiveName` on the layer + `primitiveOverrides` (Arcade).
4. **Only resize/recolour a built symbol?** → `cimSymbolUtils`, not hand-edited JSON.

## Setup Checklist

- [ ] `data` is a `CIMSymbolReference` with a `symbol`.
- [ ] `symbolLayers[0]` is the one on top (outline before fill).
- [ ] Sizes and widths in points (px × 0.75).
- [ ] Marker geometry inside the `frame`.
- [ ] RGBA colors 0–255, alpha included.
- [ ] Override `propertyName` in Proper case (`"Size"`).
- [ ] Check it paints: `symbolUtils.renderPreviewHTML(symbol)`.

## Anti-patterns (one-liner reminders)

- ❌ `CIMPointSymbol` directly in `data`.
- ❌ Alpha as 0–1 (invisible).
- ❌ `propertyName: "size"` (ignored).
- ❌ Fill at `[0]` over its own outline.
- ❌ One symbol instance in two renderers (shared mutations).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — CIM structure, overrides, utilities
- `references/examples.md` — marker, stacking, override, utilities
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-cim.ts`
