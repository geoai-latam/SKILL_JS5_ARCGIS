# Agent Guide: arcgis-coding-components

Quick-reference for in-app editors. Read before adding a code/expression editor.

## Quick Decision Tree

1. **Arcade?** → `arcgis-arcade-editor`.
2. **SQL where?** → `arcgis-sql-expression-editor`.
3. **Generic code?** → `arcgis-code-editor`.

## Setup Checklist

- [ ] Give the Arcade editor the same profile as the runtime.
- [ ] Provide layer fields for the SQL editor.
- [ ] Validate before applying the script.
- [ ] Size the editor container.

## Anti-patterns (one-liner reminders)

- ❌ Arcade editor with no profile.
- ❌ Author/run profile mismatch.
- ❌ Applying unvalidated scripts.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — editor components
- `references/examples.md` — Arcade / SQL editors
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-coding.ts`
