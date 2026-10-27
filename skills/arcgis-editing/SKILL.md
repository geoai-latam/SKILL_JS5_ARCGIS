---
name: arcgis-editing
description: >
  Edit feature data with the ArcGIS Maps SDK for JavaScript 5.1: the arcgis-editor
  component for a full editing UI, FeatureLayer.applyEdits for programmatic
  add/update/delete, and attachment handling. Use this skill whenever the user
  creates, updates, or deletes features, builds an editing experience, or manages
  feature attachments.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: interaction
tags:
  - editing
  - applyedits
  - editor
  - attachments
  - crud
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Editing

> **When to use:** Activate this skill whenever the user creates/updates/deletes features, builds
> an editing UI, or manages attachments.

## Overview

Editing persists feature changes to a service. Use the editor component for UI, or applyEdits in code.

- **Problem it solves:** create/update/delete (CRUD) on editable feature services.
- **Who it serves:** developers building data-collection and maintenance apps.
- **Pattern it teaches:** `arcgis-editor` for turnkey UI; `applyEdits` for programmatic control.
- **What it does NOT cover:** drawing geometry (see `arcgis-interaction`) or forms (see `arcgis-tables-forms`).

## Quick Start

```typescript
const result = await layer.applyEdits({ addFeatures: [graphic] });
console.log(result.addFeatureResults[0].objectId);
```

## Decision Tree

1. **Want a ready-made editing UI?**
   - Yes → `arcgis-editor` component.

2. **Need programmatic control / custom UI?**
   - Yes → `layer.applyEdits({ addFeatures, updateFeatures, deleteFeatures })`.

3. **Editing files/photos on features?**
   - Yes → `layer.addAttachment` / `queryAttachments`.

**Default:** `arcgis-editor` for standard workflows; `applyEdits` for custom logic.

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
import "@arcgis/map-components/components/arcgis-editor";
```

## Key Concepts

### Concept 1: applyEdits

`layer.applyEdits({ addFeatures, updateFeatures, deleteFeatures })` resolves to result arrays; each
item has `objectId` and `error`. Measured with 5.1.27 on a client-side layer:

- A bad edit **does not reject the promise**: it comes back as `error` in its result ("Identifier
  fields: OBJECTID missing", "Feature with object id 9999 missing").
- It is **not transactional**: in a batch with one valid and one invalid update, the valid one is
  applied. For a service, `applyEdits(edits, { rollbackOnFailureEnabled: true })` asks for
  all-or-nothing (not measured here).
- **Silent successes:** deleting an `objectId` that does not exist returns `ok`; an attribute whose
  name is not a field (`ESTADO`) is dropped and the update still returns `ok`. Field names are
  matched case-insensitively (`status` updated `STATUS`).
- The whole call **rejects** only for layer-level problems: `editingEnabled: false` ("Editing is
  disabled for layer") or z-values on a layer without z.
- Geometry in another spatial reference is projected for you (a 3857 point was stored in 4326 at
  `-74.0806, 4.6000`), and the layer view updates without `refresh()` (2 → 3 features; one `edits`
  event).

### Concept 2: The editor component

`arcgis-editor` replaces the `Editor` widget (deprecated since 5.0). Bind it with
`reference-element`; with `layerInfos` unset it edits every editable layer of the map (measured:
`state === "ready"`). It also has `startUpdateFeaturesWorkflow`, merge and split workflows, and in 5.1
the snapping grid controls (`hide-snapping-controls-elements-grid-*`).

### Concept 3: Attachments

When `layer.capabilities.data.supportsAttachment` is true, use `addAttachment(feature, form)` (a
`FormData` or `<form>`) and `queryAttachments({ objectIds })`, which resolves to
`{ [objectId]: AttachmentInfo[] }`.

## Common Pitfalls (Top 3)

### Pitfall 1: Ignoring per-edit errors

```typescript
// ❌ Anti-pattern
await layer.applyEdits({ updateFeatures }); // assume success
```

```typescript
// ✅ Correct
const r = await layer.applyEdits({ updateFeatures });
r.updateFeatureResults.forEach((res) => { if (res.error) console.error(res.error); });
```

**Impact:** measured: an update with a missing id resolves normally; only its result carries the
error. A `try/catch` around `applyEdits` does not see it.

### Pitfall 2: Editing a non-editable layer

```typescript
// ❌ Anti-pattern
await layer.applyEdits({ addFeatures }); // service has no create capability
```

```typescript
// ✅ Correct
await layer.load();
if (layer.editingEnabled && layer.capabilities?.operations?.supportsAdd) await layer.applyEdits({ addFeatures });
```

**Impact:** measured on a MapServer layer: `supportsAdd`, `supportsUpdate`, `supportsEditing` and
`editingEnabled` are all `false`. With `editingEnabled: false` the call rejects with "Editing is
disabled for layer".

### Pitfall 3: Updating without the objectId

```typescript
// ❌ Anti-pattern
const g = new Graphic({ attributes: { STATUS: "done" } }); // no OBJECTID
await layer.applyEdits({ updateFeatures: [g] });
```

```typescript
// ✅ Correct
const g = new Graphic({ attributes: { [layer.objectIdField]: 42, STATUS: "done" } });
await layer.applyEdits({ updateFeatures: [g] });
```

**Impact:** measured: no exception; the result says "Identifier fields: OBJECTID missing" and no
row changes. Use `layer.objectIdField`: it is not always `OBJECTID` (`FID`, `objectid`).

## When to Read references/

| If you need... | Read |
|---|---|
| applyEdits / editor / attachments | `references/api-detail.md` |
| CRUD + attachment examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-tables-forms` — attribute forms for editing
- `arcgis-interaction` — draw geometries to edit
- `arcgis-layers` — the editable FeatureLayer

## Reference Samples

- [applyEdits](https://developers.arcgis.com/javascript/latest/sample-code/editing-applyedits/)
- [Editor component](https://developers.arcgis.com/javascript/latest/sample-code/editor-basic/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. The code ran; two extended pitfalls were false: geometry in another spatial
  reference is projected for you (not misplaced or rejected) and the layer view updates without `refresh()`.
  Replaced by what does fail silently: deleting a missing id returns `ok`, unknown fields are dropped with `ok`.
  Measured that bad edits never reject the promise, that batches are not transactional, and which errors do
  reject. `objectIdField` instead of a hard-coded `OBJECTID`. Run in `tests/runtime/casos/arcgis-editing.ts`.
- **0.1.0** (2026-05-31): Initial release.
