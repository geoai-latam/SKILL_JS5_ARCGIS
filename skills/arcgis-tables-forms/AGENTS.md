# Agent Guide: arcgis-tables-forms

Quick-reference for tabular/attribute UIs on SDK 5.1. Read before building tables or forms.

## Quick Decision Tree

1. **Many rows, spreadsheet view?** → `arcgis-feature-table` with `reference-element` pointing at the map.
2. **Edit one feature's attributes?** → `arcgis-feature-form` with `layer` + `feature`; save in `arcgisSubmit`.
3. **Related table records?** → `RelationshipQuery` + `queryRelatedFeatures`, id from `layer.relationships`.

## Setup Checklist

- [ ] Set `reference-element` on the table, or its `view` stays null and selection never reaches the map.
- [ ] Filter the table with its own `definitionExpression`, not the layer's (that one filters the map too).
- [ ] Gate `editingEnabled` on `layer.editingEnabled` and `capabilities.operations.supportsUpdate`.
- [ ] Persist form values with `layer.applyEdits` inside `arcgisSubmit`; `submit()` alone saves nothing.
- [ ] Read related results as `res[id]?.features ?? []`: parents without related rows are not keys.

## Anti-patterns (one-liner reminders)

- ❌ A table without `reference-element` expected to highlight on the map.
- ❌ A guessed `relationshipId` (error: "Unable to complete operation.").
- ❌ `editingEnabled = true` on a read-only service (accepted silently).
- ❌ The deprecated `FeatureTable`/`FeatureForm` widgets in new apps.
- ❌ `await layer.load()` "so columns appear": the table loads the layer itself.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — component + RelationshipQuery signatures
- `references/examples.md` — table / form / related-records
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-feature-table.ts`, `snippet-related.ts`
