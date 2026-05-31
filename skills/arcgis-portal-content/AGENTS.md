# Agent Guide: arcgis-portal-content

Quick-reference for portal content. Read before searching/loading items.

## Quick Decision Tree

1. **Know the id?** → `new PortalItem({ id })` + `load()` (or `item-id` on the map).
2. **Search?** → `portal.queryItems(new PortalQueryParams({ query }))`.
3. **Groups/users?** → `portal.queryGroups` / `PortalGroup`.

## Setup Checklist

- [ ] `await item.load()` before reading metadata.
- [ ] Sign in for private content.
- [ ] Set `portal.url` for Enterprise.
- [ ] Page results via `nextQueryParams`.

## Anti-patterns (one-liner reminders)

- ❌ Reading `item.title` before `load()`.
- ❌ Expecting private items without sign-in.
- ❌ Ignoring pagination.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — Portal / PortalItem / query
- `references/examples.md` — search / load / groups
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-portal-query.ts`
