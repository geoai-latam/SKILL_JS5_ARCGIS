# Agent Guide: arcgis-portal-content

Quick-reference for portal content (SDK 5.1). Read before searching/loading items.

## Quick Decision Tree

1. **Know the id?** → web map: `item-id` on `<arcgis-map>` / `WebMap`; layer item: `Layer.fromPortalItem`;
   metadata: `new PortalItem({ id })` + `load()`.
2. **Search?** → `portal.queryItems(new PortalQueryParams({ query, num: 100, sortField, sortOrder }))`.
3. **Groups?** → `portal.queryGroups` / `group.queryItems`.

## Setup Checklist

- [ ] Page until `nextQueryParams.start === -1` (the object is always there).
- [ ] `num` ≤ 100; `start + num` ≤ 10000.
- [ ] `sortOrder: "desc"` for "latest".
- [ ] `await item.load()` before reading metadata.
- [ ] Set `portal.url` for Enterprise; sign in for private content.

## Anti-patterns (one-liner reminders)

- ❌ `while (page.nextQueryParams)`: restarts at page one forever.
- ❌ `sortField: "modified"` alone: oldest first.
- ❌ `Layer.fromPortalItem` on a web map: `Unknown item type 'Web Map'`.
- ❌ Reading `item.title` before `load()` (`null`).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — Portal / PortalItem / query
- `references/examples.md` — search / load / groups
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-portal-query.ts`
