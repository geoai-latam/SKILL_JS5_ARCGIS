# Agent Guide: arcgis-cim-symbols

Quick-reference for CIM symbols. Read before building layered symbology.

## Quick Decision Tree

1. **Simple symbol enough?** → use SimpleMarker/Line/Fill, not CIM.
2. **Need stacked layers / vector markers / patterns?** → `CIMSymbol`.
3. **Data-driven symbol details?** → CIM `primitiveOverrides` (+ Arcade).

## Setup Checklist

- [ ] `data` is a `CIMSymbolReference` with a `symbol`.
- [ ] Each symbol layer has `enable: true`.
- [ ] RGBA colors use 0–255 (alpha included).
- [ ] Assign the CIMSymbol via a renderer.

## Anti-patterns (one-liner reminders)

- ❌ Putting `CIMPointSymbol` directly in `data` (must be wrapped in `CIMSymbolReference`).
- ❌ Omitting `enable: true`.
- ❌ Alpha as 0–1 (it is 0–255).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — CIM structure
- `references/examples.md` — full CIM examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-cim.ts`
