# Examples: Smart Mapping

## Example 1: Continuous color renderer

**Use case:** color cities by population automatically.

```typescript
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";

await view.when();
const { renderer } = await colorRendererCreator.createContinuousRenderer({
  layer,
  view,
  field: "POP",
  theme: "high-to-low",
});
layer.renderer = renderer;
```

**Notes:**

- `await view.when()` ensures valid statistics.
- `theme` flips/selects the ramp direction.

---

## Example 2: Continuous size renderer

**Use case:** size points by a numeric field.

```typescript
import * as sizeRendererCreator from "@arcgis/core/smartMapping/renderers/size.js";

await view.when();
const { renderer } = await sizeRendererCreator.createContinuousRenderer({ layer, view, field: "POP" });
layer.renderer = renderer;
```

**Notes:**

- Size encodes magnitude well for point data.
- Combine with a color renderer's visual variables for two-variable maps.

---

## Example 3: Category (type) renderer

**Use case:** auto-assign colors to categories.

```typescript
import * as typeRendererCreator from "@arcgis/core/smartMapping/renderers/type.js";

await view.when();
const { renderer } = await typeRendererCreator.createRenderer({ layer, view, field: "TYPE" });
layer.renderer = renderer;
```

**Notes:**

- Use the `type` module for string/category fields.
- It picks a distinct color per unique value.
