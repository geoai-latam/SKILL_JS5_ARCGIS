---
name: arcgis-performance
description: >
  Optimize ArcGIS Maps SDK for JavaScript 5.1 apps: tear views down with
  view.destroy() (and know it destroys the map and layers too), avoid
  high-frequency watches, draw less with scale ranges, feature reduction and
  visibility toggles, and keep bundle expectations honest (the SDK already
  code-splits itself). Use this skill whenever the user reports a slow map, a large
  bundle, jank while panning, lost WebGL contexts, or memory growth over time.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: core
tags:
  - performance
  - bundle
  - lazy-loading
  - memory
  - optimization
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Performance

> **When to use:** Activate this skill whenever the user reports a slow map, a large bundle, jank
> while panning/zooming, or memory growth, and wants concrete optimizations.

## Overview

Performance in the SDK comes from three levers: clean up, draw less, and ship less code. Measured with 5.1.27, the
first two matter far more than the third.

- **Problem it solves:** lost WebGL contexts, leaks in long-lived SPAs, jank while panning, slow loads.
- **Who it serves:** developers tuning a working app for production.
- **Pattern it teaches:** deterministic teardown, settled-state watches, scale ranges and reduction, granular imports.
- **What it does NOT cover:** the initial setup (see `arcgis-starter-app`) or rendering choices (`arcgis-visualization`).

## Quick Start

```typescript
// Route teardown in an SPA that reuses the same map across routes.
function leaveRoute(view: MapView, handles: { remove(): void }[]) {
  handles.forEach((h) => h.remove());
  view.map = null;   // keep the map and its layers alive for the next view
  view.destroy();    // frees the WebGL context
}
```

Measured: creating 20 MapViews and only clearing the container left all 20 alive; Chromium logged "Too many active
WebGL contexts. Oldest context will be lost." and 4 views ended with `fatalError`. With `destroy()`, none did.

## Decision Tree

1. **Lost WebGL contexts or memory growth across navigations?**
   - Yes → `view.destroy()` on unmount; set `view.map = null` first if the map is reused.

2. **Jank while panning or zooming?**
   - Work on every frame → watch `view.stationary`, not `view.center` / `view.extent`.
   - Too many features → `minScale`/`maxScale`, `featureReduction` (cluster or binning), `definitionExpression`.
   - Toggling layers → `layer.visible`, not remove-and-recreate.

3. **Initial bundle too big?**
   - Import per module (`@arcgis/core/<path>.js`, only the components you render).
   - `import()` optional features, knowing the SDK already lazy-loads most of its own code.

**Default:** destroy views, watch settled state, scale-limit detail layers.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
```

### Dynamic Imports (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recommended for new projects)

```typescript
// Import only the components you render.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Teardown, and what destroy() takes with it

`view.destroy()` frees the view's WebGL context. It **also destroys its map and every layer in it** (measured:
`map.destroyed === true`, `layer.destroyed === true`, `map.layers.length === 0`). If the map outlives the view
(tabs, routes, a shared store), set `view.map = null` before destroying: measured, the map survived with its layers.
Remove your `watch`/`on` handles too.

### Concept 2: Draw less

`minScale`/`maxScale` suspend a layer outside its range (measured: at country scale, a `minScale: 50000` layer view
had `suspended: true` and fetched nothing). `featureReduction` aggregates dense points (a plain
`{ type: "cluster" }` autocasts to `FeatureReductionCluster`). Toggling `layer.visible` keeps the layer: measured, 3
toggles made **0** requests to the service, while 3 remove-and-recreate cycles made **24**.

### Concept 3: Bundle expectations

There is no root module: `import * from "@arcgis/core"` and `"@arcgis/core/layers"` do not resolve (TS2307), so
those "barrel" mistakes fail the build rather than bloat it. The SDK already splits itself: a Vite build of
Map + MapView + FeatureLayer produced **748 chunks** with a 1494 KB (430 KB gzip) initial chunk. Moving `CSVLayer`
and `KMLLayer` behind `import()` saved only **24 KB (6 KB gzip)** of initial code (`tests/bundle/medir.mjs`).
Use `import()` for optional features, but don't expect it to fix a slow first load.

## Common Pitfalls (Top 3)

### Pitfall 1: Leaving views alive

```typescript
// ❌ Anti-pattern
function leaveRoute() { container.innerHTML = ""; } // the view and its WebGL context stay alive
```

```typescript
// ✅ Correct
function leaveRoute() { view.destroy(); }
```

**Impact:** measured with 20 views: all stayed alive, Chromium dropped the oldest WebGL contexts ("Too many active
WebGL contexts") and 4 views hit `fatalError`. With `destroy()`: 0.

### Pitfall 2: destroy() on a view whose map you still need

```typescript
// ❌ Anti-pattern
view.destroy();
newView.map = sharedMap; // sharedMap was destroyed with the old view, layers and all
```

```typescript
// ✅ Correct
view.map = null;
view.destroy();
newView.map = sharedMap;
```

**Impact:** measured: after `view.destroy()`, `map.destroyed` and `layer.destroyed` were `true` and the map had 0
layers; the next view shows an empty map.

### Pitfall 3: Recomputing on every frame of a pan

```typescript
// ❌ Anti-pattern
reactiveUtils.watch(() => view.center, () => expensiveRecompute());
```

```typescript
// ✅ Correct
reactiveUtils.watch(() => view.stationary, (stationary) => { if (stationary) expensiveRecompute(); });
```

**Impact:** measured during one 1.5 s `goTo`: the `center` watch fired **92** times, the `stationary` one **once**.

## When to Read references/

| If you need... | Read |
|---|---|
| Perf-related properties/APIs | `references/api-detail.md` |
| Bundle, clustering, cleanup examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-starter-app` — set up the build first
- `arcgis-core-utilities` — handle cleanup patterns
- `arcgis-visualization` — feature reduction and renderers

## Reference Samples

- [Optimize performance](https://developers.arcgis.com/javascript/latest/programming-patterns/)
- [Clustering](https://developers.arcgis.com/javascript/latest/sample-code/featurereduction-cluster/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Measured in `tests/runtime/casos/arcgis-performance.ts` and
  `tests/bundle/medir.mjs`. The old pitfall 1 (`import * from "@arcgis/core"`) and its barrel twin do not resolve at
  all, so they cannot "balloon the bundle"; the Quick Start's `import()` saved 24 KB of a 1494 KB initial chunk because
  the SDK already splits into ~748 chunks. New top pitfalls with numbers: views left alive (4 of 20 lost their WebGL
  context), `view.destroy()` destroying a shared map and its layers, and `watch(center)` (92 fires vs 1).
- **0.1.0** (2026-05-31): Initial release.
