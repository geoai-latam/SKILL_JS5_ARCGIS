# API Reference: Interaction

## Table of Contents

- [view.hitTest](#viewhittest)
- [view events](#view-events)
- [SketchViewModel](#sketchviewmodel)

---

## view.hitTest

`hitTest(screenPoint | clickEvent, options?) => Promise<HitTestResult>`

| Option | Type | Description |
|---|---|---|
| `include` | `Layer[] \| Graphic[]` | Restrict to these layers/graphics |
| `exclude` | `Layer[]` | Skip these layers |

`HitTestResult.results` is an array; each item references a `graphic` and its `layer`.

---

## view events

| Event | Handler arg | Notes |
|---|---|---|
| `click` | `{ x, y, mapPoint }` | Single click/tap |
| `double-click` | `{ x, y, mapPoint }` | Double click |
| `pointer-move` | `{ x, y }` | High-frequency — throttle |

`view.on(name, handler)` returns a handle with `.remove()`.

---

## SketchViewModel

`@arcgis/core/widgets/Sketch/SketchViewModel.js`

| Member | Description |
|---|---|
| `new SketchViewModel({ view, layer })` | Draw into a GraphicsLayer |
| `create(tool)` | `"point" \| "polyline" \| "polygon" \| "rectangle" \| "circle"` |
| `update(graphics)` | Edit existing graphics |
| `on("create" / "update", cb)` | Events; check `event.state` |
