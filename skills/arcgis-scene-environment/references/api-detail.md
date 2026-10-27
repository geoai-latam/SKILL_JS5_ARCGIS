# API Reference: Scene Environment

## Table of Contents

- [SceneView.environment](#sceneviewenvironment)
- [Lighting](#lighting)
- [Weather](#weather)

---

## SceneView.environment

`environment` (SceneView property / constructor option). Defaults measured with 5.1.27:

| Field | Type | Default | Description |
|---|---|---|---|
| `lighting` | `SunLighting \| VirtualLighting` | sun | Lighting + shadows |
| `atmosphereEnabled` | `boolean` | `true` | Sky haze/horizon |
| `starsEnabled` | `boolean` | `true` | Night stars (with sun lighting) |
| `weather` | weather object | `sunny` | Weather effect |
| `weatherAvailable` | `boolean` (read-only) | — | `true` only in global scenes at low altitude |
| `background` | object | — | Background color |

---

## Lighting

| Field | Type | Default | Description |
|---|---|---|---|
| `type` | `"sun" \| "virtual"` | `"sun"` | Directional sun vs even virtual light |
| `date` | `Date` (sun) | 15 March, local solar noon under the camera | Sun position |
| `cameraTrackingEnabled` | `boolean` (sun) | `true` | Moves `date` to keep the local time as the camera moves |
| `displayUTCOffset` | `number` (sun) | — | Offset shown by the daylight UI |
| `directShadowsEnabled` | `boolean` | `false` | Cast shadows (sun and virtual) |

---

## Weather

Parameters are clamped to 0–1.

| `type` | Parameters (default) |
|---|---|
| `sunny` | `cloudCover` (0.5) |
| `cloudy` | `cloudCover` (0.5) |
| `rainy` | `cloudCover` (0.5), `precipitation` (0.5) |
| `snowy` | `cloudCover` (0.5), `precipitation` (0.5), `snowCover` (`"disabled"`) |
| `foggy` | `fogStrength` (0.5) |

UI components: `arcgis-daylight` and `arcgis-weather` (`@arcgis/map-components`).
