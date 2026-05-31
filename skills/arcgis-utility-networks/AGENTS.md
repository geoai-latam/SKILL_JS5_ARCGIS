# Agent Guide: arcgis-utility-networks

Quick-reference for utility networks. Read before tracing.

## Quick Decision Tree

1. **Turnkey UI?** → Utility Network Trace Analysis component.
2. **Custom logic?** → `UtilityNetwork` + trace REST module.
3. **Trace type?** → connected / upstream / downstream / isolation.

## Setup Checklist

- [ ] `await un.load()` before tracing.
- [ ] Provide starting points (+ barriers).
- [ ] Specify terminals on multi-terminal devices.
- [ ] Use a valid trace configuration.

## Anti-patterns (one-liner reminders)

- ❌ Tracing before `load()`.
- ❌ No starting points.
- ❌ Ignoring terminals on multi-terminal devices.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — UtilityNetwork / trace
- `references/examples.md` — trace examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-utility-network.ts`
