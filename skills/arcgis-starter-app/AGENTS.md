# Agent Guide: arcgis-starter-app

Quick-reference for scaffolding an ArcGIS Maps SDK 5.1 project. Read before generating setup code.

## Quick Decision Tree

1. **Framework?**
   - Vanilla TS → run `scripts/scaffold.sh`.
   - React 19+ → Map Components as custom elements + `onarcgis*` event props.
   - Angular → `CUSTOM_ELEMENTS_SCHEMA` + explicit component CSS import.

2. **Package manager?**
   - Default pnpm; `PKG_MANAGER=npm bash scripts/scaffold.sh` to override.

## Setup Checklist

- [ ] Vite `vanilla-ts` template, `moduleResolution: "bundler"`, plus `"strict": true` (the template omits it).
- [ ] `@arcgis/core`, `@arcgis/map-components` and `@esri/calcite-components` all `^5.1`.
- [ ] `esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY`.
- [ ] `.env` in `.gitignore` (the template does not do it); ship `.env.example`.
- [ ] View from `await el.viewOnReady(); el.view`, never `event.detail.view`.
- [ ] Container height set (`html,body,arcgis-map { height:100% }`).

## Anti-patterns (one-liner reminders)

- ❌ `(e as CustomEvent).detail.view` — `detail` is `null`, it throws.
- ❌ `cp .env.example .env` without ignoring `.env`.
- ❌ `arcgis/*` basemaps with no key — sign-in dialog, view never ready.
- ❌ `moduleResolution: "node"` — removed in TS 7.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — config, tsconfig, env vars
- `references/examples.md` — React 19 + Angular integration
- `references/pitfalls.md` — extended troubleshooting
- `scripts/scaffold.sh` — bootstrap a project
- `scripts/snippet-main.ts` — the generated entry point (smoke-tested)
