---
name: arcgis-core-utilities
description: >
  Use the ArcGIS Maps SDK for JavaScript 5.0 core utilities: reactiveUtils for
  watching Accessor properties, promiseUtils for cancellable async work,
  esriRequest for REST calls, and Collection for observable arrays. Use this
  skill whenever the user needs to react to view/layer state changes, debounce or
  cancel requests, call a REST endpoint, or work with the SDK's Collection type.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: core
tags:
  - reactiveutils
  - promiseutils
  - esrirequest
  - collection
  - accessor
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Core Utilities

> **When to use:** Activate this skill whenever the user watches SDK property changes, needs
> cancellable/debounced async, calls a REST endpoint with esriRequest, or uses a Collection.

## Overview

Most SDK classes extend **Accessor**, which makes their properties observable. The core utilities
are how you react to and orchestrate that reactive, async world.

- **Problem it solves:** correctly observing state, managing async, and calling services.
- **Who it serves:** developers wiring app logic around map/layer/view state.
- **Pattern it teaches:** watch-and-clean-up handles, cancellable promises, observable collections.
- **What it does NOT cover:** rendering (see `arcgis-core-maps`) or specific REST services (`arcgis-rest-services`).

## Quick Start

```typescript
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
// Re-run whenever view.stationary becomes true
const handle = reactiveUtils.when(
  () => view.stationary,
  () => console.log("center:", view.center),
);
// handle.remove() when done
```

## Decision Tree

1. **Reacting to a property changing over time?**
   - Yes → `reactiveUtils.watch`.
   - One-time, when a condition becomes truthy → `reactiveUtils.when` / `whenOnce`.

2. **Async that may be superseded (typeahead, rapid pans)?**
   - Yes → `promiseUtils.debounce` and handle `promiseUtils.isAbortError`.

3. **Calling a REST endpoint?**
   - Yes → `esriRequest`.

**Default:** prefer `reactiveUtils` over the legacy `.watch()` instance method.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import esriRequest from "@arcgis/core/request.js";
```

### Dynamic Imports (CDN)

```javascript
const reactiveUtils = await $arcgis.import("@arcgis/core/core/reactiveUtils.js");
```

### Map Components (recommended for new projects)

```typescript
// Components expose the same view objects; read them in arcgisViewReadyChange,
// then apply reactiveUtils against view properties.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Accessor and watching

Accessor-based classes expose observable properties. `reactiveUtils.watch(getValue, callback)`
returns a handle; call `handle.remove()` to stop watching and free memory.

### Concept 2: Cancellable async

`promiseUtils.debounce` collapses rapid calls; an aborted promise rejects with an abort error
detectable via `promiseUtils.isAbortError(err)` — swallow it, do not treat it as a real failure.

### Concept 3: Collection

`Collection<T>` is the SDK's observable array (used for `map.layers`, `graphics`, etc.). It emits
`change` events and offers `add`, `addMany`, `filter`, `map`, and `toArray`.

## Common Pitfalls (Top 3)

### Pitfall 1: Leaking watch handles

```typescript
// ❌ Anti-pattern
reactiveUtils.watch(() => view.zoom, (z) => doStuff(z)); // never removed
```

```typescript
// ✅ Correct
const handle = reactiveUtils.watch(() => view.zoom, (z) => doStuff(z));
// later: handle.remove();
```

**Impact:** callbacks pile up across re-renders; memory grows and stale logic fires.

### Pitfall 2: Treating abort errors as failures

```typescript
// ❌ Anti-pattern
try { await search(q); } catch (e) { showError(e); } // shows error on every keystroke
```

```typescript
// ✅ Correct
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
try { await search(q); } catch (e) { if (!promiseUtils.isAbortError(e)) showError(e); }
```

**Impact:** spurious error toasts whenever a newer request supersedes an older one.

### Pitfall 3: Mutating a Collection like a plain array

```typescript
// ❌ Anti-pattern
map.layers[0] = newLayer; // index assignment does not notify watchers
```

```typescript
// ✅ Correct
map.layers.removeAt(0);
map.layers.add(newLayer, 0);
```

**Impact:** the view never re-renders because the Collection did not emit a change.

## When to Read references/

| If you need... | Read |
|---|---|
| Full utility signatures | `references/api-detail.md` |
| Debounce / watch / request examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-core-maps` — the views whose state you watch
- `arcgis-rest-services` — higher-level service helpers over esriRequest
- `arcgis-performance` — cleanup patterns to avoid leaks

## Reference Samples

- [reactiveUtils](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-reactiveUtils.html)
- [esriRequest](https://developers.arcgis.com/javascript/latest/api-reference/esri-request.html)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
