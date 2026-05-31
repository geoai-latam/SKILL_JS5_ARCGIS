# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/) and the project follows semantic versioning.

## [1.0.0] - 2026-05-31

All 35 catalog skills (plus the `hello-world` reference) are complete, bilingual (EN/ES), and
green across the full quality gate: validate-skills, lint-frontmatter, bilingual-sync,
markdownlint, smoke (59 snippets type-checked against the real SDK 5.0.19), eval structure, and
22 validator unit tests.

### Added (Sprint 8 — QA, Docs, Release)

- Sprint 8: `arcgis-coding-components`, `arcgis-embeddable-maps` (CDN-only) — bilingual; 59 snippets total.
- v1.0.0 release: 36/36 skills passing every gate.

### Earlier (during initial development)

- Sprint 0 foundation: repo structure, `package.json` + pnpm workspace, base TypeScript config.
- Validators: `validate-skills.js` (15 rules), `lint-frontmatter.js` (10 rules),
  `bilingual-sync.js` (structural EN/ES comparison).
- Smoke runner `smoke-test.mjs` (type-checks snippets against the real SDK types).
- Triggering eval runner `eval-descriptions.mjs` (structural mode).
- `new-skill` CLI plus bilingual templates.
- CI workflows (validate, smoke, deploy-docs, integration, triggering-eval, release) and Dependabot.
- `hello-world` gold-standard reference skill.
- Vitest unit tests for the validators (22 tests).
- Sprint 1 (Core): `arcgis-starter-app`, `arcgis-core-maps`, `arcgis-core-utilities`,
  `arcgis-performance` — bilingual, with references, smoke-tested snippets, and eval JSON.
- Sprint 2 (Layers & Data): `arcgis-layers`, `arcgis-advanced-layers` (CatalogLayer),
  `arcgis-3d-layers` (GaussianSplatLayer), `arcgis-tables-forms` — bilingual, 21 smoke-tested snippets.
- Sprint 3 (Visualization): `arcgis-visualization`, `arcgis-cim-symbols`, `arcgis-smart-mapping`,
  `arcgis-feature-effects` — bilingual; 29 smoke-tested snippets total across the library.
- Sprint 4 (Interaction + Widgets): `arcgis-interaction`, `arcgis-popup-templates`, `arcgis-editing`,
  `arcgis-widgets-ui`, `arcgis-widgets-advanced` — bilingual; Map-Components-first with deprecated
  widgets flagged; 37 smoke-tested snippets total.
- Sprint 5 (Spatial + Services): `arcgis-geometry-operations` (5.0 operators API),
  `arcgis-spatial-analysis`, `arcgis-rest-services`, `arcgis-portal-content`, `arcgis-authentication`
  — bilingual; 45 smoke-tested snippets total.
- Sprint 6 (Specialized I): `arcgis-coordinates-projection` (projectOperator), `arcgis-map-tools`,
  `arcgis-arcade`, `arcgis-imagery`, `arcgis-time-animation`, `arcgis-scene-environment`
  — bilingual; 52 smoke-tested snippets total.
- Sprint 7 (Specialized II + New in 5.0): `arcgis-utility-networks`, `arcgis-knowledge-graphs`,
  `arcgis-custom-rendering` (RenderNode), `arcgis-ai-components` (beta), `arcgis-charts`
  — bilingual; added charts/ai/coding component packages; 57 smoke-tested snippets total.
