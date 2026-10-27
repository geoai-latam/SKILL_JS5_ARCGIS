# Agent Guide: arcgis-imagery

Quick-reference for raster imagery. Read before adding imagery.

## Quick Decision Tree

1. **Dynamic / analysis?** → `ImageryLayer` (raster functions, mosaic rules).
2. **Cached / fast display?** → `ImageryTileLayer`.
3. **On-the-fly processing?** → `rasterFunction` (chainable).
4. **Overlapping rasters?** → `mosaicRule`.

## Setup Checklist

- [ ] Pick ImageryLayer (server) vs ImageryTileLayer (client: tiles, COG, CRF).
- [ ] Indices with `rasterFunctionUtils.bandArithmetic*`, band ids 0-based from `serviceRasterInfo`.
- [ ] Chain raster functions via the `Raster` argument.
- [ ] Set `mosaicRule` for mosaic datasets.

## Anti-patterns (one-liner reminders)

- ❌ Reading the server `"NDVI"` function as -1..1 (it returns 0–200).
- ❌ Sensor band numbers (1-based) as band ids.
- ❌ `renderingRule` (4.x; not in the 5.1 typings).
- ❌ Expecting dynamic imagery to match tile speed.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — ImageryLayer / RasterFunction / mosaicRule
- `references/examples.md` — NDVI / hillshade / mosaic
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-imagery.ts`
