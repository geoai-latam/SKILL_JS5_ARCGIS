# ArcGIS JS 5 Skills

[Español](./README.es.md) · English

A bilingual (ES/EN) library of **Agent Skills** for the
[ArcGIS Maps SDK for JavaScript 5.0+](https://developers.arcgis.com/javascript/). Each skill
gives an AI coding agent (Claude Code, Cursor, GitHub Copilot, Codex, OpenCode) accurate,
up-to-date guidance for building web mapping applications with the SDK.

## Why

The SDK 5.0 release (February 2026) changed a lot: a unified CDN, ESM-only imports via
`$arcgis.import()`, **all widgets deprecated** in favor of Map Components, the removal of the
`__esri` type namespace, and new layers like `GaussianSplatLayer`. These skills encode those
patterns so agents stop suggesting 4.x idioms.

## Status

**v1.0.0 — all 35 skills complete.** Every skill is bilingual (EN/ES) and green across the full
gate: validate-skills, lint-frontmatter, bilingual-sync, markdownlint, smoke (snippets type-checked
against the real SDK 5.0.19), eval structure, and validator unit tests. See
[`docs/planning/v2.md`](./docs/planning/v2.md) for the roadmap and [`skills/README.md`](./skills/README.md)
for the catalog.

## Install

```bash
# All skills, via the Skills CLI
npx skills add <owner>/arcgis-js5-skills

# A specific skill
npx skills add <owner>/arcgis-js5-skills/arcgis-starter-app

# Claude Code marketplace
# /plugin marketplace add <owner>/arcgis-js5-skills
```

## Develop

```bash
pnpm install            # installs tooling + the SDK (shared by smoke tests)
pnpm new-skill arcgis-xyz --category=core
pnpm run validate-all   # validate-skills + lint-frontmatter + bilingual-sync
pnpm run smoke          # type-checks all snippets against the real SDK types
pnpm run test:unit      # validator unit tests
pnpm run lint           # markdownlint
```

## Repository layout

- `skills/` — one folder per skill (`SKILL.md`, `SKILL.es.md`, `AGENTS.md`, `references/`, `scripts/`)
- `scripts/` — validators and the smoke/eval runners
- `.skills-cli/` — the `new-skill` generator and its templates
- `tests/` — `unit/` (validators), `evals/` (triggering prompts), `integration/` (Playwright)
- `docs/planning/v2.md` — the master plan

## License

[MIT](./LICENSE) © GeoAI LATAM
