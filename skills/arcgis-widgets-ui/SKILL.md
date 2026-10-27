---
name: arcgis-widgets-ui
description: >
  Add core UI to a map with the ArcGIS Maps SDK for JavaScript 5.0 using Map
  Components: arcgis-legend, arcgis-layer-list, arcgis-search, and
  arcgis-basemap-gallery. Components are the recommended path; the equivalent Core
  API widgets are deprecated in 5.0. Use this skill whenever the user adds a
  legend, layer list, search box, or basemap picker to a map.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: widgets
tags:
  - legend
  - layerlist
  - search
  - basemap-gallery
  - components
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/map-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Widgets & UI

> **When to use:** Activate this skill whenever the user adds a legend, layer list, search box, or
> basemap gallery. Prefer Map Components — widgets are deprecated in 5.0.

## Overview

UI elements like legends and search are now Map Components placed in the map's slots.

- **Problem it solves:** standard map UI without hand-built panels.
- **Who it serves:** developers assembling a map app shell.
- **Pattern it teaches:** declare `<arcgis-*>` components with `reference-element` and a `position`/slot.
- **What it does NOT cover:** advanced widgets (see `arcgis-widgets-advanced`) or editing UI (`arcgis-editing`).

> ⚠️ Deprecated in 5.0, will be removed in 6.0 (Q1 2027): the Core API widgets
> (`@arcgis/core/widgets/Legend.js`, etc.). Use the components below instead.

## Quick Start

```typescript
import "@arcgis/map-components/components/arcgis-legend";
// <arcgis-map ...><arcgis-legend position="bottom-left"></arcgis-legend></arcgis-map>
```

## Decision Tree

1. **New project?**
   - Yes → Map Components (`<arcgis-legend>`, `<arcgis-search>`, ...).

2. **Maintaining a 4.x app mid-migration?**
   - Yes → keep the widget temporarily; plan migration before 6.0.

3. **Which UI?**
   - Symbology key → `arcgis-legend`; toggle layers → `arcgis-layer-list`;
     find places/features → `arcgis-search`; switch basemap → `arcgis-basemap-gallery`.

**Default:** components, placed via slots/positions on the map.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/components/arcgis-layer-list";
```

### Dynamic Imports (CDN)

```javascript
const Legend = await $arcgis.import("@arcgis/core/widgets/Legend.js"); // deprecated fallback
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-search";
```

## Key Concepts

### Concept 1: reference-element and positioning

Place a component inside `<arcgis-map>` (auto-bound) or elsewhere with `reference-element`
pointing at the map. Use `position` (e.g. `top-right`) or a Calcite shell slot.

### Concept 2: Component vs widget

Components wrap (and increasingly replace) the old widgets. Some 5.0 components are still "legacy"
(internally backed by a widget) during migration, but the component API is the target.

### Concept 3: Data binding

Components read from the bound map/view, so a `<arcgis-legend>` reflects the current layers and
renderers automatically — no manual wiring.

## Common Pitfalls (Top 3)

### Pitfall 1: Using the deprecated widget in a new app

```typescript
// ❌ Anti-pattern
import Legend from "@arcgis/core/widgets/Legend.js"; // deprecated in 5.0
```

```typescript
// ✅ Correct
import "@arcgis/map-components/components/arcgis-legend";
```

**Impact:** building on an API slated for removal in 6.0.

### Pitfall 2: Component with no map binding

```typescript
// ❌ Anti-pattern
// <arcgis-legend></arcgis-legend> placed outside the map, no reference-element
```

```typescript
// ✅ Correct
// <arcgis-legend reference-element="#myMap"></arcgis-legend>
```

**Impact:** the component renders empty because it has no view.

### Pitfall 3: Importing every component up front

```typescript
// ❌ Anti-pattern
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-print"; // unused here
```

```typescript
// ✅ Correct
import "@arcgis/map-components/components/arcgis-search"; // only what's used
```

**Impact:** larger bundle from unused components.

## When to Read references/

| If you need... | Read |
|---|---|
| Component attributes/events | `references/api-detail.md` |
| Placement + binding examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-core-maps` — the map components bind to
- `arcgis-widgets-advanced` — print, bookmarks, daylight, etc.
- `arcgis-layers` — the layers a legend/layer-list shows

## Reference Samples

- [Components overview](https://developers.arcgis.com/javascript/latest/components/)
- [Widget-to-component transition](https://developers.arcgis.com/javascript/latest/components-transition-plan/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
