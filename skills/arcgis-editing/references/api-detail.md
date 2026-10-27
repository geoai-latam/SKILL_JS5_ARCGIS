# API Reference: Editing

## Table of Contents

- [FeatureLayer.applyEdits](#featurelayerapplyedits)
- [arcgis-editor](#arcgis-editor)
- [Attachments](#attachments)

---

## FeatureLayer.applyEdits

`applyEdits(edits, options?) => Promise<EditsResult>`

| Edit bucket | Type | Description |
|---|---|---|
| `addFeatures` | `Graphic[]` | New features (no OBJECTID) |
| `updateFeatures` | `Graphic[]` | Existing features (need OBJECTID) |
| `deleteFeatures` | `Graphic[] \| { objectId }[]` | Features to delete |

Result: `addFeatureResults`, `updateFeatureResults`, `deleteFeatureResults` (and the attachment
equivalents): each item has `objectId` and `error`. A bad edit is reported there, not by rejecting.

Options (`EditOptions`): `rollbackOnFailureEnabled` (all-or-nothing on a service) and `gdbVersion`.

The layer emits `edits` after each successful call; the layer view updates on its own.

Check `layer.editingEnabled` and `layer.capabilities.operations.supportsAdd/Update/Delete` first.

---

## arcgis-editor

`@arcgis/map-components/components/arcgis-editor` (replaces the deprecated `Editor` widget)

| Property | Type | Description |
|---|---|---|
| `reference-element` | `string` | The map element it edits |
| `layerInfos` | `array` | Per-layer editing config; unset = every editable layer |
| `snapping-options` | `SnappingOptions` | Snapping (5.1 adds grid controls) |
| `startUpdateFeaturesWorkflow(features)` | method | Open the update workflow programmatically |

---

## Attachments

| Method | Description |
|---|---|
| `addAttachment(feature, formData)` | Upload a file/photo |
| `updateAttachment(feature, id, formData)` | Replace an attachment |
| `deleteAttachments(feature, ids)` | Remove attachments |
| `queryAttachments({ objectIds })` | `{ [objectId]: AttachmentInfo[] }` |

Requires `layer.capabilities.data.supportsAttachment === true`.
