# ArcGIS JS 5 Skills

Español · [English](./README.md)

Una librería bilingüe (ES/EN) de **Agent Skills** para el
[ArcGIS Maps SDK for JavaScript 5.0+](https://developers.arcgis.com/javascript/). Cada skill
le da a un agente de código (Claude Code, Cursor, GitHub Copilot, Codex, OpenCode) guía
precisa y actualizada para construir aplicaciones web de mapas con el SDK.

## Por qué

El release 5.0 (febrero 2026) cambió mucho: CDN unificada, imports ESM vía
`$arcgis.import()`, **todos los widgets deprecados** en favor de Map Components, la eliminación
del namespace de tipos `__esri`, y nuevas capas como `GaussianSplatLayer`. Estas skills
codifican esos patrones para que los agentes dejen de sugerir modismos de 4.x.

## Estado

**v1.0.0 — las 35 skills completas.** Cada skill es bilingüe (EN/ES) y está en verde en todo el
gate: validate-skills, lint-frontmatter, bilingual-sync, markdownlint, smoke (snippets type-checked
contra el SDK real 5.0.19), estructura de evals, y tests unitarios. Ver
[`docs/planning/v2.md`](./docs/planning/v2.md) para el roadmap y [`skills/README.md`](./skills/README.md)
para el catálogo.

## Instalación

```bash
# Todas las skills, vía Skills CLI
npx skills add <owner>/arcgis-js5-skills

# Una skill específica
npx skills add <owner>/arcgis-js5-skills/arcgis-starter-app

# Marketplace de Claude Code
# /plugin marketplace add <owner>/arcgis-js5-skills
```

## Desarrollo

```bash
pnpm install            # instala tooling + el SDK (compartido por los smoke tests)
pnpm new-skill arcgis-xyz --category=core
pnpm run validate-all   # validate-skills + lint-frontmatter + bilingual-sync
pnpm run smoke          # type-checkea todos los snippets contra los tipos reales del SDK
pnpm run test:unit      # tests unitarios de los validadores
pnpm run lint           # markdownlint
```

## Estructura del repositorio

- `skills/` — una carpeta por skill (`SKILL.md`, `SKILL.es.md`, `AGENTS.md`, `references/`, `scripts/`)
- `scripts/` — validadores y los runners de smoke/eval
- `.skills-cli/` — el generador `new-skill` y sus plantillas
- `tests/` — `unit/` (validadores), `evals/` (prompts de triggering), `integration/` (Playwright)
- `docs/planning/v2.md` — el plan maestro

## Licencia

[MIT](./LICENSE) © GeoAI LATAM
