# Agent Guide: arcgis-tables-forms

Quick-reference for tabular/attribute UIs. Read before building tables or forms.

## Quick Decision Tree

1. **Many rows, spreadsheet view?** → `arcgis-feature-table`.
2. **Edit one feature's attributes?** → `arcgis-feature-form` + `FormTemplate`.
3. **Related table records?** → `RelationshipQuery` + `queryRelatedFeatures`.

## Setup Checklist

- [ ] `await layer.load()` before binding to the component.
- [ ] Set the component `layer` property and `reference-element` to the map.
- [ ] Build a `FormTemplate` for custom form layout.
- [ ] Read `layer.relationships` for the correct `relationshipId`.

## Anti-patterns (one-liner reminders)

- ❌ Binding a layer before it loads (missing columns).
- ❌ Using the deprecated `FeatureTable`/`FeatureForm` widgets in new apps.
- ❌ Guessing `relationshipId` instead of reading `layer.relationships`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — component + RelationshipQuery signatures
- `references/examples.md` — table / form / related-records
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-feature-table.ts`, `snippet-related.ts`
