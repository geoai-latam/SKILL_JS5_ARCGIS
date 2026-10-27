# Examples: Tables & Forms

## Example 1: Feature table bound to a map

**Use case:** a spreadsheet view synced with map selection.

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-feature-table";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

// <arcgis-map id="map" basemap="osm" center="-117.15,32.72" zoom="11"></arcgis-map>
// <arcgis-feature-table reference-element="#map"></arcgis-feature-table>
const layer = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0" });
const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
mapEl.map?.add(layer);
const tableEl = document.querySelector("arcgis-feature-table")!;
tableEl.layer = layer;
tableEl.definitionExpression = "status = 'Unassigned'"; // 211 of 420; filters the table, not the map
```

**Notes:**

- `reference-element` ties table selection to the map; without it `tableEl.view` is `null`.
- The table loads the layer itself; no `await layer.load()` is needed.

---

## Example 2: Attribute form that saves

**Use case:** edit one feature with chosen fields and persist the result.

```typescript
import "@arcgis/map-components/components/arcgis-feature-form";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import FormTemplate from "@arcgis/core/form/FormTemplate.js";
import FieldElement from "@arcgis/core/form/elements/FieldElement.js";

const layer = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0" });
const { features } = await layer.queryFeatures({ where: "1=1", num: 1, outFields: ["*"], returnGeometry: true });

const formEl = document.querySelector("arcgis-feature-form")!;
formEl.layer = layer;
formEl.feature = features[0];
formEl.formTemplate = new FormTemplate({
  elements: [
    new FieldElement({ fieldName: "status", label: "Status" }),
    new FieldElement({ fieldName: "comments", label: "Comments" }),
  ],
});

formEl.addEventListener("arcgisSubmit", async (e) => {
  const { invalid, values } = e.detail;
  if (invalid.length) return; // field names that failed validation
  const updated = features[0].clone();
  Object.assign(updated.attributes, values);
  await layer.applyEdits({ updateFeatures: [updated] });
});
// a "Save" button calls formEl.submit()
```

**Notes:**

- Without `layer` and `feature` the form has nothing to show.
- `submit()` only validates and fires `arcgisSubmit`; `applyEdits` is what writes.

---

## Example 3: Query related records

**Use case:** list the comments related to each service request.

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import RelationshipQuery from "@arcgis/core/rest/support/RelationshipQuery.js";

const layer = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0" });
await layer.load();
const rel = layer.relationships?.[0]; // here: id 0, the comments table
if (rel) {
  const ids = await layer.queryObjectIds({ where: "1=1", num: 200 });
  const result = await layer.queryRelatedFeatures(
    new RelationshipQuery({ objectIds: ids, relationshipId: rel.id, outFields: ["*"] }),
  );
  const byParent = ids.map((id) => result[id]?.features ?? []);
}
```

**Notes:**

- Results are keyed by parent objectId, and only parents with related rows are keys (4 of these 200, measured).
- Read `layer.relationships` for the real `relationshipId`; a wrong one gives "Unable to complete operation.".
