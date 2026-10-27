---
name: arcgis-tables-forms
description: >
  Show and edit tabular attribute data with the ArcGIS Maps SDK for JavaScript
  5.1: the arcgis-feature-table component (linked to the map only through
  reference-element, filtered with its own definitionExpression), the
  arcgis-feature-form component (submit() validates but never saves), and
  related records with queryRelatedFeatures (parents without related rows are
  absent from the result). Use this skill whenever the user displays a feature
  table, builds an attribute form, or works with related records.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
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
- **Pattern it teaches:** bind a component to a layer and the map; persist form values yourself; read relationships
  from the layer.
- **What it does NOT cover:** full editing workflows (see `arcgis-editing`) or popups (see `arcgis-popup-templates`).

## Quick Start

```html
<arcgis-map id="map" basemap="osm" center="-117.15,32.72" zoom="11"></arcgis-map>
<arcgis-feature-table reference-element="#map"></arcgis-feature-table>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-feature-table";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0" });
const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
mapEl.map?.add(layer);
document.querySelector("arcgis-feature-table")!.layer = layer; // the table loads the layer itself
```

No `await layer.load()` is needed first: measured on 5.1.27, a table given an unloaded layer loads it and shows all
12 columns and 420 rows. A table with only a URL also works: `<arcgis-feature-table layer-url="...">`.

## Decision Tree

1. **Spreadsheet view of many rows?**
   - Yes → `arcgis-feature-table`. It pages by itself (`pageSize` 50); filter it with its own `definitionExpression`.

2. **Edit one feature's attributes?**
   - Yes → `arcgis-feature-form` with `layer`, `feature`, and optionally a `FormTemplate`; save in `arcgisSubmit`.

3. **Need records from a related table?**
   - Yes → `layer.queryRelatedFeatures(RelationshipQuery)` with an id read from `layer.relationships`.

**Default:** components. The `FeatureTable` and `FeatureForm` widgets are deprecated since 5.0.

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
import "@arcgis/map-components/components/arcgis-feature-form";
```

## Key Concepts

### Concept 1: The table and the map are linked only by reference-element

Without `reference-element`, the table's `view` is `null` (measured): row selection does not highlight on the map
and `filterByViewExtent` has no extent to use. Point it at the map with a selector, such as `reference-element="#map"`.

### Concept 2: The form validates; you save

`submit()` fires `arcgisSubmit` with `{ valid, invalid, values }` (measured): the lists of field names that pass and
fail, and the current values. Nothing reaches the service until you call `layer.applyEdits`.

### Concept 3: Related records come back keyed by parent

`queryRelatedFeatures` resolves to an object keyed by the parent objectId, and only the parents that have related
rows are in it. Measured on the San Diego service requests: of 200 requests asked, 4 came back.

## Common Pitfalls (Top 3)

### Pitfall 1: Expecting the table to follow the map without reference-element

```html
<!-- ❌ Anti-pattern: the table has no view -->
<arcgis-feature-table></arcgis-feature-table>
```

```html
<!-- ✅ Correct -->
<arcgis-feature-table reference-element="#map"></arcgis-feature-table>
```

**Impact:** measured: `table.view` is `null`. Clicking a row highlights nothing, and there is no error.

### Pitfall 2: Reading every parent from the related-records result

```typescript
// ❌ Anti-pattern: a guessed id, and parents assumed present
const res = await layer.queryRelatedFeatures(new RelationshipQuery({ objectIds: ids, relationshipId: 1 }));
const firstCount = res[ids[0]].features.length; // TypeError when that parent has no related rows
```

```typescript
// ✅ Correct
await layer.load();
const rel = layer.relationships?.[0];
if (rel) {
  const res = await layer.queryRelatedFeatures(
    new RelationshipQuery({ objectIds: ids, relationshipId: rel.id, outFields: ["*"] }),
  );
  const related = ids.map((id) => res[id]?.features ?? []);
}
```

**Impact:** measured: a wrong `relationshipId` rejects with the opaque "Unable to complete operation.", and with the
right one only 4 of 200 parents were keys of the result.

### Pitfall 3: Turning on editing for a layer that cannot be edited

```typescript
// ❌ Anti-pattern
table.editingEnabled = true; // on a read-only service
```

```typescript
// ✅ Correct
await layer.load();
table.editingEnabled = layer.editingEnabled && !!layer.capabilities?.operations?.supportsUpdate;
```

**Impact:** measured on a MapServer layer (`supportsUpdate: false`): the table accepted `editingEnabled = true` and
marked 6 of 6 columns editable, with no warning. The user types and the save fails later.

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

- [Feature Table component](https://developers.arcgis.com/javascript/latest/references/map-components/arcgis-feature-table/)
- [Feature Form component](https://developers.arcgis.com/javascript/latest/references/map-components/arcgis-feature-form/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Runtime checks in `tests/runtime/casos/arcgis-tables-forms.ts`. Removed the
  "load the layer before binding" pitfall: measured, the table loads it itself (12 columns, 420 rows). New top
  pitfalls, all measured: no `reference-element` leaves `table.view` null; a wrong `relationshipId` gives an opaque
  error and parents without related rows are absent from the result; `editingEnabled` on a read-only layer is
  accepted silently. Documented `arcgisSubmit` (`valid`, `invalid`, `values`), the table's own
  `definitionExpression`, and `layer-url`. Snippets and examples use a public service; the form example now sets
  `layer` and `feature`, and the extended pitfall that failed to compile (TS1108) was fixed.
- **0.1.0** (2026-05-31): Initial release.
