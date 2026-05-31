# Agent Guide: arcgis-3d-layers

Quick-reference for 3D layers. Read before loading 3D content.

## Quick Decision Tree

1. **Data type?** i3s objects → `SceneLayer`; photogrammetry mesh → `IntegratedMeshLayer`;
   LiDAR → `PointCloudLayer`; gaussian splat → `GaussianSplatLayer`.
2. **View?** Must be a `SceneView` / `<arcgis-scene>`.
3. **On terrain?** Set `map.ground = "world-elevation"`.

## Setup Checklist

- [ ] Use a `SceneView` (`<arcgis-scene>`), never a `MapView`.
- [ ] Set `ground` for terrain alignment.
- [ ] Lower `qualityProfile` before loading heavy mesh/splat layers.
- [ ] Load gaussian splats on demand (GPU-heavy).

## Anti-patterns (one-liner reminders)

- ❌ Adding 3D layers to a `MapView`.
- ❌ Loading every heavy 3D layer at high quality at once.
- ❌ Forgetting `ground` so meshes float/sink.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — 3D layer signatures
- `references/examples.md` — SceneLayer / mesh / splat
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-scenelayer.ts`, `snippet-gaussiansplat.ts`, `snippet-integratedmesh.ts`
