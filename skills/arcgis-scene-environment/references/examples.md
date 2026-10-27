# Examples: Scene Environment

## Example 1: Sun lighting with shadows

**Use case:** realistic time-of-day with cast shadows.

```typescript
import SceneView from "@arcgis/core/views/SceneView.js";

const view = new SceneView({
  map,
  environment: {
    lighting: {
      type: "sun",
      date: new Date(Date.UTC(2026, 5, 21, 18)), // 13:00 in Bogotá
      directShadowsEnabled: true,
      cameraTrackingEnabled: false, // keep this instant while navigating
    },
    atmosphereEnabled: true,
  },
});
```

**Notes:**

- `directShadowsEnabled` turns on cast shadows.
- `date` sets the sun position; with the default `cameraTrackingEnabled: true` it shifts as the camera moves.

---

## Example 2: Virtual (even) lighting

**Use case:** analytical view without harsh shadows.

```typescript
const view = new SceneView({ map, environment: { lighting: { type: "virtual" } } });
```

**Notes:**

- Even illumination, no time-of-day.
- Good for inspecting geometry/colors.

---

## Example 3: Rainy weather

**Use case:** simulate weather conditions.

```typescript
const view = new SceneView({
  map,
  environment: { weather: { type: "rainy", cloudCover: 0.7, precipitation: 0.5 } },
});
```

**Notes:**

- Visual only, and only where `view.environment.weatherAvailable` is `true` (global scene, near the ground).
- Parameters are clamped to 0–1.
