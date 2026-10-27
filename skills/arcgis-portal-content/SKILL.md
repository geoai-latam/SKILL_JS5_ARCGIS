---
name: arcgis-portal-content
description: >
  Work with ArcGIS Online / Enterprise content using the ArcGIS Maps SDK for
  JavaScript 5.1 portal classes: Portal, PortalItem, PortalQueryParams, and
  PortalGroup. Covers searching items and paging correctly (nextQueryParams.start
  is -1 at the end; num is capped at 100; start + num at 10000), sort order,
  loading items by id, and which loader fits which item type. Use this skill
  whenever the user searches portal content, loads a saved item, or lists groups.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: services
tags:
  - portal
  - portalitem
  - webmap
  - groups
  - content
requires:
  - arcgis-authentication
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Portal Content

> **When to use:** Activate this skill whenever the user searches ArcGIS content, loads an item by
> id, or works with portal groups/items.

## Overview

The portal classes read and query content from ArcGIS Online or Enterprise.

- **Problem it solves:** discovering and loading saved maps, layers, and items.
- **Who it serves:** developers integrating organizational content.
- **Pattern it teaches:** `Portal` + `PortalQueryParams` to search and page; `PortalItem` to load by id.
- **What it does NOT cover:** rendering a webmap (see `arcgis-core-maps`) or auth (see `arcgis-authentication`).

## Quick Start

```typescript
import Portal from "@arcgis/core/portal/Portal.js";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams.js";
import type PortalItem from "@arcgis/core/portal/PortalItem.js";

const portal = new Portal(); // ArcGIS Online; public content needs no sign-in
const items: PortalItem[] = [];
let page = await portal.queryItems(new PortalQueryParams({
  query: 'type:"Web Map" AND owner:esri', num: 100, sortField: "modified", sortOrder: "desc",
}));
items.push(...page.results);
while (page.nextQueryParams && page.nextQueryParams.start !== -1) { // -1 means "no more pages"
  page = await portal.queryItems(page.nextQueryParams);
  items.push(...page.results);
}
```

Measured with 5.1.27 against ArcGIS Online: 223 public Esri web maps in 3 pages.

## Decision Tree

1. **Have an item id already?**
   - Web map → `<arcgis-map item-id="...">` or `new WebMap({ portalItem: { id } })`.
   - Layer item (Feature Service, Map Service, …) → `Layer.fromPortalItem({ portalItem: { id } })`.
   - Just the metadata → `new PortalItem({ id })` and `await item.load()`.

2. **Need to search content?**
   - Yes → `portal.queryItems(new PortalQueryParams({ query, num, sortField, sortOrder }))`, paging until
     `nextQueryParams.start === -1`.

3. **Working with groups?**
   - Yes → `portal.queryGroups(params)`, then `group.queryItems(params)`.

**Default:** load by id when known; query and page when discovering.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import Portal from "@arcgis/core/portal/Portal.js";
```

### Dynamic Imports (CDN)

```javascript
const PortalItem = await $arcgis.import("@arcgis/core/portal/PortalItem.js");
```

### Map Components (recommended for new projects)

```typescript
// Pass an item id straight to the map component to render a saved webmap.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Portal and authentication

`new Portal()` points to `https://www.arcgis.com`; set `url` for Enterprise. Without sign-in, `portal.user` is
`null` and searches return only public items. A load of an id that does not exist, or that you cannot see, rejects
fast with `Item does not exist or is inaccessible.` (measured: `loadStatus` `"failed"`, no sign-in dialog).

### Concept 2: PortalQueryParams and its limits

`query` uses the ArcGIS search syntax (`type:"Web Map" AND owner:esri`). Measured limits on ArcGIS Online:

- The default page is 10 results; `num` above 100 is silently capped (asked 250, got 100).
- `start` is 1-based (the first `nextQueryParams.start` is 11), and `start + num` above 10000 throws
  `Result window is too large`.
- `total` also stops at 10000: a bare `"water"` query reported exactly `10000`.

### Concept 3: PortalItem.load()

`PortalItem` is lazy: measured, `title` and `type` are `null` until `await item.load()`. `fetchData()` returns the
item's JSON (for a web map: `operationalLayers`, `baseMap`, `spatialReference`, …).

## Common Pitfalls (Top 3)

### Pitfall 1: Paging with `while (nextQueryParams)`

```typescript
// ❌ Anti-pattern
let page = await portal.queryItems(params);
while (page.nextQueryParams) page = await portal.queryItems(page.nextQueryParams); // never ends
```

```typescript
// ✅ Correct
let page = await portal.queryItems(params);
while (page.nextQueryParams && page.nextQueryParams.start !== -1) page = await portal.queryItems(page.nextQueryParams);
```

**Impact:** measured: `nextQueryParams` is always an object; after the last page its `start` is `-1`, and querying
it restarts from the first page. The naive loop had 446 results after 6 pages of a 223-item search, and kept going.

### Pitfall 2: Sorting by `modified` and getting the oldest items

```typescript
// ❌ Anti-pattern
new PortalQueryParams({ query, sortField: "modified" }); // "latest maps"
```

```typescript
// ✅ Correct
new PortalQueryParams({ query, sortField: "modified", sortOrder: "desc" });
```

**Impact:** measured: without `sortOrder` the first results were modified in 2020; with `"desc"`, in 2026.

### Pitfall 3: `Layer.fromPortalItem` on a web map

```typescript
// ❌ Anti-pattern
const layer = await Layer.fromPortalItem({ portalItem: webMapItem });
```

```typescript
// ✅ Correct
const map = new WebMap({ portalItem: webMapItem }); // or <arcgis-map item-id="...">
```

**Impact:** measured: `Unknown item type 'Web Map'`. A web map item has no `url` either; `Layer.fromPortalItem` is for
layer items (it returned a `feature` layer for a Feature Service item).

## When to Read references/

| If you need... | Read |
|---|---|
| Portal / PortalItem / query signatures | `references/api-detail.md` |
| Search / load / groups examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-authentication` — sign in to access private content
- `arcgis-core-maps` — render a loaded webmap/webscene
- `arcgis-layers` — layers from portal items

## Reference Samples

- [Portal query](https://developers.arcgis.com/javascript/latest/sample-code/)
- [Load webmap by id](https://developers.arcgis.com/javascript/latest/sample-code/webmap-basic/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Measured against ArcGIS Online in `tests/runtime/casos/arcgis-portal-content.ts`.
  The old pagination "fix" (`if (first.nextQueryParams)`) re-queried from page one: `nextQueryParams` always exists
  and ends with `start` `-1`. New top pitfalls, measured: that loop, `sortField` without `sortOrder` returning the
  oldest items, and `Layer.fromPortalItem` on a web map. Documented the caps (num 100, start + num 10000, total
  10000). Replaced two comment-only extended pitfalls (token expiry, group membership) with measured ones; the
  snippet now pages correctly and sorts descending.
- **0.1.0** (2026-05-31): Initial release.
