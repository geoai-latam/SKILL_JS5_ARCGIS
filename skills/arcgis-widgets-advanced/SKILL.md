---
name: arcgis-widgets-advanced
description: >
  Add advanced UI to a map with the ArcGIS Maps SDK for JavaScript 5.1 using Map
  Components: arcgis-print, arcgis-bookmarks, arcgis-compass, arcgis-daylight, and
  arcgis-elevation-profile, placed with slot="top-right" (a position attribute
  is ignored). Covers the elevation profile's results on the analysis view (the
  4.x line statistics are gone) and its need for a ground, and the matching Core
  widgets, deprecated between 4.32 and 5.0. Use this skill whenever the user adds
  printing, bookmarks, a compass, daylight controls, or an elevation profile.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/map-components@^5.1"
  - "@arcgis/core@^5.1"
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
- **Pattern it teaches:** nest the matching `<arcgis-*>` component in the map with a `slot`, and read analysis
  results where 5.x puts them.
- **What it does NOT cover:** core UI (see `arcgis-widgets-ui`) or editing (see `arcgis-editing`).

> ⚠️ The Core widgets are deprecated (Compass since 4.32, Print since 4.33, Bookmarks and Daylight since 4.34,
> ElevationProfile since 5.0). Use the components below.

## Quick Start

```html
<arcgis-map basemap="osm" ground="world-elevation" center="-74.1,4.65" zoom="9">
  <arcgis-bookmarks slot="top-right" show-add-bookmark-button></arcgis-bookmarks>
  <arcgis-compass slot="top-left"></arcgis-compass>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-bookmarks";
import "@arcgis/map-components/components/arcgis-compass";
```

A component nested in the map goes to a corner through `slot`. Measured on 5.1.27: with `position="top-right"`
instead, the compass landed in the default slot as a 600×32 strip across the top of the map; with
`slot="top-right"` it sat in the corner at 32×32.

## Decision Tree

1. **Which capability?**
   - Export a layout → `arcgis-print` (ArcGIS Online's print service by default).
   - Saved viewpoints → `arcgis-bookmarks` (from a web map, or added by the user with `show-add-bookmark-button`).
   - Orientation and reset rotation → `arcgis-compass` (works in 2D too).
   - Sun and shadows → `arcgis-daylight` in `arcgis-scene`.
   - Terrain profile along a line → `arcgis-elevation-profile`, with a `ground` on the map or scene.

2. **Inside the map or elsewhere on the page?**
   - Inside → `slot="top-right"` (or another corner); `reference-element` is not needed.
   - Outside → `reference-element="#map"`.

**Default:** the component matching the capability, nested in the map with a `slot`.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/components/arcgis-print";
```

### Dynamic Imports (CDN)

```javascript
await $arcgis.import("@arcgis/map-components/components/arcgis-print");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-daylight";
```

## Key Concepts

### Concept 1: Placement is a slot

Map components nested in `arcgis-map` or `arcgis-scene` are placed with `slot` (`top-left`, `top-right`,
`bottom-left`, `bottom-right`, and the `-start`/`-end` variants). None of the five components has a `position`
property; the attribute is ignored and the component falls into the default slot.

### Concept 2: Print works out of the box

`arcgis-print` uses ArcGIS Online's print service when `printServiceUrl` is not set. Measured: with no URL and no API
key, it reached `state: "ready"` in about 5 s with all layouts allowed and no sign-in dialog. Exporting itself was not
measured.

### Concept 3: Elevation profile results live on the analysis view

In 5.x the component's `profiles` are configuration only. The numbers are on the analysis view:
`await mapEl.whenAnalysisView(profile.analysis)` gives `progress`, `results` (one per profile line, with `available`
and `statistics`), and combined `statistics`. Measured: `line.statistics` (the 4.x shape) is `undefined`.

## Common Pitfalls (Top 3)

### Pitfall 1: Placing components with position

```html
<!-- ❌ Anti-pattern: not a property of these components -->
<arcgis-map basemap="osm"><arcgis-compass position="top-right"></arcgis-compass></arcgis-map>
```

```html
<!-- ✅ Correct -->
<arcgis-map basemap="osm"><arcgis-compass slot="top-right"></arcgis-compass></arcgis-map>
```

**Impact:** measured: the component went to the default slot, a strip across the top of the map, instead of the
corner. No error.

### Pitfall 2: An elevation profile on a map without ground

```html
<!-- ❌ Anti-pattern -->
<arcgis-map basemap="osm"><arcgis-elevation-profile slot="bottom-right"></arcgis-elevation-profile></arcgis-map>
```

```html
<!-- ✅ Correct -->
<arcgis-map basemap="osm" ground="world-elevation">
  <arcgis-elevation-profile slot="bottom-right"></arcgis-elevation-profile>
</arcgis-map>
```

**Impact:** measured on a line across the Eastern Cordillera by Bogotá: without `ground`, `progress` stayed 0 and the
ground profile was `available: false`, with no error. With `ground="world-elevation"` it finished with a maximum of
3565 m.

### Pitfall 3: Reading profile statistics from the line (4.x)

```typescript
// ❌ Anti-pattern: undefined in 5.x
const max = profileEl.profiles.at(0)?.statistics?.maxElevation;
```

```typescript
// ✅ Correct
const analysisView = await mapEl.whenAnalysisView(profileEl.analysis!);
// whenAnalysisView returns a union of analysis views: narrow it
const max = analysisView.type === "elevation-profile-view-2d" ? analysisView.statistics?.maxElevation : undefined;
```

**Impact:** measured: `statistics` on the profile line is `undefined`; the code reads nothing and shows `NaN`.

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
- [Elevation Profile component](https://developers.arcgis.com/javascript/latest/references/map-components/components/arcgis-elevation-profile/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Runtime checks in `tests/runtime/casos/arcgis-widgets-advanced.ts`. Every
  example placed components with `position="top-right"`, which these components do not have: measured, they land in
  the default slot as a strip across the map; now `slot`. The elevation profile reads its results from the analysis
  view (the 4.x `line.statistics` is `undefined`, measured) and needs a `ground` (without it, `progress` stays 0 and
  nothing errors, measured). Removed false or empty pitfalls: print does work without a URL (ArcGIS Online by
  default, `state: "ready"` with no key), the compass does work in 2D (it followed a 45° rotation), and the
  comment-only ones. Corrected the deprecation versions (4.32 to 5.0, not all 5.0), the `dist/components` import
  paths, and the CDN import, which pointed at the deprecated widget.
- **0.1.0** (2026-05-31): Initial release.
