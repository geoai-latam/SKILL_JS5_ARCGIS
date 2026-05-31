# Agent Guide: {{name}}

Quick-reference for {{display}}. Read before deciding architecture or generating code.

## Quick Decision Tree

1. **Starting a new project?**
   - Yes → Map Components (`<arcgis-map>`).
   - No → stay with the existing pattern.

2. **TODO domain-specific branch?**
   - Yes → TODO.
   - No → TODO.

## Setup Checklist

- [ ] `pnpm add @arcgis/core @arcgis/map-components @esri/calcite-components` (Calcite `^5.0`).
- [ ] Configure API key: `esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY`.
- [ ] TODO domain-specific setup step.

## Anti-patterns (one-liner reminders)

- ❌ Don't omit the `.js` extension in `@arcgis/core/*` imports.
- ❌ Don't import the `__esri` namespace (unsupported as of 5.0).
- ❌ Don't pin Calcite to 3.x — use `^5.0`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides (EN/ES)
- `references/api-detail.md` — API signatures
- `references/examples.md` — copy-paste examples
- `references/pitfalls.md` — extended troubleshooting
