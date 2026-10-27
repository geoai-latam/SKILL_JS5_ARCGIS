# Agent Guide: arcgis-time-animation

Quick-reference for temporal data on SDK 5.1. Read before time filtering or animation.

## Quick Decision Tree

1. **Playback UI?** → `arcgis-time-slider` in the map, with `fullTimeExtent` from `layer.timeInfo` and `stops`.
2. **Filter window?** → set `view.timeExtent` (a `TimeExtent`); it filters client-side.
3. **Layer not filtering?** → it has no `timeInfo`, or its `startField` does not exist.
4. **One layer must ignore the window?** → `layer.useViewTime = false`.

## Setup Checklist

- [ ] `await layer.load()` and set `slider.fullTimeExtent = layer.timeInfo.fullTimeExtent`; the slider stays null otherwise.
- [ ] Build dates with `Date.UTC(...)` or ISO strings, never `new Date(y, m, d)` (local midnight).
- [ ] Check that the `timeInfo.startField` exists and is a date field: a wrong name fails silently.
- [ ] Animate by assigning `view.timeExtent` (or the slider's `play()`), not by re-querying.

## Anti-patterns (one-liner reminders)

- ❌ A slider with no `fullTimeExtent`, expecting it to read the layer.
- ❌ `new Date(2020, 0, 1)` in a `TimeExtent` (5 h off in Bogotá).
- ❌ A `timeInfo` with a misspelled field (no error, no filtering).
- ❌ `queryFeatures` on every animation step.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — TimeExtent / view.timeExtent / time-slider
- `references/examples.md` — playback / filter / animation
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-time.ts`
