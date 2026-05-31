# Agent Guide: arcgis-widgets-ui

Quick-reference for core map UI. Read before adding legends/search/etc.

## Quick Decision Tree

1. **New app?** → Map Components (`arcgis-legend`, `arcgis-layer-list`, `arcgis-search`, `arcgis-basemap-gallery`).
2. **Mid-migration 4.x?** → keep widget temporarily; migrate before 6.0.
3. **Placement?** → inside `<arcgis-map>` or via `reference-element` + `position`.

## Setup Checklist

- [ ] Import only the components you render.
- [ ] Bind each component to the map (nested or `reference-element`).
- [ ] Prefer components over `@arcgis/core/widgets/*` (deprecated in 5.0).

## Anti-patterns (one-liner reminders)

- ❌ `@arcgis/core/widgets/Legend.js` in a new app.
- ❌ A component with no map binding (renders empty).
- ❌ Importing unused components.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — component attributes/events
- `references/examples.md` — placement + binding
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-widgets.ts`
