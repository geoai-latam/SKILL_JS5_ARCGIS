# Agent Guide: arcgis-performance

Quick-reference for tuning ArcGIS apps. Read before optimizing.

## Quick Decision Tree

1. **Bundle too big?** → per-module imports + `await import()` for heavy/optional features.
2. **Jank with many features?** → feature reduction (cluster), `definitionExpression`, scale limits.
3. **3D heavy?** → lower `qualityProfile`.
4. **Memory grows in SPA?** → `view.destroy()` + `handle.remove()` on teardown.

## Setup Checklist

- [ ] Imports are per-module (`@arcgis/core/<x>.js`), never `import * as arcgis`.
- [ ] Heavy/optional layers are dynamically imported.
- [ ] Dense layers use `featureReduction`.
- [ ] Teardown destroys the view and removes all handles.

## Anti-patterns (one-liner reminders)

- ❌ `import * as arcgis from "@arcgis/core"`.
- ❌ Leaving views alive on route change.
- ❌ Rendering 100k+ features with no reduction.
- ❌ Watch handles that are never removed.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — perf-related properties
- `references/examples.md` — bundle / clustering / cleanup
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-lazy-import.ts`, `snippet-cleanup.ts`
