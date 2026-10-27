---
name: arcgis-editing
description: >
  Edit feature data with the ArcGIS Maps SDK for JavaScript 5.0: the arcgis-editor
  component for a full editing UI, FeatureLayer.applyEdits for programmatic
  add/update/delete, and attachment handling. Use this skill whenever the user
  creates, updates, or deletes features, builds an editing experience, or manages
  feature attachments.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
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

`layer.applyEdits({ addFeatures, updateFeatures, deleteFeatures })` resolves to result arrays.
Each result has `objectId` and `error` — always check for partial failures.

### Concept 2: The editor component

`arcgis-editor` (replacing the deprecated `Editor` widget) provides create/update workflows,
snapping, and form integration with `reference-element` bound to the map.

### Concept 3: Attachments

When a layer `capabilities.data.supportsAttachment` is true, use `addAttachment(feature, form)`
and `queryAttachments` to manage photos/files per feature.

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

**Impact:** silent partial failures leave data inconsistent.

### Pitfall 2: Editing a non-editable layer

```typescript
// ❌ Anti-pattern
await layer.applyEdits({ addFeatures }); // service has no create capability
```

```typescript
// ✅ Correct
await layer.load();
if (layer.capabilities?.operations?.supportsAdd) await layer.applyEdits({ addFeatures });
```

**Impact:** edits are rejected by the service.

### Pitfall 3: Updating without the objectId

```typescript
// ❌ Anti-pattern
const g = new Graphic({ attributes: { STATUS: "done" } }); // no OBJECTID
await layer.applyEdits({ updateFeatures: [g] });
```

```typescript
// ✅ Correct
const g = new Graphic({ attributes: { OBJECTID: 42, STATUS: "done" } });
await layer.applyEdits({ updateFeatures: [g] });
```

**Impact:** the service cannot match the row to update.

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

- **0.1.0** (2026-05-31): Initial release.
