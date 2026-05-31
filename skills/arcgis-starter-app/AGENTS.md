# Agent Guide: arcgis-starter-app

Quick-reference for scaffolding an ArcGIS Maps SDK 5.0 project. Read before generating setup code.

## Quick Decision Tree

1. **Framework?**
   - Vanilla TS → run `scripts/scaffold.sh`.
   - React 19+ → Map Components as custom elements + `onArcgis*` props/events.
   - Angular → `CUSTOM_ELEMENTS_SCHEMA` + explicit component CSS import.

2. **Package manager?**
   - Default pnpm; `PKG_MANAGER=npm bash scripts/scaffold.sh` to override.

## Setup Checklist

- [ ] Vite `vanilla-ts` template, `strict: true`, `moduleResolution: "bundler"`.
- [ ] `pnpm add @arcgis/core @arcgis/map-components @esri/calcite-components` (Calcite `^5.0`).
- [ ] `esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY`.
- [ ] `.env` in `.gitignore`; ship `.env.example`.
- [ ] Container height set (`html,body,arcgis-map { height:100% }`).

## Anti-patterns (one-liner reminders)

- ❌ `moduleResolution: "node"` — use `"bundler"`.
- ❌ Hardcoded API key — use `import.meta.env`.
- ❌ `@arcgis/map-components-react` on React 19 — use the element directly.
- ❌ Calcite 3.x — use `^5.0`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — config, tsconfig, env vars
- `references/examples.md` — React 19 + Angular integration
- `references/pitfalls.md` — extended troubleshooting
- `scripts/scaffold.sh` — bootstrap a project
- `scripts/snippet-main.ts` — the generated entry point (smoke-tested)
