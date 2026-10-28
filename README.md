# ArcGIS JS 5 Skills

[Español](./README.es.md) · English

A bilingual (ES/EN) library of **Agent Skills** for the
[ArcGIS Maps SDK for JavaScript 5.1](https://developers.arcgis.com/javascript/). Each skill
gives an AI coding agent (Claude Code, Cursor, GitHub Copilot, Codex, OpenCode) accurate,
up-to-date guidance for building web mapping applications with the SDK.

## Why

The SDK 5.0 release (February 2026) changed a lot: a unified CDN, ESM-only imports via
`$arcgis.import()`, **all widgets deprecated** in favor of Map Components, the removal of the
`__esri` type namespace, and new layers like `GaussianSplatLayer`. These skills encode those
patterns so agents stop suggesting 4.x idioms.

## How the bilingual model works

Agent Skills activate on **`SKILL.md`** — that is the file the runtime (Claude Code, etc.) reads,
and its `description` is the trigger. `SKILL.md` is in English, so the agent **selects and reasons
from the English skill** and can answer the user in Spanish (or any language) as usual.

`SKILL.es.md` is a **synchronized Spanish companion** for human readers and reviewers — it is not a
second auto-activating skill. The `bilingual-sync` check keeps both files structurally aligned
(same heading shape, same code blocks). In short: **the docs are bilingual; activation is driven by
the English `SKILL.md`.**

## Status

**v1.2.0 — 36 skills, all validated against SDK 5.1.27.** The 35 of v1.1.0 plus `arcgis-parquet`
(`ParquetLayer`, beta), added with the same method. Each skill was checked one by one:

- **It compiles.** Every code block in the skills (1110) is type-checked against the real 5.1.27
  types, and every `@arcgis/*` import is checked against the package `exports` (a path tsc accepts
  can still fail in Vite and Node).
- **It runs.** Each skill has a runtime case in `tests/runtime/casos/` that executes what the skill
  claims in Chromium, against public Esri services (and, for Parquet, small generated
  files), and reads the result (pixels, for the visualization skills).
- **It is not filler.** Pitfalls that turned out false were removed; the silent failures that
  were found (no error, wrong result) were added with their measurement.

What could not be measured is listed too: anything that needs a signed-in user (assistant LLM
answers, utility network traces, knowledge graph queries, print export). The full report, in
Spanish, is [`docs/validacion/INFORME.md`](./docs/validacion/INFORME.md), and the per-skill record
is [`docs/validacion/README.md`](./docs/validacion/README.md). The catalog is
[`skills/README.md`](./skills/README.md).

## Install

```bash
# All skills, via the Skills CLI
npx skills add sforero77/SKILL_JS5_ARCGIS

# A specific skill
npx skills add sforero77/SKILL_JS5_ARCGIS --skill arcgis-starter-app

# Claude Code marketplace (requires a .claude-plugin/marketplace.json — see below)
# /plugin marketplace add sforero77/SKILL_JS5_ARCGIS
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
