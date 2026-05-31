---
name: arcgis-tables-forms
description: >
  Show and edit tabular attribute data with the ArcGIS Maps SDK for JavaScript
  5.0: the arcgis-feature-table component for spreadsheet-like views, the
  arcgis-feature-form component for attribute editing, and querying related
  records. Use this skill whenever the user displays a feature table, builds an
  attribute form, or works with related records.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: layers
tags:
  - featuretable
  - featureform
  - related-records
  - attributes
  - editing
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Tables & Forms

> **When to use:** Activate this skill whenever the user shows a feature table, builds an attribute
> form, or queries related records.

## Overview

These components present a layer's attributes as a table or an editable form, with related-record support.

- **Problem it solves:** attribute-centric UIs over spatial data.
- **Who it serves:** developers building inspection, asset, and data-entry apps.
- **Pattern it teaches:** bind a component to a layer; drive forms from FormTemplate; traverse relationships.
- **What it does NOT cover:** full editing workflows (see `arcgis-editing`) or popups (see `arcgis-popup-templates`).

## Quick Start

```typescript
import "@arcgis/map-components/dist/components/arcgis-feature-table";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });
// <arcgis-feature-table reference-element="arcgis-map"></arcgis-feature-table>
(document.querySelector("arcgis-feature-table") as any).layer = layer;
```

## Decision Tree

1. **Spreadsheet view of many rows?**
   - Yes → `arcgis-feature-table`.

2. **Edit one feature's attributes?**
   - Yes → `arcgis-feature-form` driven by a `FormTemplate`.

3. **Need records from a related table?**
   - Yes → `layer.queryRelatedFeatures(RelationshipQuery)`.

**Default:** components first; the deprecated `FeatureTable`/`FeatureForm` widgets only as a fallback.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
```

### Dynamic Imports (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/dist/components/arcgis-feature-form";
```

## Key Concepts

### Concept 1: Binding a table to a layer

Set the component's `layer` property to a `FeatureLayer`. Use `reference-element` to associate the
table with a map so selection and the map stay in sync.

### Concept 2: FormTemplate

`arcgis-feature-form` renders fields from a `FormTemplate` (field elements, groups, expressions).
Without a template it falls back to the layer's fields.

### Concept 3: Related records

Relationships are queried via `RelationshipQuery` and `layer.queryRelatedFeatures`. Results are
keyed by the parent feature's objectId.

## Common Pitfalls (Top 3)

### Pitfall 1: Setting the layer before it is added/loaded

```typescript
// ❌ Anti-pattern
table.layer = new FeatureLayer({ url }); // table renders before fields load
```

```typescript
// ✅ Correct
const layer = new FeatureLayer({ url });
await layer.load();
table.layer = layer;
```

**Impact:** the table renders with missing columns until fields load.

### Pitfall 2: Using the deprecated widget on a new app

```typescript
// ❌ Anti-pattern
import FeatureTable from "@arcgis/core/widgets/FeatureTable.js"; // deprecated in 5.0
```

```typescript
// ✅ Correct
import "@arcgis/map-components/dist/components/arcgis-feature-table";
```

**Impact:** building on a widget slated for removal in 6.0.

### Pitfall 3: Wrong relationshipId for related records

```typescript
// ❌ Anti-pattern
new RelationshipQuery({ objectIds: [id], relationshipId: 0 }); // guessed id
```

```typescript
// ✅ Correct
await layer.load();
const rel = layer.relationships[0]; // inspect real relationships
new RelationshipQuery({ objectIds: [id], relationshipId: rel.id });
```

**Impact:** the query returns nothing because the relationship id is wrong.

## When to Read references/

| If you need... | Read |
|---|---|
| Component + RelationshipQuery signatures | `references/api-detail.md` |
| Table / form / related examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-layers` — the FeatureLayer behind the table
- `arcgis-editing` — full edit workflows with applyEdits
- `arcgis-popup-templates` — attribute display in popups

## Reference Samples

- [FeatureTable component](https://developers.arcgis.com/javascript/latest/api-reference/)
- [FeatureForm component](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
