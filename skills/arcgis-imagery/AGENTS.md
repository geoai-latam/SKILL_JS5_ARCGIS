# Agent Guide: arcgis-imagery

Quick-reference for raster imagery. Read before adding imagery.

## Quick Decision Tree

1. **Dynamic / analysis?** → `ImageryLayer` (raster functions, mosaic rules).
2. **Cached / fast display?** → `ImageryTileLayer`.
3. **On-the-fly processing?** → `rasterFunction` (chainable).
4. **Overlapping rasters?** → `mosaicRule`.

## Setup Checklist

- [ ] Pick ImageryLayer (dynamic) vs ImageryTileLayer (cached).
- [ ] Provide correct band ids for NDVI/index functions.
- [ ] Chain raster functions via the `Raster` argument.
- [ ] Set `mosaicRule` for mosaic datasets.

## Anti-patterns (one-liner reminders)

- ❌ Raster function on a tile layer.
- ❌ Wrong/empty band arguments.
- ❌ Expecting dynamic imagery to match tile speed.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — ImageryLayer / RasterFunction / mosaicRule
- `references/examples.md` — NDVI / hillshade / mosaic
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-imagery.ts`
