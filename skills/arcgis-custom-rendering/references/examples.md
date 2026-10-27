# Examples: Custom Rendering

Every example follows the shape measured in `tests/runtime/casos/arcgis-custom-rendering.ts`
(SDK 5.1.27).

## Example 1: A node that draws on the composite

**Use case:** draw on top of the scene before post-processing.

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
import type SceneView from "@arcgis/core/views/SceneView.js";

declare const view: SceneView;

const TintNode = RenderNode.createSubclass({
  consumes: { required: ["composite-color"] },
  produces: "composite-color",
  render() {
    const output = this.bindRenderTarget();
    // ... draw with this.gl (WebGL2) ...
    return output;
  },
});
const node = new TintNode({ view });
```

**Notes:**

- `createSubclass`, not `class extends`: the plain class throws in the constructor.
- `node.destroy()` removes the pass (measured: no `render` calls after it).

---

## Example 2: Geographic points into render coordinates

**Use case:** place vertices of your own geometry in a global scene.

```typescript
import * as webgl from "@arcgis/core/views/3d/webgl.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import type SceneView from "@arcgis/core/views/SceneView.js";

declare const view: SceneView;

const lonLatZ = [-74.08, 4.6, 2600, -75.57, 6.25, 1500]; // Bogotá, Medellín
const ecef = new Float64Array(lonLatZ.length);
webgl.toRenderCoordinates(view, lonLatZ, 0, SpatialReference.WGS84, ecef, 0, 2);
// Bogotá → [1744566, -6116243, 511728] (meters, ECEF)
```

**Notes:**

- Keep the Float64 result on the CPU; subtract a local origin before building a Float32 buffer.

---

## Example 3: Animate only while needed

**Use case:** a pulsing effect without a separate `requestAnimationFrame` loop.

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";

const Pulse = RenderNode.createSubclass({
  consumes: { required: ["composite-color"] },
  produces: "composite-color",
  render() {
    const output = this.bindRenderTarget();
    const t = performance.now() / 1000;
    // ... draw using t ...
    this.requestRender(); // ask for the next frame; stop calling it to stop animating
    return output;
  },
});
```

**Notes:**

- Without `requestRender()` the view stops calling `render` once the camera is still.

---

## Example 4: Custom WebGL in a 2D MapView

**Use case:** the 2D counterpart (RenderNode is SceneView only).

```typescript
import BaseLayerViewGL2D from "@arcgis/core/views/2d/layers/BaseLayerViewGL2D.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";

const CustomLayerView = BaseLayerViewGL2D.createSubclass({
  render(params: { context: WebGL2RenderingContext }) {
    const gl = params.context;
    // ... draw ...
  },
});

const CustomLayer = GraphicsLayer.createSubclass({
  createLayerView(view: { type: string }) {
    if (view.type === "2d") return new CustomLayerView({ view, layer: this });
  },
});
```

**Notes:**

- Measured: `render` was called 91 times in 1.5 s with a `WebGL2RenderingContext`.
