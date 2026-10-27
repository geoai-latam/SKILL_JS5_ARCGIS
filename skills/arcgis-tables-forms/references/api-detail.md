# API Reference: Tables & Forms

## Table of Contents

- [arcgis-feature-table](#arcgis-feature-table)
- [arcgis-feature-form](#arcgis-feature-form)
- [RelationshipQuery](#relationshipquery)

---

## arcgis-feature-table

`@arcgis/map-components/components/arcgis-feature-table`

| Property | Type | Description |
|---|---|---|
| `layer` | `FeatureLayer` | The layer whose rows are shown; loaded by the table if needed |
| `layerUrl` / `layer-url` | `string` | Build the layer from a service URL |
| `layerItemId` | `string` | Build the layer from a portal item |
| `referenceElement` / `reference-element` | `string` or element | The map; without it `view` is `null` |
| `definitionExpression` | `string` | Filters the table only; the layer's own filter is untouched |
| `editingEnabled` | `boolean` | Inline edits; not checked against the service's capabilities |
| `relatedRecordsEnabled` | `boolean` | Show related records from the table |
| `filterByViewExtent` | `boolean` | Only rows in the current view (needs `reference-element`) |
| `objectIds` / `highlightIds` | `Collection<number>` | Restrict to / highlight these rows |
| `pageSize` | `number` | Rows fetched per page (default 50) |
| `size` | `number` | Total rows after filters (read-only) |

| Event | Detail | Description |
|---|---|---|
| `arcgisSelectionChange` | collection change (`added`, `removed`) | Selection changed in the table |
| `arcgisCellClick` | cell, row, and the native event | A cell was clicked |
| `arcgisReady` | — | The component finished loading |

---

## arcgis-feature-form

`@arcgis/map-components/components/arcgis-feature-form`

| Property | Type | Description |
|---|---|---|
| `layer` | `FeatureLayer` | Source layer |
| `feature` | `Graphic` | The feature being edited (bring its attributes with `outFields`) |
| `formTemplate` | `FormTemplate` | Field layout, groups, expressions; without it, the layer's fields |
| `state` | `string` | `"ready"` once the form is built |

| Method | Returns | Description |
|---|---|---|
| `getValues()` | `Promise<object>` | Current values by field name |
| `submit()` | `Promise<void>` | Validates and fires `arcgisSubmit`; does not save |

| Event | Detail | Description |
|---|---|---|
| `arcgisSubmit` | `{ valid, invalid, values }` | Field names that pass and fail, and the values |
| `arcgisValueChange` | `{ fieldName, value, valid }` | A field changed |

---

## RelationshipQuery

`@arcgis/core/rest/support/RelationshipQuery.js`

| Property | Type | Description |
|---|---|---|
| `objectIds` | `number[]` | Parent feature object ids |
| `relationshipId` | `number` | Which relationship (see `layer.relationships`, empty on layers without them) |
| `outFields` | `string[]` | Fields to return from related records |

`layer.queryRelatedFeatures(query)` resolves to `{ [objectId]: FeatureSet }` with only the parents that have related
rows. A wrong `relationshipId` rejects with "Unable to complete operation.".
