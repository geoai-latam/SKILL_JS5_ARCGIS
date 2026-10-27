---
name: arcgis-widgets-ui
description: >
  Add core UI to a map with the ArcGIS Maps SDK for JavaScript 5.1 using Map
  Components: arcgis-legend, arcgis-layer-list, arcgis-search, arcgis-basemap-gallery,
  and arcgis-expand, nested in the map with slot="top-right" (a position attribute
  is ignored) or bound from outside with reference-element (an unbound or
  mistyped one renders empty, silently). The equivalent Core widgets are
  deprecated (4.32 to 5.0). Use this skill whenever the user adds a legend, layer
  list, search box, or basemap picker to a map.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/map-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Widgets & UI

> **When to use:** Activate this skill whenever the user adds a legend, layer list, search box, or
> basemap gallery. Prefer Map Components — widgets are deprecated in 5.0.

## Overview

Legends, layer lists, and search are Map Components placed in the map's slots.

- **Problem it solves:** standard map UI without hand-built panels.
- **Who it serves:** developers assembling a map app shell.
- **Pattern it teaches:** nest `<arcgis-*>` components in the map with a `slot`, or bind them from elsewhere with
  `reference-element`.
- **What it does NOT cover:** advanced widgets (see `arcgis-widgets-advanced`) or editing UI (`arcgis-editing`).

> ⚠️ The Core widgets are deprecated: BasemapGallery since 4.32, Search since 4.33, Legend and Expand since 4.34,
> LayerList since 5.0. Use the components below.

## Quick Start

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="11">
  <arcgis-search slot="top-right"></arcgis-search>
  <arcgis-legend slot="bottom-left"></arcgis-legend>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-legend";
```

Measured on 5.1.27 without an API key: `arcgis-search` uses the World Geocoding Service by default, returned 6 results
for "Villa de Leyva" and moved the map there; `arcgis-basemap-gallery` listed 31 basemaps.

## Decision Tree

1. **New project?**
   - Yes → Map Components (`<arcgis-legend>`, `<arcgis-search>`, ...).

2. **Maintaining a 4.x app mid-migration?**
   - Yes → keep the widget temporarily; plan the move before 6.0.

3. **Which UI?**
   - Symbology key → `arcgis-legend`; toggle layers → `arcgis-layer-list`; find places → `arcgis-search`; switch
     basemap → `arcgis-basemap-gallery`; collapse any of them → `arcgis-expand`.

4. **Where does it go?**
   - Inside the map → `slot="top-right"` (or another corner); it binds by itself.
   - Elsewhere on the page → `reference-element="#mapId"` with the map's exact id.

**Default:** components nested in the map with a `slot`.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/components/arcgis-layer-list";
```

### Dynamic Imports (CDN)

```javascript
await $arcgis.import("@arcgis/map-components/components/arcgis-layer-list");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-search";
```

## Key Concepts

### Concept 1: Binding

A component nested in `<arcgis-map>` finds the view by itself, including inside an `arcgis-expand` (measured: the
layer list had the 2D view before the expand was opened). Outside the map it needs `reference-element`. Without a
view the component renders but shows nothing, and no error is raised.

### Concept 2: Placement is a slot

Corners are slots: `top-left`, `top-right`, `bottom-left`, `bottom-right`, and the `-start`/`-end` variants. Two
components in the same slot stack: measured, a search and a legend in `top-right` sat one above the other without
overlapping. There is no `position` property.

### Concept 3: Data binding

A bound `<arcgis-legend>` follows the map's layers and renderers: measured, adding a FeatureLayer gave it one entry in
`activeLayerInfos` with no wiring.

## Common Pitfalls (Top 3)

### Pitfall 1: Using the deprecated widget in a new app

```typescript
// ❌ Anti-pattern
import Legend from "@arcgis/core/widgets/Legend.js"; // deprecated since 4.34
```

```typescript
// ✅ Correct
import "@arcgis/map-components/components/arcgis-legend";
```

**Impact:** building on an API slated for removal in 6.0.

### Pitfall 2: A component with no map, or the wrong selector

```html
<!-- ❌ Anti-pattern: outside the map with no binding, or a selector that does not match -->
<arcgis-map id="myMap" basemap="osm"></arcgis-map>
<arcgis-legend reference-element="#map"></arcgis-legend>
```

```html
<!-- ✅ Correct -->
<arcgis-map id="myMap" basemap="osm"></arcgis-map>
<arcgis-legend reference-element="#myMap"></arcgis-legend>
```

**Impact:** measured: unbound and mistyped legends both had `view: null` and 0 layers, while the nested one had the 2D
view and 1 layer. Neither logged an error.

### Pitfall 3: Placing components with position

```html
<!-- ❌ Anti-pattern -->
<arcgis-map basemap="osm"><arcgis-legend position="bottom-left"></arcgis-legend></arcgis-map>
```

```html
<!-- ✅ Correct -->
<arcgis-map basemap="osm"><arcgis-legend slot="bottom-left"></arcgis-legend></arcgis-map>
```

**Impact:** measured in `arcgis-widgets-advanced`: with `position`, the component falls into the default slot, a strip
across the top of the map, instead of the corner. No error.

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

- **0.2.0** (2026-10-27): SDK 5.1. Runtime checks in `tests/runtime/casos/arcgis-widgets-ui.ts`. Every example placed
  components with `position`, which they do not have (they land in the default slot); now `slot`. The binding pitfall
  is now measured (unbound and mistyped legends: `view: null`, 0 layers, no error). Removed the false "overlapping
  positions" pitfall (two components in one slot stack, measured), the comment-only ones (widget-only APIs, styles),
  and the generic "import every component" one. Measured that search and the basemap gallery work without an API key
  and that a component inside `arcgis-expand` binds by itself. Corrected the deprecation versions (4.32 to 5.0), the
  `dist/components` import paths, the CDN import that pointed at the deprecated widget, and an `arcgis/topographic`
  basemap in an example that needs a key.
- **0.1.0** (2026-05-31): Initial release.
