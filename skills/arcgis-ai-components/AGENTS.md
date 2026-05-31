# Agent Guide: arcgis-ai-components (BETA)

Quick-reference for AI Components. Read before adding an assistant.

## Quick Decision Tree

1. **Chat assistant?** → `arcgis-assistant` + built-in agents.
2. **Capabilities?** → navigation / data-exploration / help / layer-filter.
3. **Domain logic?** → custom agent.

## Setup Checklist

- [ ] Pin `@arcgis/ai-components` (beta; expect changes).
- [ ] Bind the assistant via `reference-element`.
- [ ] Enable only the agents you need.
- [ ] Scope/guard the data the assistant can access.

## Anti-patterns (one-liner reminders)

- ❌ Floating beta versions (`^5`).
- ❌ Assistant with no map binding.
- ❌ Unrestricted access to sensitive data.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — assistant / agents
- `references/examples.md` — setup examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-assistant.ts`
