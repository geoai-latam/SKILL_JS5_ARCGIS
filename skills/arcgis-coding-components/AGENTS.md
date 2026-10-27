# Agent Guide: arcgis-coding-components

Quick-reference for in-app expression editors. Read before adding one.

## Quick Decision Tree

1. **Arcade?** → `arcgis-arcade-editor` + `profile` with the id of where it will run.
2. **SQL where?** → no public component in 5.1 (`arcgis-sql-expression-editor` is `@internal`):
   your own UI + `layer.queryFeatureCount({ where })` to check it.
3. **Generic code?** → Monaco or CodeMirror (`arcgis-code-editor` is `@internal`).

## Setup Checklist

- [ ] `profile = { id, definitions: { $feature: layer } }`, same id as the runtime.
- [ ] Keep the last `arcgisDiagnosticsChange`; apply `arcgisScriptChange` only with zero.
- [ ] `testData` if users should run the script.
- [ ] `disableAssistant = true` unless you want the AI assistant (on by default in 5.1).
- [ ] Size the element in CSS.

## Anti-patterns (one-liner reminders)

- ❌ No profile: even `$feature` is "not defined".
- ❌ `arcgisChange`, `isValid`, `sqlEditor.layer`: none exist.
- ❌ Author in `labeling`, run in `popup` (or the reverse).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — components and status, editor API, profiles
- `references/examples.md` — label editor, test data, custom profile
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-coding.ts`
