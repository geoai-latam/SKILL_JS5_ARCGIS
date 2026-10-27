---
name: arcgis-time-animation
description: >
  Visualize temporal data with the ArcGIS Maps SDK for JavaScript 5.1: the
  arcgis-time-slider component (which does not pick up a layer's range by itself:
  set fullTimeExtent from layer.timeInfo), view.timeExtent for filtering
  time-aware layers client-side, timeInfo (a misspelled field filters nothing,
  silently), useViewTime, and building dates in UTC. Use this skill whenever the
  user animates data over time, filters a time-enabled layer, or builds a
  temporal playback experience.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/map-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Time & Animation

> **When to use:** Activate this skill whenever the user animates data over time, filters a
> time-aware layer, or builds temporal playback.

## Overview

Time-aware layers filter to the view's `timeExtent`; the time slider moves that window for playback.

- **Problem it solves:** showing how data changes over time.
- **Who it serves:** developers building temporal dashboards and playback.
- **Pattern it teaches:** `arcgis-time-slider` → `view.timeExtent` → time-aware layers, with the range set explicitly.
- **What it does NOT cover:** the layers themselves (see `arcgis-layers`) or 3D weather (see `arcgis-scene-environment`).

## Quick Start

```html
<arcgis-map basemap="osm" center="-60,25" zoom="3">
  <arcgis-time-slider slot="bottom-left"></arcgis-time-slider>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-time-slider";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import TimeInterval from "@arcgis/core/time/TimeInterval.js";

const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
const hurricanes = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer/0" }); // time-enabled, Aug–Oct 2000
mapEl.map?.add(hurricanes);
await hurricanes.load();

const slider = document.querySelector("arcgis-time-slider")!;
slider.fullTimeExtent = hurricanes.timeInfo!.fullTimeExtent; // the slider does not find it by itself
slider.stops = { interval: new TimeInterval({ value: 1, unit: "days" }) };
```

Measured on 5.1.27: before `fullTimeExtent` is set, the slider's `fullTimeExtent`, its `timeExtent` and
`view.timeExtent` are all `null`. Once set, the slider moves `view.timeExtent` one stop per `next()`. A plain
`{ value, unit }` for `stops.interval` runs (autocast) but fails strict TypeScript with TS2740: use `TimeInterval`.

## Decision Tree

1. **Does the layer have `timeInfo`?**
   - Yes (the service is time-enabled) → it filters to `view.timeExtent`.
   - No → set `layer.timeInfo = { startField }` with a field name that exists.

2. **Need playback UI?**
   - Yes → `arcgis-time-slider` in the map, with `fullTimeExtent` and `stops`.

3. **Programmatic animation or a fixed window?**
   - Yes → assign `view.timeExtent`; it filters client-side, with no request per step.

4. **One layer should ignore the window?**
   - Yes → `layer.useViewTime = false`.

**Default:** the slider drives `view.timeExtent`, with its range taken from `layer.timeInfo.fullTimeExtent`.

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
import "@arcgis/map-components/components/arcgis-time-slider";
```

## Key Concepts

### Concept 1: Time-aware layers

A layer with `timeInfo` filters to the current `view.timeExtent`. Without `timeInfo` the window does nothing: in a
measured layer of 12 monthly points, a January window left all 12 visible, and with `timeInfo` it left 1.

### Concept 2: The window is applied in the client

Changing `view.timeExtent` re-filters what the layer already has. Measured on the hurricanes layer: 10 weekly steps
made 0 requests to `/query`.

### Concept 3: Two windows intersect

`layer.timeExtent` narrows that layer further, and the layer shows the intersection with the view's window.
`layer.useViewTime = false` makes a layer ignore the view's window entirely.

## Common Pitfalls (Top 3)

### Pitfall 1: Expecting the slider to read the layer's range

```typescript
// ❌ Anti-pattern: a time-aware layer in the map and nothing else
mapEl.map?.add(hurricanes);
```

```typescript
// ✅ Correct
await hurricanes.load();
slider.fullTimeExtent = hurricanes.timeInfo!.fullTimeExtent;
```

**Impact:** measured: with only the layer in the map, the slider's `fullTimeExtent` was `null` after 3 s, and
nothing was filtered.

### Pitfall 2: Building dates in local time

```typescript
// ❌ Anti-pattern: midnight in the browser's zone, not in UTC
new TimeExtent({ start: new Date(2020, 0, 1), end: new Date(2020, 0, 31) });
```

```typescript
// ✅ Correct (a date-only ISO string is UTC as well)
new TimeExtent({ start: new Date(Date.UTC(2020, 0, 1)), end: new Date(Date.UTC(2020, 0, 31)) });
```

**Impact:** measured in America/Bogota with data stamped at 00:00 UTC: the local window starts 5 h late and showed 0
of 1 January records; `Date.UTC` and `new Date("2020-01-01")` showed 1 of 1.

### Pitfall 3: A timeInfo field that does not exist

```typescript
// ❌ Anti-pattern
layer.timeInfo = { startField: "FECHA" }; // the field is "fecha"
```

```typescript
// ✅ Correct
await layer.load();
const field = layer.getField("fecha"); // null if it does not exist
if (field?.type === "date") layer.timeInfo = { startField: field.name };
```

**Impact:** measured: no error, no `fullTimeExtent`, and all 12 records stayed visible in a one-month window.

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

- **0.2.0** (2026-10-27): SDK 5.1. Runtime checks in `tests/runtime/casos/arcgis-time-animation.ts`. The time-zone
  pitfall used a false anti-pattern: `new Date("2020-01-01")` is already UTC; the local trap is
  `new Date(2020, 0, 1)` (measured: 0 of 1 records in Bogotá). New top pitfall: the slider does not pick up the
  layer's range (`fullTimeExtent` stays null). A misspelled `timeInfo` field is now measured (silent, no filtering).
  Measured that `view.timeExtent` filters client-side (0 requests in 10 steps), plus `useViewTime` and the
  `layer.timeExtent` intersection. Replaced the comment-only pitfalls and the placeholder web map with a public
  time-enabled layer. `stops.interval` is now a `TimeInterval` (a plain object fails strict TS).
- **0.1.0** (2026-05-31): Initial release.
