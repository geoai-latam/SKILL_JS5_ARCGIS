# Agent Guide: arcgis-3d-layers

Quick-reference for 3D layers. Read before loading 3D content.

## Quick Decision Tree

1. **Data type?** i3s objects → `SceneLayer`; i3s mesh → `IntegratedMeshLayer`; 3D Tiles mesh
   (`3DTilesServer/tileset.json`) → `IntegratedMesh3DTilesLayer`; LiDAR → `PointCloudLayer`;
   gaussian splat → `GaussianSplatLayer` on a published `tileset.json` or `portalItem`, never a `.ply`.
2. **View?** Must be a `SceneView` / `<arcgis-scene>`.
3. **On terrain?** Set `map.ground = "world-elevation"`.

## Setup Checklist

- [ ] Use a `SceneView` (`<arcgis-scene>`), never a `MapView`.
- [ ] Set `ground` for terrain alignment.
- [ ] Leave `qualityProfile` to the SDK (set per device); expose it only as a user setting.
- [ ] After `await layer.load()`, check `fullExtent` is not the whole world (silent bad source).
- [ ] Load gaussian splats on demand (GPU-heavy).

## Anti-patterns (one-liner reminders)

- ❌ Adding 3D layers to a `MapView`.
- ❌ Loading every heavy 3D layer at startup, or hard-coding `qualityProfile`.
- ❌ `GaussianSplatLayer({ url: "….ply" })`: resolves `load()` and draws nothing.
- ❌ `opacity` on mesh/point-cloud/splat layers in a SceneView: not supported.
- ❌ Forgetting `ground` so meshes float/sink.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — 3D layer signatures
- `references/examples.md` — SceneLayer / mesh / splat
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-scenelayer.ts`, `snippet-gaussiansplat.ts`, `snippet-integratedmesh.ts`
