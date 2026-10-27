# Examples: Coding Components

## Example 1: A label-expression editor that only applies valid scripts

**Use case:** let users edit a layer's label expression.

```typescript
import "@arcgis/coding-components/components/arcgis-arcade-editor";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import LabelClass from "@arcgis/core/layers/support/LabelClass.js";

const layer = new FeatureLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2",
});
await layer.load();

const editor = document.querySelector("arcgis-arcade-editor")!;
editor.profile = { id: "labeling", definitions: { $feature: layer } };
editor.script = "$feature.state_abbr";
editor.disableAssistant = true;

let errores = 0;
editor.addEventListener("arcgisDiagnosticsChange", (e) => { errores = e.detail.length; });
editor.addEventListener("arcgisScriptChange", (e) => {
  if (errores > 0) return;
  layer.labelingInfo = [new LabelClass({ labelExpressionInfo: { expression: e.detail } })];
});
```

**Notes:**

- Measured with 5.1.27: with a profile, `$feature.NO_EXISTE` gets one diagnostic listing the real
  fields (`objectid | area | state_name | …`).

---

## Example 2: Running the script against a sample feature

**Use case:** show the result before the user applies it.

```typescript
const editor = document.querySelector("arcgis-arcade-editor")!;
const { features } = await layer.queryFeatures({ where: "1=1", outFields: ["*"], num: 1, returnGeometry: true });
editor.testData = { profileVariableInstances: { $feature: features[0] } };
```

**Notes:**

- `outFields: ["*"]` is deliberate here: the user may reference any field.
- Without `testData` the Run button does not show.

---

## Example 3: A custom profile

**Use case:** an expression that receives your own variables, not a predefined profile.

```typescript
const editor = document.querySelector("arcgis-arcade-editor")!;
editor.profile = {
  label: "Score",
  bundles: ["core"],
  variables: [
    { name: "$score", type: "number", description: "Raw score from the model" },
    { name: "$region", type: "text", description: "Region name" },
  ],
};
editor.script = "IIf($score > 0.5, $region + ': high', $region + ': low')";
```
