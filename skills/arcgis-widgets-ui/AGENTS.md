# Agent Guide: arcgis-widgets-ui

Quick-reference for core map UI on SDK 5.1. Read before adding legends, search, and the like.

## Quick Decision Tree

1. **New app?** → Map Components (`arcgis-legend`, `arcgis-layer-list`, `arcgis-search`, `arcgis-basemap-gallery`).
2. **Mid-migration 4.x?** → keep the widget temporarily; migrate before 6.0.
3. **Placement?** → nested in `<arcgis-map>` with `slot="top-right"`, or outside with `reference-element="#mapId"`.

## Setup Checklist

- [ ] Import every component you render: an unimported tag stays a 0 px element with no error.
- [ ] Nest it in the map with a `slot`, or bind it with `reference-element` matching the map's id exactly.
- [ ] Never `position="..."`: it is not a property, and the component falls into the default slot.
- [ ] Prefer components over `@arcgis/core/widgets/*` (deprecated since 4.32–5.0).

## Anti-patterns (one-liner reminders)

- ❌ `@arcgis/core/widgets/Legend.js` in a new app.
- ❌ A component outside the map with no `reference-element`, or a selector that does not match (empty, no error).
- ❌ `position="top-right"` instead of `slot="top-right"`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — component attributes and placement
- `references/examples.md` — placement + binding
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-widgets.ts`
