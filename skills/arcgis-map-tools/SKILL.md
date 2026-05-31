---
name: arcgis-map-tools
description: >
  Add interactive map tools with the ArcGIS Maps SDK for JavaScript 5.0 Map
  Components: arcgis-sketch for drawing/editing geometry, arcgis-measurement (and
  area/distance variants) for measuring, and arcgis-snapping-controls for snapping.
  Use this skill whenever the user adds drawing, measuring, or snapping tools to a
  map or scene.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: specialized
tags:
  - sketch
  - measurement
  - snapping
  - tools
  - components
requires:
  - arcgis-interaction
packages:
  - "@arcgis/map-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Map Tools

> **When to use:** Activate this skill whenever the user adds drawing, measurement, or snapping
> tools to a map or scene.

## Overview

These components give users turnkey sketching, measuring, and snapping without custom code.

- **Problem it solves:** standard editing/measuring UX out of the box.
- **Who it serves:** developers adding interactive tools to a map app.
- **Pattern it teaches:** drop the component, bind it to the map, read its events.
- **What it does NOT cover:** programmatic drawing (see `arcgis-interaction`) or persistence (`arcgis-editing`).

## Quick Start

```typescript
import "@arcgis/map-components/dist/components/arcgis-sketch";
// <arcgis-map><arcgis-sketch position="top-right"></arcgis-sketch></arcgis-map>
```

## Decision Tree

1. **Draw/edit geometry interactively?**
   - Yes → `arcgis-sketch`.

2. **Measure distance/area?**
   - Yes → `arcgis-measurement` (or the 2d/3d distance/area variants).

3. **Snap to existing features while drawing?**
   - Yes → `arcgis-snapping-controls` alongside sketch.

**Default:** `arcgis-sketch` for drawing, `arcgis-measurement` for measuring.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/dist/components/arcgis-measurement";
```

### Dynamic Imports (CDN)

```javascript
const SketchVM = await $arcgis.import("@arcgis/core/widgets/Sketch/SketchViewModel.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/dist/components/arcgis-snapping-controls";
```

## Key Concepts

### Concept 1: Sketch component

`arcgis-sketch` provides a toolbar to draw points/lines/polygons and edit them. It manages its own
graphics layer; listen for create/update/delete events.

### Concept 2: Measurement components

`arcgis-measurement` switches between distance and area; dedicated `*-2d`/`*-3d` variants exist for
view-specific behavior. Results update live as the user measures.

### Concept 3: Snapping

`arcgis-snapping-controls` toggles snapping to feature/self/grid and is wired to the active sketch,
improving precision when drawing near existing geometry.

## Common Pitfalls (Top 3)

### Pitfall 1: Measurement component mismatched to view

```typescript
// ❌ Anti-pattern
// <arcgis-direct-line-measurement-3d> on a 2D map
```

```typescript
// ✅ Correct
// Use *-2d variants on a MapView, *-3d on a SceneView.
```

**Impact:** the tool does nothing in the wrong view type.

### Pitfall 2: Expecting sketch graphics to persist

```typescript
// ❌ Anti-pattern
// Drawing with arcgis-sketch and assuming it saves to the service
```

```typescript
// ✅ Correct
// Read the drawn geometry and persist via applyEdits (see arcgis-editing).
```

**Impact:** drawings vanish on reload; sketch is client-side.

### Pitfall 3: Snapping with nothing to snap to

```typescript
// ❌ Anti-pattern
// Enabling feature snapping with no snapping sources configured
```

```typescript
// ✅ Correct
// Configure snapping sources (layers) so snapping has targets.
```

**Impact:** snapping appears off because there are no sources.

## When to Read references/

| If you need... | Read |
|---|---|
| Tool component attributes/events | `references/api-detail.md` |
| Sketch / measure / snap examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-interaction` — programmatic SketchViewModel
- `arcgis-editing` — persist drawn geometry
- `arcgis-core-maps` — the map/scene to bind to

## Reference Samples

- [Sketch component](https://developers.arcgis.com/javascript/latest/sample-code/sketch-geometries/)
- [Measurement](https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
