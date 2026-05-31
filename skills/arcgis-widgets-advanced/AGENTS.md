# Agent Guide: arcgis-widgets-advanced

Quick-reference for advanced map UI. Read before adding print/bookmarks/daylight/etc.

## Quick Decision Tree

1. **Export?** → `arcgis-print` (+ print service URL).
2. **Saved views?** → `arcgis-bookmarks`.
3. **Orientation?** → `arcgis-compass`.
4. **3D sun/shadows?** → `arcgis-daylight` (SceneView).
5. **Terrain profile?** → `arcgis-elevation-profile`.

## Setup Checklist

- [ ] Import only the components you use.
- [ ] Bind to the map/scene (nested or `reference-element`).
- [ ] Provide a print service for `arcgis-print`.
- [ ] Use a SceneView for `arcgis-daylight` / rich elevation.

## Anti-patterns (one-liner reminders)

- ❌ Print with no service.
- ❌ Daylight on a 2D view.
- ❌ `@arcgis/core/widgets/*` in new apps (deprecated).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — advanced component attributes
- `references/examples.md` — print / bookmarks / daylight
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-widgets-advanced.ts`
