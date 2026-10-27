---
name: arcgis-starter-app
description: >
  Scaffold a new ArcGIS Maps SDK for JavaScript 5.0 web project from scratch with
  Vite and TypeScript (strict). Covers dependency setup, the API key via
  environment variables, Map Components registration, and framework integration
  for vanilla TS, React 19, and Angular. Use this skill whenever the user starts
  a new ArcGIS project, asks how to set up the SDK, or wires it into a framework.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: core
tags:
  - scaffolding
  - vite
  - typescript
  - setup
  - framework
packages:
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
  - "@esri/calcite-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Starter App

> **When to use:** Activate this skill whenever the user starts a new ArcGIS Maps SDK 5.0 project,
> sets up dependencies, configures the API key, or integrates the SDK into Vite, React 19, or Angular.

## Overview

This skill bootstraps a working SDK 5.0 project and wires it correctly so the first map renders.

- **Problem it solves:** going from empty folder to a running, type-safe ArcGIS app in minutes.
- **Who it serves:** developers (especially LATAM SEs) starting greenfield ArcGIS web apps.
- **Pattern it teaches:** Vite + TS strict, Map-Components-first, API key via `import.meta.env`.
- **What it does NOT cover:** building the map itself (see `arcgis-core-maps`) or adding data (`arcgis-layers`).

## Quick Start

```bash
bash scripts/scaffold.sh my-arcgis-app
cd my-arcgis-app
cp .env.example .env   # add VITE_ARCGIS_API_KEY
pnpm dev
```

## Decision Tree

1. **Which framework?**
   - Vanilla TS → use the scaffold as-is.
   - React 19+ → use Map Components directly (custom elements + event listeners).
   - Angular → add `CUSTOM_ELEMENTS_SCHEMA`; import component CSS explicitly.

2. **React below 19?**
   - Yes → consider the Core API; Map Components target modern custom-element support.
   - No → Map Components.

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

The scaffold uses the Vite `vanilla-ts` template with `strict: true` and
`moduleResolution: "bundler"`, which the SDK's package exports require.

### Concept 2: API key via environment

Set `esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY`. Vite only exposes variables
prefixed with `VITE_`. Keep the real key in `.env` (git-ignored), ship `.env.example`.

### Concept 3: Registering components

Map Components are custom elements registered via side-effect imports. Import only the components
you use so the bundler can tree-shake the rest.

## Common Pitfalls (Top 3)

### Pitfall 1: Wrong moduleResolution

```jsonc
// ❌ Anti-pattern
{ "compilerOptions": { "moduleResolution": "node" } }
```

```jsonc
// ✅ Correct
{ "compilerOptions": { "moduleResolution": "bundler" } }
```

**Impact:** `Cannot find module '@arcgis/...'` because subpath exports do not resolve.

### Pitfall 2: Hardcoding the API key

```typescript
// ❌ Anti-pattern
esriConfig.apiKey = "AAPK_real_key";
```

```typescript
// ✅ Correct
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

**Impact:** the secret leaks into git history; secret scanning / gitleaks blocks the push.

### Pitfall 3: Using the deprecated React wrapper on React 19

```typescript
// ❌ Anti-pattern
import { ArcgisMap } from "@arcgis/map-components-react";
```

```typescript
// ✅ Correct
import "@arcgis/map-components/components/arcgis-map"; // use the custom element + onArcgis* events
```

**Impact:** unnecessary wrapper layer; React 19 supports custom elements natively.

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

- **0.1.0** (2026-05-31): Initial release.
