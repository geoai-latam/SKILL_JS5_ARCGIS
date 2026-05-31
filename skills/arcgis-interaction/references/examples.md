# Examples: Interaction

## Example 1: Identify a clicked feature

**Use case:** select the feature under the cursor on one layer.

```typescript
view.on("click", async (event) => {
  const { results } = await view.hitTest(event, { include: [myLayer] });
  const hit = results[0];
  if (hit && "graphic" in hit) console.log(hit.graphic.attributes);
});
```

**Notes:**

- `include` keeps basemap/labels out of the result.
- Each result may reference a different layer; filter accordingly.

---

## Example 2: Draw a polygon

**Use case:** capture an area of interest.

```typescript
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";

const layer = new GraphicsLayer();
view.map?.add(layer);
const sketch = new SketchViewModel({ view, layer });
sketch.on("create", (e) => { if (e.state === "complete") console.log(e.graphic.geometry); });
sketch.create("polygon");
```

**Notes:**

- Only handle the `complete` state for final geometry.
- Use the drawn geometry as a spatial filter or edit candidate.

---

## Example 3: Throttled pointer tracking

**Use case:** show coordinates as the pointer moves.

```typescript
let last = 0;
const handle = view.on("pointer-move", (event) => {
  const now = performance.now();
  if (now - last < 50) return; // throttle to ~20fps
  last = now;
  console.log(event.x, event.y);
});
// handle.remove() on cleanup
```

**Notes:**

- Always throttle `pointer-move`.
- Remove the handle to avoid leaks.
