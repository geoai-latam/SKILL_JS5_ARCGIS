# API Reference: Custom Rendering

Checked against the `@arcgis/core` 5.1.27 typings.

## Table of Contents

- [RenderNode](#rendernode)
- [Inputs and outputs](#inputs-and-outputs)
- [webgl utilities](#webgl-utilities)
- [RenderCamera](#rendercamera)
- [BaseLayerViewGL2D](#baselayerviewgl2d)

---

## RenderNode

`@arcgis/core/views/3d/webgl/RenderNode.js`: abstract Accessor, **experimental**. Subclass with
`RenderNode.createSubclass({...})`.

| Member | Description |
|---|---|
| `view` (constructor) | The SceneView; the node is active once constructed |
| `consumes` (constructor) | `{ required: RenderNodeInput[], optional?: RenderNodeInput[] }` |
| `produces` | One `RenderNodeOutput` |
| `gl` | `WebGL2RenderingContext` |
| `camera` | `RenderCamera` of the current frame |
| `sunLight` | Lighting of the current frame |
| `render(inputs: ManagedFBO[])` | Implement it; return the produced `ManagedFBO` |
| `bindRenderTarget()` | Binds and returns the output FBO (draw on top) |
| `acquireOutputFramebuffer()` | A new output FBO (when reading the input as a texture) |
| `requestRender()` | Ask for another frame |
| `resetWebGLState()` | Reset GL state to the defaults the engine expects |
| `destroy()` | Remove the node from the pipeline |

---

## Inputs and outputs

| Name | Output | Input | Contents |
|---|---|---|---|
| `opaque-color` | ✅ | ✅ | After opaque geometry |
| `transparent-color` | ✅ | ✅ | After opaque and transparent geometry |
| `composite-color` | ✅ | ✅ | Before post-processing |
| `final-color` | ✅ | ✅ | After post-processing |
| `normals` | — | ✅ | Normals |
| `highlights` | — | ✅ | Highlights (missing when nothing is highlighted) |

A missing required input skips the node for that frame. Order restrictions apply: `opaque-color`
cannot require `composite-color`.

---

## webgl utilities

`@arcgis/core/views/3d/webgl.js`

| Function | Description |
|---|---|
| `toRenderCoordinates(view, src, srcStart, srcSR, dest, destStart, count)` | Map coords → render coords (ECEF in global) |
| `fromRenderCoordinates(view, src, srcStart, dest, destStart, destSR, count)` | Back |
| `renderCoordinateTransformAt(view, origin, srcSR?, dest?)` | 4×4 local frame at a point: use as local origin |
| `toRenderCamera(view, camera)` / `fromRenderCamera(view, renderCamera)` | Camera ↔ RenderCamera |

---

## RenderCamera

| Member | Description |
|---|---|
| `viewMatrix`, `projectionMatrix` | 4×4, 16 numbers |
| `viewInverseTransposeMatrix` | For normals |
| `eye`, `center`, `up` | Render coordinates |
| `near`, `far`, `fovX`, `fovY` | Frustum |
| `viewport`, `pixelRatio` | `[x, y, w, h]` and the device pixel ratio |

---

## BaseLayerViewGL2D

`@arcgis/core/views/2d/layers/BaseLayerViewGL2D.js`: custom WebGL in a MapView. Return an
instance from a layer's `createLayerView(view)`.

| Member | Description |
|---|---|
| `attach()` / `detach()` | Create / free GL resources |
| `render({ context, state, stationary })` | Draw; `context` is a `WebGL2RenderingContext` |
| `requestRender()` | Ask for another frame |
| `bindRenderTarget()` / `getRenderTarget()` | The framebuffer to draw into |
| `tiles` | Tiles currently visible (tiled layer views) |
