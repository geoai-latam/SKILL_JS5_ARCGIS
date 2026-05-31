# Examples: Custom Rendering

## Example 1: Minimal RenderNode subclass

**Use case:** a custom pass that tints the scene.

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";

// In a real app, decorate with @subclass; here is the shape:
class TintNode extends RenderNode {
  render() {
    const output = this.bindRenderTarget();
    // ... draw with this.gl ...
    return output;
  }
}
```

**Notes:**

- Subclass `RenderNode` and implement `render`.
- Use `this.gl` for WebGL calls.

---

## Example 2: Attach to a SceneView

**Use case:** wire the node once the view is ready.

```typescript
const node = new TintNode({ view, produces: "composite-color", consumes: [{ name: "composite-color" }] });
// node is active until node.destroy()
```

**Notes:**

- `produces`/`consumes` place it in the pipeline.
- Destroy the node to remove the pass.

---

## Example 3: Request a redraw

**Use case:** update visuals when data changes.

```typescript
function onData() {
  // update buffers/uniforms, then:
  node.requestRender();
}
```

**Notes:**

- Prefer `requestRender()` over a tight loop.
- Update GPU resources before requesting a redraw.
