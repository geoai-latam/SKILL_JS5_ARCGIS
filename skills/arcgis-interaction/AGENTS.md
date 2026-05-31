# Agent Guide: arcgis-interaction

Quick-reference for map interaction. Read before wiring clicks or drawing.

## Quick Decision Tree

1. **Identify clicked feature?** → `view.hitTest(event, { include: [layer] })`.
2. **Draw shapes (UI)?** → `arcgis-sketch` component.
3. **Draw shapes (programmatic)?** → `SketchViewModel({ view, layer })`.
4. **Continuous tracking?** → throttled `pointer-move`.

## Setup Checklist

- [ ] Filter hitTest with `include` to your layer(s).
- [ ] Act on sketch events only when `state === "complete"`.
- [ ] Store event handles and `remove()` them on cleanup.
- [ ] Throttle `pointer-move`.

## Anti-patterns (one-liner reminders)

- ❌ Unfiltered hitTest grabbing labels/basemap.
- ❌ Saving sketch graphics on every state.
- ❌ Leaked `pointer-move` handlers.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — hitTest / SketchViewModel
- `references/examples.md` — identify / draw / select
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-hittest.ts`, `snippet-sketch.ts`
