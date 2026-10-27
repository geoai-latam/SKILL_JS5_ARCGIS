# Agent Guide: arcgis-coordinates-projection

Quick-reference for coordinate systems. Read before reprojecting.

## Quick Decision Tree

1. **WGS84 ↔ 3857?** → `webMercatorUtils` (sync; no datum check, no pole clamp).
2. **Other reprojection?** → `if (!isLoaded()) await projectOperator.load()` then `execute`.
3. **Different datums?** → `geographicTransformationUtils.getTransformations(in, out, aoi)` and
   pass `{ geographicTransformation }` explicitly.
4. **Colombia?** → plane coordinates in 9377 (Origen-Nacional), not the legacy zones (3116…).

## Setup Checklist

- [ ] `await projectOperator.load()` before `execute` (otherwise: `p is not a function`).
- [ ] Load the geodetic operators too before using them.
- [ ] `x` = longitude, `y` = latitude.
- [ ] Match SRs before geometry comparisons.
- [ ] Use webMercatorUtils for the common pair.
- [ ] Track each geometry's `spatialReference`.

## Anti-patterns (one-liner reminders)

- ❌ `projectOperator.execute` before `load()`.
- ❌ Comparing geometries in different SRs (`intersectsOperator` returns `false`, no error).
- ❌ Relabelling a datum instead of transforming it (492 m in Bogotá).
- ❌ Hand-rolled web-mercator math.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — SpatialReference / projectOperator / webMercatorUtils
- `references/examples.md` — reprojection examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-project.ts`, `snippet-webmercator.ts`
