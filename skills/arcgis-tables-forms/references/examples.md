# Examples: Tables & Forms

## Example 1: Feature table bound to a map

**Use case:** a spreadsheet view synced with map selection.

```typescript
import "@arcgis/map-components/dist/components/arcgis-feature-table";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({ url: "https://.../Inspections/FeatureServer/0" });
await layer.load();
// <arcgis-feature-table reference-element="arcgis-map"></arcgis-feature-table>
(document.querySelector("arcgis-feature-table") as { layer?: FeatureLayer }).layer = layer;
```

**Notes:**

- `reference-element` ties table selection to the map.
- `await layer.load()` ensures all columns appear.

---

## Example 2: Attribute form with a FormTemplate

**Use case:** edit one feature with grouped fields.

```typescript
import "@arcgis/map-components/dist/components/arcgis-feature-form";
import FormTemplate from "@arcgis/core/form/FormTemplate.js";
import FieldElement from "@arcgis/core/form/elements/FieldElement.js";

const formTemplate = new FormTemplate({
  elements: [
    new FieldElement({ fieldName: "status", label: "Status" }),
    new FieldElement({ fieldName: "notes", label: "Notes" }),
  ],
});
const formEl = document.querySelector("arcgis-feature-form") as { formTemplate?: FormTemplate };
formEl.formTemplate = formTemplate;
```

**Notes:**

- Field elements control order and labels.
- Without a template, the form shows the layer's editable fields.

---

## Example 3: Query related records

**Use case:** list inspections related to an asset.

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import RelationshipQuery from "@arcgis/core/rest/support/RelationshipQuery.js";

const layer = new FeatureLayer({ url: "https://.../Assets/FeatureServer/0" });
await layer.load();
const query = new RelationshipQuery({
  objectIds: [123],
  relationshipId: layer.relationships[0].id,
  outFields: ["*"],
});
const result = await layer.queryRelatedFeatures(query);
const related = result[123]?.features ?? [];
```

**Notes:**

- Results are keyed by parent objectId.
- Read `layer.relationships` for the real `relationshipId`.
