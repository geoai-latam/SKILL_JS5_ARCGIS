---
name: arcgis-time-animation
description: >
  Visualize temporal data with the ArcGIS Maps SDK for JavaScript 5.0: the
  arcgis-time-slider component, view.timeExtent for filtering time-aware layers,
  and TimeExtent/TimeInterval for animation. Use this skill whenever the user
  animates data over time, filters a time-enabled layer, or builds a temporal
  playback experience.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: specialized
tags:
  - time
  - timeslider
  - timeextent
  - animation
  - temporal
requires:
  - arcgis-layers
packages:
  - "@arcgis/map-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Time & Animation

> **When to use:** Activate this skill whenever the user animates data over time, filters a
> time-aware layer, or builds temporal playback.

## Overview

Time-aware layers filter by a `timeExtent`; the time-slider drives it for playback.

- **Problem it solves:** showing how data changes over time.
- **Who it serves:** developers building temporal dashboards and playback.
- **Pattern it teaches:** `arcgis-time-slider` ↔ `view.timeExtent` ↔ time-aware layers.
- **What it does NOT cover:** the layers themselves (see `arcgis-layers`) or 3D weather (see `arcgis-scene-environment`).

## Quick Start

```typescript
import "@arcgis/map-components/dist/components/arcgis-time-slider";
// <arcgis-map><arcgis-time-slider position="bottom"></arcgis-time-slider></arcgis-map>
```

## Decision Tree

1. **Layer has time info (start/end fields)?**
   - Yes → it's time-aware; the slider/timeExtent filters it.
   - No → set `layer.timeInfo` or filter by attribute instead.

2. **Need playback UI?**
   - Yes → `arcgis-time-slider` bound to the map.

3. **Programmatic animation?**
   - Yes → step `view.timeExtent` on a timer/`TimeInterval`.

**Default:** the time-slider component drives `view.timeExtent`.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import TimeExtent from "@arcgis/core/time/TimeExtent.js";
```

### Dynamic Imports (CDN)

```javascript
const TimeExtent = await $arcgis.import("@arcgis/core/time/TimeExtent.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/dist/components/arcgis-time-slider";
```

## Key Concepts

### Concept 1: Time-aware layers

A layer with `timeInfo` (start/end fields) filters automatically to the current `view.timeExtent`.
Without `timeInfo`, time filtering does nothing.

### Concept 2: TimeExtent

`new TimeExtent({ start, end })` defines a window. Setting `view.timeExtent` filters all time-aware
layers to that window.

### Concept 3: The time-slider

`arcgis-time-slider` exposes `fullTimeExtent`, `stops`, and playback controls; moving it updates
`view.timeExtent`, which re-filters layers.

## Common Pitfalls (Top 3)

### Pitfall 1: Expecting time filtering without timeInfo

```typescript
// ❌ Anti-pattern
view.timeExtent = extent; // layer has no timeInfo → no effect
```

```typescript
// ✅ Correct
layer.timeInfo = { startField: "START", endField: "END" };
view.timeExtent = extent;
```

**Impact:** nothing filters because the layer isn't time-aware.

### Pitfall 2: Mismatched time zones / units

```typescript
// ❌ Anti-pattern
new TimeExtent({ start: new Date("2020-01-01") }); // local vs UTC ambiguity
```

```typescript
// ✅ Correct
new TimeExtent({ start: new Date(Date.UTC(2020, 0, 1)) });
```

**Impact:** off-by-hours filtering across time zones.

### Pitfall 3: Animating by re-querying every tick

```typescript
// ❌ Anti-pattern
setInterval(() => layer.queryFeatures(timeQuery), 200); // re-fetch each frame
```

```typescript
// ✅ Correct
setInterval(() => { view.timeExtent = nextWindow(); }, 200); // client-side filter
```

**Impact:** network thrash instead of smooth client-side filtering.

## When to Read references/

| If you need... | Read |
|---|---|
| TimeExtent / time-slider signatures | `references/api-detail.md` |
| Playback / filter examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-layers` — the time-aware layers
- `arcgis-core-maps` — the view holding `timeExtent`
- `arcgis-widgets-ui` — other UI components

## Reference Samples

- [TimeSlider](https://developers.arcgis.com/javascript/latest/sample-code/widgets-timeslider/)
- [Time visualization](https://developers.arcgis.com/javascript/latest/sample-code/visualization-update-data/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
