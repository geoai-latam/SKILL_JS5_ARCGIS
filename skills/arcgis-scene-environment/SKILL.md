---
name: arcgis-scene-environment
description: >
  Control the 3D environment of a SceneView in the ArcGIS Maps SDK for JavaScript
  5.0: sun/virtual lighting and shadows, atmosphere and stars, and weather effects
  (sunny, cloudy, rainy, snowy, foggy). Use this skill whenever the user adjusts
  lighting, shadows, time of day, atmosphere, or weather in a 3D scene.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Scene Environment

> **When to use:** Activate this skill whenever the user adjusts 3D lighting, shadows, time of day,
> atmosphere, or weather in a SceneView.

## Overview

A SceneView's `environment` controls lighting, atmosphere, and weather for realistic 3D.

- **Problem it solves:** realistic and analytical 3D rendering (shadows, time of day, weather).
- **Who it serves:** developers building digital twins and immersive scenes.
- **Pattern it teaches:** set `environment` (lighting/atmosphere/weather); use the daylight component for UI.
- **What it does NOT cover:** 3D layers (see `arcgis-3d-layers`) or the daylight UI widget (see `arcgis-widgets-advanced`).

## Quick Start

```typescript
import SceneView from "@arcgis/core/views/SceneView.js";
const view = new SceneView({ map, environment: { lighting: { type: "sun", directShadowsEnabled: true } } });
```

## Decision Tree

1. **Realistic sun/time-of-day + shadows?**
   - Yes → `environment.lighting = { type: "sun", date, directShadowsEnabled: true }`.

2. **Consistent, non-directional light?**
   - Yes → `lighting: { type: "virtual" }`.

3. **Weather mood (rain/snow/fog/clouds)?**
   - Yes → `environment.weather = { type: "rainy", cloudCover, precipitation }`.

**Default:** sun lighting with shadows for realism; weather for mood/analysis.

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
// Set environment on <arcgis-scene>, or add arcgis-daylight for a UI control.
import "@arcgis/map-components/dist/components/arcgis-scene";
```

## Key Concepts

### Concept 1: Lighting

`environment.lighting` is `sun` (date-driven, casts real shadows) or `virtual` (even light).
`directShadowsEnabled` toggles cast shadows; `date` sets the sun position.

### Concept 2: Atmosphere and stars

`atmosphereEnabled` and `starsEnabled` add sky realism. Atmosphere affects haze and horizon; stars
appear at night when sun lighting is used.

### Concept 3: Weather

`environment.weather` simulates `sunny` / `cloudy` / `rainy` / `snowy` / `foggy` with parameters
like `cloudCover` and `precipitation`, affecting mood and (visually) conditions.

## Common Pitfalls (Top 3)

### Pitfall 1: Expecting shadows without enabling them

```typescript
// ❌ Anti-pattern
environment: { lighting: { type: "sun" } }; // no shadows
```

```typescript
// ✅ Correct
environment: { lighting: { type: "sun", directShadowsEnabled: true } };
```

**Impact:** no cast shadows even with sun lighting.

### Pitfall 2: Setting environment on a MapView

```typescript
// ❌ Anti-pattern
new MapView({ environment: { ... } }); // 2D has no environment
```

```typescript
// ✅ Correct
new SceneView({ environment: { ... } });
```

**Impact:** environment is ignored in 2D.

### Pitfall 3: Heavy weather/shadows on weak GPUs

```typescript
// ❌ Anti-pattern
environment: { weather: { type: "rainy" }, lighting: { type: "sun", directShadowsEnabled: true } };
// plus high qualityProfile on a low-end device
```

```typescript
// ✅ Correct
view.qualityProfile = "medium"; // balance realism vs performance
```

**Impact:** frame drops from expensive shadow + weather rendering.

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

- [Scene lighting](https://developers.arcgis.com/javascript/latest/sample-code/scene-daylight/)
- [Weather](https://developers.arcgis.com/javascript/latest/sample-code/scene-weather/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
