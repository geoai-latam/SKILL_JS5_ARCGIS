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

Result: `addFeatureResults`, `updateFeatureResults`, `deleteFeatureResults` — each item has
`objectId` and `error`.

Check `layer.capabilities.operations.supportsAdd/Update/Delete` first.

---

## arcgis-editor

`@arcgis/map-components/dist/components/arcgis-editor` (replaces the deprecated `Editor` widget)

| Property | Type | Description |
|---|---|---|
| `reference-element` | `string` | The map element it edits |
| `layerInfos` | `array` | Per-layer editing config |

---

## Attachments

| Method | Description |
|---|---|
| `addAttachment(feature, formData)` | Upload a file/photo |
| `updateAttachment(feature, id, formData)` | Replace an attachment |
| `deleteAttachments(feature, ids)` | Remove attachments |
| `queryAttachments(query)` | List attachments |

Requires `layer.capabilities.data.supportsAttachment === true`.
