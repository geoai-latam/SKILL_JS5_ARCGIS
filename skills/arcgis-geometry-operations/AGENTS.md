# Agent Guide: arcgis-geometry-operations

Quick-reference for client-side geometry. Read before spatial math.

## Quick Decision Tree

1. **One operation?** → operator module (`bufferOperator`, `intersectionOperator`, `unionOperator`).
2. **Relationship test / breadth?** → `geometryEngine` (`contains`, `intersects`, `within`).
3. **Large area / lat-lon?** → geodesic variants.
4. **Batch?** → `operator.executeMany(...)`.

## Setup Checklist

- [ ] Import operators as namespaces (`import * as bufferOperator`).
- [ ] `simplify` messy geometry before overlays.
- [ ] Use geodesic ops for geographic coordinates.
- [ ] Prefer `executeMany` for batches.

## Anti-patterns (one-liner reminders)

- ❌ Planar buffer on lat-lon over large areas.
- ❌ Overlay on non-simple geometry.
- ❌ Looping `execute` instead of `executeMany`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — operators + geometryEngine
- `references/examples.md` — buffer / overlay / relate
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-operators.ts`, `snippet-engine.ts`
