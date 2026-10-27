# Agent Guide: arcgis-widgets-advanced

Quick-reference for advanced map UI on SDK 5.1. Read before adding print, bookmarks, daylight, and the like.

## Quick Decision Tree

1. **Export?** → `arcgis-print` (ArcGIS Online's print service when no `printServiceUrl`).
2. **Saved views?** → `arcgis-bookmarks` (`show-add-bookmark-button` to let users add them).
3. **Orientation?** → `arcgis-compass` (2D or 3D).
4. **Sun and shadows?** → `arcgis-daylight` in `arcgis-scene`.
5. **Terrain profile?** → `arcgis-elevation-profile` on a map or scene with `ground`.

## Setup Checklist

- [ ] Place nested components with `slot="top-right"` (or another corner), never `position`.
- [ ] Import from `@arcgis/map-components/components/<tag>`, only the components the page uses.
- [ ] Give the map a `ground` (e.g. `world-elevation`) before an elevation profile.
- [ ] Read profile numbers from `await mapEl.whenAnalysisView(profileEl.analysis)`, not from the profile lines.

## Anti-patterns (one-liner reminders)

- ❌ `position="top-right"` on a component (it falls into the default slot).
- ❌ An elevation profile on a map without `ground` (stays at progress 0, no error).
- ❌ `profile.statistics` (4.x; `undefined` in 5.x).
- ❌ `@arcgis/core/widgets/*` in new apps (deprecated since 4.32–5.0).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — advanced component attributes
- `references/examples.md` — print / bookmarks / daylight / elevation profile
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-widgets-advanced.ts`
