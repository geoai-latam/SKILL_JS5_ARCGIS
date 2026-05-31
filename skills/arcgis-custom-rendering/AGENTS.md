# Agent Guide: arcgis-custom-rendering

Quick-reference for custom WebGL. Read before writing render code.

## Quick Decision Tree

1. **Standard layer suffices?** → use it (not RenderNode).
2. **Custom WebGL in 3D?** → subclass `RenderNode`, attach to SceneView.
3. **2D custom?** → GraphicsLayer / canvas overlay.

## Setup Checklist

- [ ] Use `RenderNode` (not externalRenderers).
- [ ] Set `produces`/`consumes` for pipeline placement.
- [ ] Transform world → render coordinates.
- [ ] Allocate GL resources once; free on removal.

## Anti-patterns (one-liner reminders)

- ❌ externalRenderers patterns (superseded).
- ❌ Raw geographic coords in WebGL.
- ❌ Per-frame buffer/texture allocation.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — RenderNode
- `references/examples.md` — setup examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-render-node.ts`
