# Agent Guide: arcgis-time-animation

Quick-reference for temporal data. Read before time filtering/animation.

## Quick Decision Tree

1. **Playback UI?** → `arcgis-time-slider` bound to the map.
2. **Filter window?** → set `view.timeExtent` (TimeExtent).
3. **Layer not filtering?** → ensure it has `timeInfo`.
4. **Programmatic animation?** → step `view.timeExtent` on a timer.

## Setup Checklist

- [ ] Confirm layers are time-aware (`timeInfo`).
- [ ] Build TimeExtent in UTC to avoid TZ drift.
- [ ] Animate via `view.timeExtent`, not per-frame re-queries.
- [ ] Bind the slider to the map.

## Anti-patterns (one-liner reminders)

- ❌ Expecting time filter without `timeInfo`.
- ❌ Local vs UTC date ambiguity.
- ❌ Re-querying the service each animation frame.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — TimeExtent / time-slider
- `references/examples.md` — playback / filter
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-time.ts`
