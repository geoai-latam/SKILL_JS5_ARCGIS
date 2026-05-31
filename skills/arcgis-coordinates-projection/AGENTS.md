# Agent Guide: arcgis-coordinates-projection

Quick-reference for coordinate systems. Read before reprojecting.

## Quick Decision Tree

1. **4326 ↔ 3857?** → `webMercatorUtils` (sync).
2. **Other reprojection?** → `await projectOperator.load()` then `execute(geom, outSR)`.
3. **Just a system id?** → `new SpatialReference({ wkid })`.

## Setup Checklist

- [ ] `await projectOperator.load()` before `execute`.
- [ ] Match SRs before geometry comparisons.
- [ ] Use webMercatorUtils for the common pair.
- [ ] Track each geometry's `spatialReference`.

## Anti-patterns (one-liner reminders)

- ❌ `projectOperator.execute` before `load()`.
- ❌ Comparing geometries in different SRs.
- ❌ Hand-rolled web-mercator math.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — SpatialReference / projectOperator / webMercatorUtils
- `references/examples.md` — reprojection examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-project.ts`, `snippet-webmercator.ts`
