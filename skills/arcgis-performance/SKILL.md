---
name: arcgis-performance
description: >
  Optimize ArcGIS Maps SDK for JavaScript 5.0 apps: shrink the bundle with
  per-module ESM imports and dynamic import(), reduce draw work with feature
  reduction and layer visibility, and prevent memory leaks by destroying views
  and removing watch handles. Use this skill whenever the user reports a slow map,
  a large bundle, jank while panning, or memory growth over time.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: core
tags:
  - performance
  - bundle
  - lazy-loading
  - memory
  - optimization
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Performance

> **When to use:** Activate this skill whenever the user reports a slow map, a large bundle, jank
> while panning/zooming, or memory growth, and wants concrete optimizations.

## Overview

Performance in the SDK comes from three levers: ship less code, draw less, and clean up.

- **Problem it solves:** slow loads, heavy bundles, and leaks in long-lived SPAs.
- **Who it serves:** developers tuning a working app for production.
- **Pattern it teaches:** granular ESM imports, lazy loading, feature reduction, deterministic cleanup.
- **What it does NOT cover:** the initial setup (see `arcgis-starter-app`) or rendering choices (`arcgis-visualization`).

## Quick Start

```typescript
// Lazy-load a heavy layer only when needed (code-splits it out of the main bundle).
const { default: CSVLayer } = await import("@arcgis/core/layers/CSVLayer.js");
map.add(new CSVLayer({ url }));
```

## Decision Tree

1. **Is the bundle too big?**
   - Yes → import per module (`@arcgis/core/<x>.js`), dynamic-import heavy/optional features.
   - No → continue.

2. **Is rendering janky with many features?**
   - Yes → enable feature reduction (clustering), tune `definitionExpression`, lower quality profile (3D).
   - No → continue.

3. **Does memory grow across navigations?**
   - Yes → `view.destroy()` and `handle.remove()` on teardown.

**Default:** import granularly, lazy-load the rest, always clean up.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
```

### Dynamic Imports (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recommended for new projects)

```typescript
// Import only the components you render so the bundler tree-shakes the rest.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Granular imports and code-splitting

Import from specific module paths so bundlers tree-shake unused code. Wrap optional or heavy
features in `await import(...)` so they land in a separate chunk loaded on demand.

### Concept 2: Draw less

Use feature reduction (clustering), `definitionExpression` to limit fetched features, and
`maxScale`/`minScale` so layers only draw where relevant. In 3D, lower `qualityProfile`.

### Concept 3: Deterministic cleanup

Long-lived SPAs leak if views and handles persist. Call `view.destroy()` and `handle.remove()`
for every watch when a route unmounts.

## Common Pitfalls (Top 3)

### Pitfall 1: Importing the whole namespace

```typescript
// ❌ Anti-pattern
import * as arcgis from "@arcgis/core"; // pulls in far more than you use
```

```typescript
// ✅ Correct
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
```

**Impact:** the bundle balloons and initial load is slow.

### Pitfall 2: Never destroying views

```typescript
// ❌ Anti-pattern
function leaveRoute() { container.innerHTML = ""; } // view object still alive
```

```typescript
// ✅ Correct
function leaveRoute() { view.destroy(); }
```

**Impact:** WebGL contexts and memory accumulate ("Too many active WebGL contexts").

### Pitfall 3: Rendering all features without reduction

```typescript
// ❌ Anti-pattern
const layer = new FeatureLayer({ url }); // 200k points, no reduction
```

```typescript
// ✅ Correct
const layer = new FeatureLayer({ url, featureReduction: { type: "cluster" } });
```

**Impact:** dropped frames and high GPU/CPU while panning dense data.

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

- **0.1.0** (2026-05-31): Initial release.
