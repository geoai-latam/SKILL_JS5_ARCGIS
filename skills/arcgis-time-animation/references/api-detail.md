# API Reference: Time & Animation

## Table of Contents

- [TimeExtent](#timeextent)
- [view.timeExtent and the layer](#viewtimeextent-and-the-layer)
- [arcgis-time-slider](#arcgis-time-slider)

---

## TimeExtent

`@arcgis/core/time/TimeExtent.js`

| Property | Type | Description |
|---|---|---|
| `start` | `Date` | Window start |
| `end` | `Date` | Window end |

Build dates with `Date.UTC(...)` or ISO strings; `new Date(y, m, d)` is local midnight.

---

## view.timeExtent and the layer

| Member | Description |
|---|---|
| `view.timeExtent` | The active window; filters all time-aware layers client-side |
| `layer.timeInfo` | `startField` (and optional `endField`) that make a layer time-aware; `fullTimeExtent` once loaded |
| `layer.timeExtent` | A per-layer window; the layer shows its intersection with the view's |
| `layer.useViewTime` | `false` makes the layer ignore `view.timeExtent` |

---

## arcgis-time-slider

`@arcgis/map-components/components/arcgis-time-slider`

| Member | Description |
|---|---|
| `fullTimeExtent` | The total range; `null` until you set it |
| `timeExtent` | The current window; moves `view.timeExtent` |
| `stops` | `{ interval: new TimeInterval({ value, unit }) }`, `{ count }`, or `{ dates }` (typed: `interval` is a `TimeInterval`) |
| `mode` | `"time-window"` (default), `"instant"`, `"cumulative-from-start"`, `"cumulative-from-end"` |
| `playRate` | Milliseconds per step (default 1000) |
| `loop` | Restart at the end (default `false`) |
| `next()` / `previous()` / `play()` / `stop()` | Step and playback methods |
