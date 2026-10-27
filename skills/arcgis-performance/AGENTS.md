# Agent Guide: arcgis-performance

Quick-reference for performance work (SDK 5.1). Read before tuning a slow or leaky app.

## Quick Decision Tree

1. **WebGL contexts lost / memory grows?** → `view.destroy()` on unmount (`view.map = null` first to keep the map).
2. **Jank on pan/zoom?** → watch `view.stationary`; `minScale`/`maxScale`; `featureReduction`; `layer.visible`.
3. **Big bundle?** → per-module imports and only the components you render; `import()` helps little (24 KB measured).

## Setup Checklist

- [ ] Every view is destroyed on unmount.
- [ ] A shared map is detached (`view.map = null`) before `destroy()`.
- [ ] Every `watch`/`on` handle is removed.
- [ ] No per-frame work: watch settled state.
- [ ] Detail layers have a scale range.

## Anti-patterns (one-liner reminders)

- ❌ `container.innerHTML = ""` as teardown (views stay alive).
- ❌ `view.destroy()` and then reusing its map (destroyed with it).
- ❌ `watch(() => view.center, ...)` for heavy work (92 fires per goTo).
- ❌ `import ... from "@arcgis/core"` or `"@arcgis/core/layers"` (do not resolve).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — lifecycle, watches, draw controls, bundle numbers
- `references/examples.md` — teardown, settled watches, scale ranges
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-cleanup.ts`, `snippet-lazy-import.ts`
