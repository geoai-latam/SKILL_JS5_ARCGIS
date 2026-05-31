# Agent Guide: arcgis-arcade

Quick-reference for Arcade. Read before writing expressions.

## Quick Decision Tree

1. **Popup?** → `expressionInfos` (popup profile).
2. **Label?** → label expression (label profile).
3. **Renderer/visual variable?** → `valueExpression` (renderer profile).
4. **Manual compile?** → `createArcadeExecutor(script, profile)`.

## Setup Checklist

- [ ] Declare the right variables in the profile (`$feature`, etc.).
- [ ] Compile once, reuse the executor.
- [ ] Keep label/renderer expressions lightweight.
- [ ] Prefer declaring expressions on the consuming object.

## Anti-patterns (one-liner reminders)

- ❌ Missing `$feature` in the profile.
- ❌ Recompiling per feature.
- ❌ Heavy FeatureSet ops in per-feature expressions.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — executor / profile
- `references/examples.md` — popup / label / renderer
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-arcade.ts`
