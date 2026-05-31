# Examples: Arcade

## Example 1: Compile and run manually

**Use case:** compute a derived value from a feature.

```typescript
import { createArcadeExecutor } from "@arcgis/core/arcade.js";

const executor = await createArcadeExecutor("Round($feature.POP / 1000) + ' k'", {
  variables: [{ name: "$feature", type: "feature" }],
});
```

**Notes:**

- Declare `$feature` in the profile.
- Compile once; reuse the executor per feature.

---

## Example 2: Arcade in a popup

**Use case:** show a computed field in the popup.

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

layer.popupTemplate = new PopupTemplate({
  title: "{NAME}",
  expressionInfos: [{ name: "perK", title: "Per 1k", expression: "Round($feature.POP/1000)" }],
  content: "Population (k): {expression/perK}",
});
```

**Notes:**

- Reference the expression as `{expression/<name>}`.
- The SDK compiles and runs it for you.

---

## Example 3: Arcade renderer value expression

**Use case:** drive symbology from a computed value.

```typescript
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";

const renderer = new ClassBreaksRenderer({
  valueExpression: "$feature.POP / $feature.AREA",
  classBreakInfos: [/* ... */],
});
```

**Notes:**

- `valueExpression` replaces a static `field`.
- Keep it light — it runs per feature.
