# Agent Guide: hello-world

Quick-reference for the reference/template skill. Read before authoring or reviewing a skill.

## Quick Decision Tree

1. **Authoring a new skill?**
   - Yes → `pnpm new-skill <name>`, then replace placeholders.
   - No → use a real `arcgis-*` skill.

2. **Need the frontmatter rules?**
   - Yes → `references/api-detail.md`.

3. **CI failing on EN/ES drift?**
   - Yes → `node scripts/bilingual-sync.js --skill=<name>`.

## Setup Checklist

- [ ] `pnpm install` at the repo root (installs SDK + tooling once).
- [ ] `pnpm new-skill <name>` to scaffold.
- [ ] Fill frontmatter; keep Calcite at `^5.0` (not 3.x) where relevant.
- [ ] Mirror every heading in `SKILL.es.md`.
- [ ] Add `scripts/snippet-*.ts` if the skill ships code.

## Anti-patterns (one-liner reminders)

- ❌ Don't hand-copy a skill folder — frontmatter will desync. Use the CLI.
- ❌ Don't omit the `.js` extension in `@arcgis/core/*` imports.
- ❌ Don't pin Calcite to 3.x — that's the 4.x era; use `^5.0`.
- ❌ Don't import the `__esri` namespace (unsupported as of 5.0).

## Files in This Skill

- `SKILL.md` — full English guide
- `SKILL.es.md` — guía completa en español
- `references/api-detail.md` — frontmatter field reference
- `references/examples.md` — authoring examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-hello.ts` — type-checked smoke snippet
