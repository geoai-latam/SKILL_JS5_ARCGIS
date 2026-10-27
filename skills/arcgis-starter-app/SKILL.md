---
name: arcgis-starter-app
description: >
  Scaffold a new ArcGIS Maps SDK for JavaScript 5.1 web project from scratch with
  Vite and TypeScript (strict). Covers dependency setup, the API key via
  environment variables (and keeping .env out of git, which the Vite template
  does not do), Map Components registration, getting the view with viewOnReady()
  (the arcgisViewReadyChange detail is null), and framework integration for
  vanilla TS, React 19, and Angular. Use this skill whenever the user starts a new
  ArcGIS project, asks how to set up the SDK, or wires it into a framework.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: core
tags:
  - scaffolding
  - vite
  - typescript
  - setup
  - framework
packages:
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
  - "@esri/calcite-components@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Starter App

> **When to use:** Activate this skill whenever the user starts a new ArcGIS Maps SDK 5.0 project,
> sets up dependencies, configures the API key, or integrates the SDK into Vite, React 19, or Angular.

## Overview

This skill bootstraps a working SDK 5.1 project and wires it correctly so the first map renders.

- **Problem it solves:** going from empty folder to a running, type-safe ArcGIS app in minutes.
- **Who it serves:** developers (especially LATAM SEs) starting greenfield ArcGIS web apps.
- **Pattern it teaches:** Vite + TS strict, Map-Components-first, API key via `import.meta.env`.
- **What it does NOT cover:** building the map itself (see `arcgis-core-maps`) or adding data (`arcgis-layers`).

## Quick Start

```bash
bash scripts/scaffold.sh my-arcgis-app   # PKG_MANAGER=npm to use npm
cd my-arcgis-app
cp .env.example .env   # add VITE_ARCGIS_API_KEY (the scaffold git-ignores .env)
pnpm dev
```

Measured on 2026-10-27 (pnpm 10 and npm 11): the scaffold resolved `@arcgis/core` and `@arcgis/map-components`
5.1.27, `@esri/calcite-components` 5.2.0, Vite 8.3 and TypeScript 7.0, and `pnpm build` (`tsc && vite build`)
passed.

## Decision Tree

1. **Which framework?**
   - Vanilla TS → use the scaffold as-is.
   - React 19+ → use Map Components directly (custom elements + `onarcgis*` event props).
   - Angular → add `CUSTOM_ELEMENTS_SCHEMA`; import component CSS explicitly.

2. **Do you have an API key yet?**
   - No → use `basemap="osm"` while developing; `arcgis/*` basemaps need a key (see Pitfall 3).
   - Yes → put it in `.env` as `VITE_ARCGIS_API_KEY`.

**Default:** Vite + vanilla TS with Map Components.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import esriConfig from "@arcgis/core/config.js";
```

### Dynamic Imports (CDN)

```javascript
const esriConfig = await $arcgis.import("@arcgis/core/config.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Vite + TypeScript strict

The scaffold uses the Vite `vanilla-ts` template with `moduleResolution: "bundler"`, which the SDK's package exports
require. Measured: the current template does **not** set `strict`, so the scaffold adds `"strict": true` itself.

### Concept 2: API key via environment

Set `esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY`. Vite only exposes variables prefixed with `VITE_`.
Keep the real key in `.env` and ship `.env.example`. Measured: the Vite template's `.gitignore` ignores `*.local` but
**not `.env`**; the scaffold appends it.

### Concept 3: Registering components and reaching the view

Map Components are custom elements registered via side-effect imports. To use the view from code, `await
el.viewOnReady()` and read `el.view`; the `arcgisViewReadyChange` event carries no payload.

## Common Pitfalls (Top 3)

### Pitfall 1: Reading the view from the event detail

```typescript
// ❌ Anti-pattern
mapEl.addEventListener("arcgisViewReadyChange", (e) => console.log((e as CustomEvent).detail.view));
```

```typescript
// ✅ Correct
const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
console.log(mapEl.view.type); // "2d"
```

**Impact:** measured with 5.1.27: the event fired once with `detail === null`, so `detail.view` throws
`Cannot read properties of null`. The previous version of this skill's own scaffold shipped that line.

### Pitfall 2: A `.env` that git does not ignore

```bash
# ❌ Anti-pattern
cp .env.example .env && git add . && git commit -m "init"   # the Vite template does not ignore .env
```

```bash
# ✅ Correct
grep -qx ".env" .gitignore || echo ".env" >> .gitignore   # the scaffold does this
```

**Impact:** measured: the generated `.gitignore` lists `*.local` but not `.env`, so the real API key goes into git
history. Never hardcode the key in source either.

### Pitfall 3: `arcgis/*` basemaps with no key

```html
<!-- ❌ Anti-pattern: no VITE_ARCGIS_API_KEY yet -->
<arcgis-map basemap="arcgis/topographic" center="-74.08,4.6" zoom="11"></arcgis-map>
```

```html
<!-- ✅ Correct while you have no key -->
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="11"></arcgis-map>
```

**Impact:** measured on the scaffolded app with no `.env`: a `401`, a sign-in `calcite-dialog`, and `view.ready`
still `false` after 15 s. Nothing in the console says "missing API key".

## When to Read references/

| If you need... | Read |
|---|---|
| Config / tsconfig / env details | `references/api-detail.md` |
| React 19 and Angular setups | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-core-maps` — build the map after scaffolding
- `arcgis-widgets-ui` — add Calcite + components UI
- `arcgis-performance` — optimize the bundle

## Reference Samples

- [Get started (npm)](https://developers.arcgis.com/javascript/latest/get-started-npm/)
- [intro-map-components](https://developers.arcgis.com/javascript/latest/sample-code/intro-map-components/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Ran the scaffold end to end (pnpm and npm), built it, and loaded it in Chromium;
  runtime checks in `tests/runtime/casos/arcgis-starter-app.ts`. Fixed the scaffold: its `main.ts` read
  `(e as CustomEvent).detail.view`, which throws (`detail` is `null`); the Vite template neither sets `strict` nor
  ignores `.env`; the final hint said `npm dev`. Dependencies now `^5.1`. Updated the moduleResolution pitfall
  (TypeScript 7 removed `node`; on 5.9 typed imports from map-components fail). New top pitfalls: the null detail,
  the unignored `.env`, and `arcgis/*` basemaps without a key.
- **0.1.0** (2026-05-31): Initial release.
