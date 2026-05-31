# API Reference: Tables & Forms

## Table of Contents

- [arcgis-feature-table](#arcgis-feature-table)
- [arcgis-feature-form](#arcgis-feature-form)
- [RelationshipQuery](#relationshipquery)

---

## arcgis-feature-table

`@arcgis/map-components/dist/components/arcgis-feature-table`

| Property | Type | Description |
|---|---|---|
| `layer` | `FeatureLayer` | The layer whose rows are shown |
| `reference-element` | `string` | Selector/ref of the associated map element |
| `editingEnabled` | `boolean` | Allow inline edits |

| Event | Detail | Description |
|---|---|---|
| `arcgisSelectionChange` | `{ ... }` | Selection changed in the table |

---

## arcgis-feature-form

`@arcgis/map-components/dist/components/arcgis-feature-form`

| Property | Type | Description |
|---|---|---|
| `layer` | `FeatureLayer` | Source layer |
| `feature` | `Graphic` | The feature being edited |
| `formTemplate` | `FormTemplate` | Field layout, groups, expressions |

| Event | Detail | Description |
|---|---|---|
| `arcgisSubmit` | `{ ... }` | User submitted the form |

---

## RelationshipQuery

`@arcgis/core/rest/support/RelationshipQuery.js`

| Property | Type | Description |
|---|---|---|
| `objectIds` | `number[]` | Parent feature object ids |
| `relationshipId` | `number` | Which relationship (see `layer.relationships`) |
| `outFields` | `string[]` | Fields to return from related records |

`layer.queryRelatedFeatures(query)` resolves to a map of `objectId -> FeatureSet`.
