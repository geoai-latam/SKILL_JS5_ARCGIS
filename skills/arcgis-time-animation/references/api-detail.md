# API Reference: Time & Animation

## Table of Contents

- [TimeExtent](#timeextent)
- [view.timeExtent](#viewtimeextent)
- [arcgis-time-slider](#arcgis-time-slider)

---

## TimeExtent

`@arcgis/core/time/TimeExtent.js`

| Property | Type | Description |
|---|---|---|
| `start` | `Date` | Window start |
| `end` | `Date` | Window end |

Build in UTC (`Date.UTC(...)`) to avoid time-zone drift.

---

## view.timeExtent

| Member | Description |
|---|---|
| `view.timeExtent` | The active window; filters all time-aware layers |
| `layer.timeInfo` | Defines `startField`/`endField` that make a layer time-aware |
| `layer.timeExtent` | Optional per-layer override |

---

## arcgis-time-slider

`@arcgis/map-components/components/arcgis-time-slider`

| Property | Description |
|---|---|
| `fullTimeExtent` | The total time range |
| `timeExtent` | The current window (drives `view.timeExtent`) |
| `stops` | Tick configuration (count/interval/dates) |
| `playRate` | Animation speed (ms per step) |
