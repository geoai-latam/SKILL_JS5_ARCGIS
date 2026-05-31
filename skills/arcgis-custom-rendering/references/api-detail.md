# API Reference: Custom Rendering

## Table of Contents

- [RenderNode](#rendernode)
- [Pipeline placement](#pipeline-placement)
- [Coordinates & redraw](#coordinates--redraw)

---

## RenderNode

`@arcgis/core/views/3d/webgl/RenderNode.js` (abstract; subclass it)

| Member | Description |
|---|---|
| `view` | The owning SceneView |
| `gl` | The WebGL rendering context |
| `render(inputs)` | Implement to draw; return the output framebuffer |
| `requestRender()` | Ask the view to redraw |
| `destroy()` | Release the node |

---

## Pipeline placement

| Property | Description |
|---|---|
| `produces` | The render output this node provides |
| `consumes` | The inputs (`required`/`optional`) it reads |

These declare where the node sits in the render pipeline.

---

## Coordinates & redraw

| Concept | Notes |
|---|---|
| Render coordinate system | Transform world coords into it before drawing |
| Camera | Available via the view for view/projection matrices |
| Redraw | Call `requestRender()` instead of a tight animation loop |
