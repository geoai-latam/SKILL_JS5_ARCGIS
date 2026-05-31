---
name: arcgis-portal-content
description: >
  Work with ArcGIS Online / Enterprise content using the ArcGIS Maps SDK for
  JavaScript 5.0 portal classes: Portal, PortalItem, PortalQueryParams, and
  PortalGroup. Covers querying items, loading a webmap/webscene by item id, and
  reading item metadata. Use this skill whenever the user searches portal content,
  loads a saved item, or manages groups/items.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
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
- **Pattern it teaches:** `Portal` + `PortalQueryParams` to search; `PortalItem` to load by id.
- **What it does NOT cover:** rendering a webmap (see `arcgis-core-maps`) or auth (see `arcgis-authentication`).

## Quick Start

```typescript
import PortalItem from "@arcgis/core/portal/PortalItem.js";
const item = new PortalItem({ id: "<item-id>" });
await item.load();
```

## Decision Tree

1. **Have an item id already?**
   - Yes → `new PortalItem({ id })` and `load()`, or pass `item-id` to `<arcgis-map>`.

2. **Need to search content?**
   - Yes → `portal.queryItems(new PortalQueryParams({ query }))`.

3. **Working with groups/users?**
   - Yes → `portal.queryGroups` / `PortalGroup.queryItems`.

**Default:** load by id when known; query when discovering.

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
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: Portal and authentication

`new Portal()` defaults to ArcGIS Online; set `portal.url` for Enterprise. Querying private content
requires sign-in; public content works with no auth.

### Concept 2: PortalQueryParams

Build a query with `query` (Lucene-like syntax: `type:"Web Map" AND owner:esri`), `num`, `start`,
and `sortField`. `portal.queryItems` returns paginated results.

### Concept 3: PortalItem.load()

`PortalItem` is lazy — call `await item.load()` before reading `title`, `type`, or `portalItem`
data. You can construct an item from just an `id`.

## Common Pitfalls (Top 3)

### Pitfall 1: Reading item properties before load

```typescript
// ❌ Anti-pattern
const item = new PortalItem({ id });
console.log(item.title); // undefined
```

```typescript
// ✅ Correct
const item = new PortalItem({ id });
await item.load();
console.log(item.title);
```

**Impact:** metadata is empty until the item loads.

### Pitfall 2: Querying private content without sign-in

```typescript
// ❌ Anti-pattern
await portal.queryItems(params); // private items missing
```

```typescript
// ✅ Correct
// Sign in (OAuth/IdentityManager) so the portal returns your org's items.
```

**Impact:** private items silently absent from results.

### Pitfall 3: Forgetting pagination

```typescript
// ❌ Anti-pattern
const { results } = await portal.queryItems(new PortalQueryParams({ query }));
// only the first page
```

```typescript
// ✅ Correct
const first = await portal.queryItems(new PortalQueryParams({ query, num: 100 }));
if (first.nextQueryParams) await portal.queryItems(first.nextQueryParams);
```

**Impact:** you miss results beyond the first page.

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

- **0.1.0** (2026-05-31): Initial release.
