# Agent Guide: arcgis-embeddable-maps

Quick-reference for embedding WebMaps. Read before embedding.

## Quick Decision Tree

1. **Quick embed of a saved map?** → Embeddable Map (CDN script + `arcgis-embedded-map`).
2. **Custom app?** → Map Components / Core API instead.
3. **No build tooling?** → Embeddable Map (pure HTML).

## Setup Checklist

- [ ] Add `<script type="module" src="https://js.arcgis.com/5.0/">`.
- [ ] Set `item-id` to a saved WebMap.
- [ ] Ensure the item is shared appropriately (public or signed-in).
- [ ] Configure tools/theme via attributes.

## Anti-patterns (one-liner reminders)

- ❌ `pnpm add @arcgis/embeddable-components` (not on npm).
- ❌ Embedding a private item for anonymous viewers.
- ❌ Expecting deep customization (use the full SDK).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — element attributes
- `references/examples.md` — embed / share
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-embed.ts` — CDN/script-tag pattern (no npm import)
