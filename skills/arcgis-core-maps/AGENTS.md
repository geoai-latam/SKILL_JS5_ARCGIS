# Agent Guide: arcgis-core-maps

Quick-reference for creating maps and scenes. Read before deciding API or generating code.

## Quick Decision Tree

1. **New project / quick embed?**
   - Yes → Map Components (`<arcgis-map>` / `<arcgis-scene>`).
   - No → Core API.

2. **2D or 3D?**
   - 2D → `MapView` (or `<arcgis-map>`).
   - 3D → `SceneView` (or `<arcgis-scene>`), set `map.ground` for terrain.

3. **Need view internals before render?**
   - Yes → `view.when()` (Core) or `await el.viewOnReady()` then `el.view` (Components): the
     `arcgisViewReadyChange` detail is `null`, never `event.detail.view`.

## Setup Checklist

- [ ] `pnpm add @arcgis/core @arcgis/map-components`.
- [ ] `esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY` (required for basemap styles).
- [ ] Give the container/element a non-zero height (`html,body,arcgis-map { height: 100% }`).
- [ ] Read `view` only after ready; without an API key or a height it never gets there.

## Anti-patterns (one-liner reminders)

- ❌ Don't read `el.view` before `arcgisViewReadyChange`.
- ❌ Don't omit the API key — basemap styles 401 to a grey canvas.
- ❌ Don't pass `camera` to `MapView` (2D); use `SceneView`.
- ❌ Don't forget the `.js` extension in `@arcgis/core/*` imports.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — Map/MapView/SceneView signatures
- `references/examples.md` — 2D, 3D, and webmap examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-mapview.ts`, `snippet-sceneview.ts`, `snippet-map-component.ts`
