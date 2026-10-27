# Examples: Interaction

## Example 1: Identify a clicked feature from a service layer

**Use case:** show a name from the feature under the cursor.

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const states = new FeatureLayer({ url: "https://.../USA/MapServer/2", outFields: ["state_name"] });
view.map?.add(states);
view.on("click", async (event) => {
  const { results } = await view.hitTest(event, { include: [states] });
  const hit = results.find((r) => r.type === "graphic");
  if (hit?.type === "graphic") console.log(hit.graphic.attributes.state_name);
});
```

**Notes:**

- Without `outFields`, the hit only carries `objectid` (measured).
- `include` keeps other layers out; results come top layer first.

---

## Example 2: Draw a polygon

**Use case:** capture an area of interest.

```typescript
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";

const layer = new GraphicsLayer();
view.map?.add(layer);
const sketch = new SketchViewModel({ view, layer });
sketch.on("create", (e) => { if (e.state === "complete") console.log(e.graphic?.geometry); });
void sketch.create("polygon");
```

**Notes:**

- Only handle `complete`; `active` fires once per vertex and cursor move.
- Starting another `create()` cancels this one (`state: "cancel"`).

---

## Example 3: Hover highlight without flooding hitTest

**Use case:** highlight the feature under the pointer.

```typescript
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";

const layerView = await view.whenLayerView(myLayer);
let current: { remove(): void } | undefined;
const hover = promiseUtils.debounce(async (e: { x: number; y: number }) => {
  const hit = (await view.hitTest(e, { include: [myLayer] })).results.find((r) => r.type === "graphic");
  current?.remove();
  current = hit?.type === "graphic" ? layerView.highlight(hit.graphic) : undefined;
});
const handle = view.on("pointer-move", (e) => {
  hover(e).catch((err) => { if (!promiseUtils.isAbortError(err)) throw err; });
});
// handle.remove() on cleanup
```

**Notes:**

- The SDK delivers every move; `debounce` keeps one hitTest in flight.
- Swallow `AbortError`: it is the expected result for the skipped calls.

---

## Example 4: SceneView click on terrain

**Use case:** get the clicked ground location in 3D.

```typescript
sceneView.on("click", async (event) => {
  const response = await sceneView.hitTest(event);
  if (response.results.length === 0) console.log("terrain at", response.ground.mapPoint);
});
```
