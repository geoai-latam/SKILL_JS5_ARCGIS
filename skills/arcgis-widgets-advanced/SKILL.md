---
name: arcgis-widgets-advanced
description: >
  Add advanced UI to a map with the ArcGIS Maps SDK for JavaScript 5.0 using Map
  Components: arcgis-print, arcgis-bookmarks, arcgis-compass, arcgis-daylight, and
  arcgis-elevation-profile. Components are recommended; the equivalent Core API
  widgets are deprecated in 5.0. Use this skill whenever the user adds printing,
  bookmarks, a compass, daylight controls, or an elevation profile.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: widgets
tags:
  - print
  - bookmarks
  - daylight
  - elevation-profile
  - components
requires:
  - arcgis-widgets-ui
packages:
  - "@arcgis/map-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Advanced Widgets

> **When to use:** Activate this skill whenever the user adds print, bookmarks, compass, daylight,
> or elevation-profile UI. Prefer Map Components — widgets are deprecated in 5.0.

## Overview

Advanced UI rounds out a map app: exporting, saved views, orientation, 3D lighting, and terrain profiles.

- **Problem it solves:** richer map tooling beyond the basics.
- **Who it serves:** developers building full-featured map apps and 3D scenes.
- **Pattern it teaches:** add the matching `<arcgis-*>` component bound to the map/scene.
- **What it does NOT cover:** core UI (see `arcgis-widgets-ui`) or editing (see `arcgis-editing`).

> ⚠️ Deprecated in 5.0, will be removed in 6.0 (Q1 2027): the Core API widgets
> (`@arcgis/core/widgets/Print.js`, etc.). Use the components below instead.

## Quick Start

```typescript
import "@arcgis/map-components/dist/components/arcgis-bookmarks";
// <arcgis-map ...><arcgis-bookmarks position="top-right"></arcgis-bookmarks></arcgis-map>
```

## Decision Tree

1. **Which capability?**
   - Export a layout → `arcgis-print`.
   - Saved viewpoints → `arcgis-bookmarks`.
   - Orientation/reset rotation → `arcgis-compass`.
   - 3D sun/shadows → `arcgis-daylight` (SceneView).
   - Terrain/line profile → `arcgis-elevation-profile`.

2. **2D or 3D?**
   - `arcgis-daylight` and most elevation work need a SceneView.

**Default:** the component matching the capability, bound to the map/scene.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/dist/components/arcgis-print";
```

### Dynamic Imports (CDN)

```javascript
const Print = await $arcgis.import("@arcgis/core/widgets/Print.js"); // deprecated fallback
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/dist/components/arcgis-daylight";
```

## Key Concepts

### Concept 1: Print and export

`arcgis-print` talks to a print service to export layouts (PDF/PNG). Configure allowed formats and
layouts; it needs a print service URL (ArcGIS Online provides one).

### Concept 2: Bookmarks

`arcgis-bookmarks` lists saved viewpoints. With a webmap, it can read saved bookmarks; you can also
let users add new ones at runtime.

### Concept 3: 3D-only components

`arcgis-daylight` (sun position/shadows) and rich elevation profiles target a SceneView. In 2D they
do nothing useful.

## Common Pitfalls (Top 3)

### Pitfall 1: Print without a print service

```typescript
// ❌ Anti-pattern
// <arcgis-print> with no print service configured
```

```typescript
// ✅ Correct
// Provide a print service URL (ArcGIS Online default or your own).
```

**Impact:** export fails because there's no service to render the layout.

### Pitfall 2: Daylight on a 2D MapView

```typescript
// ❌ Anti-pattern
// <arcgis-daylight reference-element="#map2d">
```

```typescript
// ✅ Correct
// <arcgis-daylight reference-element="#scene3d">
```

**Impact:** daylight controls have no effect without a SceneView.

### Pitfall 3: Using the deprecated widget

```typescript
// ❌ Anti-pattern
import Bookmarks from "@arcgis/core/widgets/Bookmarks.js"; // deprecated in 5.0
```

```typescript
// ✅ Correct
import "@arcgis/map-components/dist/components/arcgis-bookmarks";
```

**Impact:** building on an API slated for removal in 6.0.

## When to Read references/

| If you need... | Read |
|---|---|
| Advanced component attributes | `references/api-detail.md` |
| Print / bookmarks / daylight examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-widgets-ui` — core UI components
- `arcgis-scene-environment` — deeper 3D lighting/atmosphere
- `arcgis-core-maps` — the map/scene to bind to

## Reference Samples

- [Print component](https://developers.arcgis.com/javascript/latest/sample-code/widgets-print/)
- [ElevationProfile](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
