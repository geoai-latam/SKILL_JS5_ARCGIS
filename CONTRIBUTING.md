# Contributing

[Español](./CONTRIBUTING.es.md) · English

Thanks for helping build the ArcGIS JS 5 skills library. This guide covers how to add or fix a skill.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm 10+ (`npm i -g pnpm` or via corepack)

```bash
pnpm install
```

## Add a new skill

1. Scaffold it: `pnpm new-skill arcgis-xyz --category=<category>`.
2. Replace every `TODO` in `skills/arcgis-xyz/` (both `SKILL.md` and `SKILL.es.md`).
3. Keep `SKILL.md` under 300 lines; move depth into `references/`.
4. Mirror the heading structure in `SKILL.es.md` (translate text, keep the shape).
5. If the skill ships code, add `scripts/snippet-*.ts` so the smoke test can type-check it.
6. Fill `tests/evals/arcgis-xyz.eval.json` with ≥5 `should_trigger` and ≥3 `should_not_trigger`.

## Validate locally before opening a PR

```bash
pnpm run validate-skills -- --skill=arcgis-xyz
pnpm run lint-frontmatter -- --skill=arcgis-xyz
pnpm run bilingual-sync -- --skill=arcgis-xyz
pnpm run smoke -- --skill=arcgis-xyz
pnpm run lint
```

## House rules

- TypeScript strict, ESM only. No AMD / `require()`, no `__esri` namespace.
- Use the `.js` extension in `@arcgis/core/*` imports.
- Map Components first; document deprecated widgets only as a historical fallback.
- Calcite is `^5.0` (not 3.x).
- Never hardcode API keys — use `import.meta.env.VITE_ARCGIS_API_KEY`.
- Don't paste official docs verbatim; reformulate.

## Pull requests

- One skill (or one focused fix) per PR.
- CI must be green (validate + smoke + lint + unit tests).
- Update `CHANGELOG.md`.
