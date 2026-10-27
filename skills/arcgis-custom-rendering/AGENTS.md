# Agent Guide: arcgis-custom-rendering

Quick-reference for custom WebGL in SDK 5.1. Read before writing render code.

## Quick Decision Tree

1. **A layer, renderer or effect suffices?** → use it.
2. **Custom WebGL in 3D?** → `RenderNode.createSubclass({ consumes, produces, render })`, `new Node({ view })`.
3. **Custom WebGL in 2D?** → `BaseLayerViewGL2D.createSubclass` returned from a layer's `createLayerView`.

## Setup Checklist

- [ ] No `externalRenderers` (not in 5.x).
- [ ] `consumes: { required: [...] }`, an object; `produces`: one string.
- [ ] `createSubclass`, not `class extends RenderNode`.
- [ ] `render` returns `this.bindRenderTarget()` (or the FBO it produced).
- [ ] Map coords → `webgl.toRenderCoordinates`; local origin before float32.
- [ ] `requestRender()` for animation; GL resources created once, freed in `destroy()`.

## Anti-patterns (one-liner reminders)

- ❌ `externalRenderers.add(view, ...)`: the module does not exist in 5.1.
- ❌ `consumes: [{ name: "composite-color" }]`: whole scene black, error every frame.
- ❌ `class X extends RenderNode`: the constructor throws.
- ❌ Raw lon/lat in WebGL: a point near the center of the Earth.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md`: full guides
- `references/api-detail.md`: RenderNode, webgl utils, RenderCamera, BaseLayerViewGL2D
- `references/examples.md`: composite node, coordinates, animation, 2D
- `references/pitfalls.md`: extended troubleshooting
- `scripts/snippet-render-node.ts`
