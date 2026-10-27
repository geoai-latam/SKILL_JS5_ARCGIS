---
name: arcgis-scene-environment
description: >
  Control the 3D environment of a SceneView in the ArcGIS Maps SDK for JavaScript
  5.1: sun/virtual lighting and shadows (off by default), the sun date and
  cameraTrackingEnabled (which moves the date when the camera moves), atmosphere
  and stars, and weather (only available in global scenes at low altitude). Use
  this skill whenever the user adjusts lighting, shadows, a shadow study at a
  fixed time, atmosphere, or weather in a 3D scene.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: specialized
tags:
  - sceneview
  - lighting
  - shadows
  - weather
  - atmosphere
requires:
  - arcgis-3d-layers
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Scene Environment

> **When to use:** Activate this skill whenever the user adjusts 3D lighting, shadows, time of day,
> atmosphere, or weather in a SceneView.

## Overview

A SceneView's `environment` controls lighting, atmosphere, and weather.

- **Problem it solves:** realistic and analytical 3D rendering (shadows, time of day, weather).
- **Who it serves:** developers building digital twins, shadow studies and immersive scenes.
- **Pattern it teaches:** set `environment` (lighting/atmosphere/weather); `arcgis-daylight` / `arcgis-weather` for UI.
- **What it does NOT cover:** 3D layers (see `arcgis-3d-layers`) or other widgets (see `arcgis-widgets-advanced`).

## Quick Start

```typescript
import SceneView from "@arcgis/core/views/SceneView.js";

const view = new SceneView({
  map,
  environment: {
    lighting: {
      type: "sun",
      date: new Date("2026-06-21T12:00:00-05:00"), // explicit offset: noon in Bogotá
      directShadowsEnabled: true,                  // false by default
      cameraTrackingEnabled: false,                // keep that instant when the user navigates
    },
  },
});
```

## Decision Tree

1. **Sun at a fixed instant (shadow study, "how does it look on 21 June at 15:00")?**
   - Yes → `type: "sun"`, a `date` with an explicit offset, `directShadowsEnabled: true`, `cameraTrackingEnabled: false`.

2. **"Same local time wherever the user looks"?**
   - Yes → keep `cameraTrackingEnabled: true` (the default).

3. **Even, non-directional light?**
   - Yes → `lighting: { type: "virtual" }` (it can still cast shadows).

4. **Weather (rain/snow/fog/clouds)?**
   - Yes → `environment.weather = { type: "rainy", … }`, in a global scene, and check `environment.weatherAvailable`.

**Default:** sun lighting; turn shadows on explicitly; pin the date for anything analytical.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import SceneView from "@arcgis/core/views/SceneView.js";
```

### Dynamic Imports (CDN)

```javascript
const SceneView = await $arcgis.import("@arcgis/core/views/SceneView.js");
```

### Map Components (recommended for new projects)

```typescript
// Set environment on <arcgis-scene>; arcgis-daylight and arcgis-weather give the UI.
import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-daylight";
```

## Key Concepts

### Concept 1: Lighting and its defaults

`environment.lighting` is `sun` (date-driven) or `virtual` (even light). Measured defaults in 5.1.27:
`type` `"sun"`, `directShadowsEnabled` `false`, `cameraTrackingEnabled` `true`, and a `date` of **15 March at local
solar noon under the camera** (16:56 UTC for a camera over Bogotá), not the current date. Lighting can be swapped
at runtime: `view.environment.lighting = { type: "virtual", directShadowsEnabled: true }` autocasts.

### Concept 2: Atmosphere and stars

`atmosphereEnabled` and `starsEnabled` are both `true` by default (measured).

### Concept 3: Weather

`environment.weather` is `sunny` (default) / `cloudy` / `rainy` / `snowy` / `foggy`. Parameters are 0–1 and are
clamped (measured: `precipitation: 3` became `1`). It only renders where `environment.weatherAvailable` is `true`:
global scenes near the ground.

## Common Pitfalls (Top 3)

### Pitfall 1: Expecting shadows from sun lighting alone

```typescript
// ❌ Anti-pattern
const sinSombras = { lighting: { type: "sun" } } as const;
```

```typescript
// ✅ Correct
const conSombras = { lighting: { type: "sun", directShadowsEnabled: true } } as const;
```

**Impact:** measured: `directShadowsEnabled` is `false` by default for both sun and virtual lighting.

### Pitfall 2: A shadow study whose hour moves when the user navigates

```typescript
// ❌ Anti-pattern
view.environment.lighting = { type: "sun", date: new Date(Date.UTC(2026, 5, 21, 17)), directShadowsEnabled: true };
```

```typescript
// ✅ Correct
view.environment.lighting = {
  type: "sun", date: new Date(Date.UTC(2026, 5, 21, 17)), directShadowsEnabled: true, cameraTrackingEnabled: false,
};
```

**Impact:** measured: with the default `cameraTrackingEnabled: true`, moving the camera from Bogotá to Tokyo
changed `date` from `2026-06-21T17:00Z` to `2026-06-21T02:44Z` (it keeps the local time of day, not the instant).
With `false` it stayed at 17:00Z.

### Pitfall 3: Weather that silently does not show

```typescript
// ❌ Anti-pattern
new SceneView({ map, viewingMode: "local", environment: { weather: { type: "rainy" } } });
```

```typescript
// ✅ Correct
const scene = new SceneView({ map, environment: { weather: { type: "rainy", precipitation: 0.6 } } }); // global
await scene.when();
if (!scene.environment.weatherAvailable) showHint("Zoom in to see the weather");
```

**Impact:** measured: `weather.type` was `"rainy"` in all three cases, but `weatherAvailable` was `true` only in a
global scene at 3 km; `false` at 3000 km and `false` in a local scene. Nothing errors.

## When to Read references/

| If you need... | Read |
|---|---|
| environment / lighting / weather signatures | `references/api-detail.md` |
| Lighting / shadow / weather examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-3d-layers` — the 3D content being lit
- `arcgis-widgets-advanced` — the daylight UI component
- `arcgis-core-maps` — create the SceneView

## Reference Samples

- [Scene lighting](https://developers.arcgis.com/javascript/latest/sample-code/)
- [Weather](https://developers.arcgis.com/javascript/latest/sample-code/scene-weather/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Measured in `tests/runtime/casos/arcgis-scene-environment.ts`. New top pitfalls:
  `cameraTrackingEnabled` (default `true`) moves the sun date when the camera moves, and weather only shows where
  `weatherAvailable` is true (not in local scenes nor high up). Documented the real defaults (15 March at local
  noon, not "now"; shadows off; atmosphere and stars on). Fixed the date pitfall (a date-only string is UTC
  midnight, not local midnight). Moved the GPU pitfall to the extended list (not measured) and replaced three
  comment-only extended pitfalls.
- **0.1.0** (2026-05-31): Initial release.
