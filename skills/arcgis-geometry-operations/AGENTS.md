# Agent Guide: arcgis-geometry-operations

Quick-reference for client-side geometry in SDK 5.1. Read before spatial math.

## Quick Decision Tree

1. **Lon/lat + meters?** → `geodesicBufferOperator` / `geodetic*Operator`, after `await op.load()`.
2. **Projected, small area?** → planar `bufferOperator`, `areaOperator`, `lengthOperator`.
3. **Relationship?** → `containsOperator`, `withinOperator`, `intersectsOperator`, ...
4. **`geometryEngine` in the code?** → replace it (deprecated since 4.32; table in `api-detail.md`).

## Setup Checklist

- [ ] Import operators as namespaces (`import * as bufferOperator`).
- [ ] `await op.load()` before any geodesic/geodetic operator.
- [ ] Both inputs in the same spatial reference (otherwise `null`).
- [ ] `simplifyOperator` before measuring self-intersecting rings.
- [ ] Heavy batches in a worker: `executeMany` is synchronous too.

## Anti-patterns (one-liner reminders)

- ❌ `bufferOperator` on lon/lat with meters: throws.
- ❌ Geodetic operator without `load()`: "m is not a function".
- ❌ `geometryEngine.*` in new code.
- ❌ Area of an unsimplified bowtie: 0.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md`: full guides
- `references/api-detail.md`: operators, load() list, geometryEngine migration
- `references/examples.md`: buffer / relate / measure
- `references/pitfalls.md`: extended troubleshooting
- `scripts/snippet-operators.ts`, `snippet-engine.ts` (geometryEngine code rewritten with operators)
