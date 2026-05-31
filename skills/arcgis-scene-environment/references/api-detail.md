# API Reference: Scene Environment

## Table of Contents

- [SceneView.environment](#sceneviewenvironment)
- [Lighting](#lighting)
- [Weather](#weather)

---

## SceneView.environment

`environment` (SceneView property / constructor option):

| Field | Type | Description |
|---|---|---|
| `lighting` | object | Sun or virtual lighting + shadows |
| `atmosphereEnabled` | `boolean` | Sky haze/horizon |
| `starsEnabled` | `boolean` | Night stars (with sun lighting) |
| `weather` | object | Weather effect |
| `background` | object | Background color/sky |

---

## Lighting

| Field | Type | Description |
|---|---|---|
| `type` | `"sun" \| "virtual"` | Directional sun vs even virtual light |
| `date` | `Date` | Sun position / time of day |
| `directShadowsEnabled` | `boolean` | Cast shadows |

---

## Weather

| `type` | Parameters |
|---|---|
| `sunny` | `cloudCover` |
| `cloudy` | `cloudCover` |
| `rainy` | `cloudCover`, `precipitation` |
| `snowy` | `cloudCover`, `precipitation`, `snowCover` |
| `foggy` | `fogStrength` |
