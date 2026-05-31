# Agent Guide: arcgis-map-tools

Quick-reference for interactive tools. Read before adding sketch/measure/snap.

## Quick Decision Tree

1. **Draw/edit?** → `arcgis-sketch`.
2. **Measure?** → `arcgis-measurement` (2d/3d variants per view).
3. **Snap?** → `arcgis-snapping-controls` + sketch.

## Setup Checklist

- [ ] Match measurement variant to the view (2d vs 3d).
- [ ] Persist sketch output via `applyEdits` if needed.
- [ ] Configure snapping sources.
- [ ] Bind components to the map/scene.

## Anti-patterns (one-liner reminders)

- ❌ 3d measurement on a 2D map.
- ❌ Assuming sketch saves to the service.
- ❌ Snapping with no sources.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — tool component attributes/events
- `references/examples.md` — sketch / measure / snap
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-tools.ts`
