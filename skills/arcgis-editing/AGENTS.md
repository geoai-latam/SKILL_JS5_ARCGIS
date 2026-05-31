# Agent Guide: arcgis-editing

Quick-reference for editing features. Read before CRUD work.

## Quick Decision Tree

1. **Turnkey UI?** → `arcgis-editor` component.
2. **Programmatic CRUD?** → `layer.applyEdits({ addFeatures, updateFeatures, deleteFeatures })`.
3. **Attachments?** → `addAttachment` / `queryAttachments` (if supported).

## Setup Checklist

- [ ] `await layer.load()` and check `capabilities.operations` before editing.
- [ ] Updates/deletes must include `OBJECTID`.
- [ ] Inspect `result.*FeatureResults[].error` for partial failures.
- [ ] Use `arcgis-editor` (not the deprecated `Editor` widget) for new apps.

## Anti-patterns (one-liner reminders)

- ❌ Ignoring per-edit `error` fields.
- ❌ Editing a layer without checking capabilities.
- ❌ Updates without `OBJECTID`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — applyEdits / editor / attachments
- `references/examples.md` — CRUD + attachments
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-apply-edits.ts`, `snippet-editor-component.ts`
