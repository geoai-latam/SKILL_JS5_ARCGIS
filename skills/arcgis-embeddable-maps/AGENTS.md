# Agent Guide: arcgis-embeddable-maps

Quick-reference for embedding WebMaps. Read before embedding.

## Quick Decision Tree

1. **Quick embed of a saved map?** → Embeddable Map (its own CDN script + `arcgis-embedded-map`).
2. **Custom app?** → Map Components / Core API instead.
3. **No build tooling?** → Embeddable Map (pure HTML).

## Setup Checklist

- [ ] Add `<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/">` (not `js.arcgis.com/5.1/`).
- [ ] Set `item-id` to a saved WebMap.
- [ ] Ensure the item is shared appropriately (public, or an `api-key` scoped to it).
- [ ] Turn tools on with `*-enabled` attributes (all off by default); `scroll-enabled` for wheel zoom.

## Anti-patterns (one-liner reminders)

- ❌ `<script src="https://js.arcgis.com/5.1/">` for an embed: the element is never defined, no error.
- ❌ `pnpm add @arcgis/embeddable-components` (not on npm).
- ❌ `hide-legend` / `hide-bookmarks`: not attributes; they do nothing.
- ❌ Expecting deep customization (use the full SDK).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md`: full guides
- `references/api-detail.md`: element attributes
- `references/examples.md`: embed / options / reading webMap
- `references/pitfalls.md`: extended troubleshooting
- `scripts/snippet-embed.ts`: CDN/script-tag pattern (no npm import)
