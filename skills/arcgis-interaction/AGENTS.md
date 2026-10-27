# Agent Guide: arcgis-interaction

Quick-reference for map interaction (SDK 5.1). Read before wiring clicks or drawing.

## Quick Decision Tree

1. **Identify clicked feature?** → `view.hitTest(event, { include: [layer] })`, then `r.type === "graphic"`.
2. **Need fields of a service layer?** → `outFields` on the layer (default hit: only `objectid`).
3. **Draw shapes (UI)?** → `arcgis-sketch` component (`creationMode` defaults to `"continuous"`).
4. **Draw shapes (programmatic)?** → `SketchViewModel({ view, layer })`; `create()` returns a Promise.
5. **Hover?** → `pointer-move` + `promiseUtils.debounce`, swallow `AbortError`.

## Setup Checklist

- [ ] Filter hitTest with `include` and narrow the result `type`.
- [ ] Set `outFields` for every field you read from a hit.
- [ ] Act on sketch events only when `state === "complete"`.
- [ ] Store event handles and `remove()` them on cleanup.
- [ ] Debounce hitTests driven by `pointer-move`.

## Anti-patterns (one-liner reminders)

- ❌ `results[0].graphic` (4.x style; does not compile in 5.x).
- ❌ Reading attributes not in `outFields` (comes back `undefined`).
- ❌ Saving sketch graphics on every state.
- ❌ One hitTest per pointer move.
- ❌ Looking for terrain in SceneView `results` (it is `response.ground`).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — hitTest result types, events, debounce, SketchViewModel, arcgis-sketch
- `references/examples.md` — identify, draw, hover, 3D ground
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-hittest.ts`, `snippet-sketch.ts`
