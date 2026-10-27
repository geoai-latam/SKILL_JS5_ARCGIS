# API Reference: Portal Content

## Table of Contents

- [Portal](#portal)
- [PortalItem](#portalitem)
- [PortalQueryParams](#portalqueryparams)

---

## Portal

`@arcgis/core/portal/Portal.js`

| Member | Description |
|---|---|
| `new Portal({ url? })` | Defaults to `https://www.arcgis.com`; set `url` for Enterprise |
| `load()` | Loads portal metadata |
| `queryItems(params)` | Returns `{ results, nextQueryParams, total }`; `total` caps at 10000 |
| `queryGroups(params)` | Query portal groups |
| `user` | The signed-in `PortalUser`, `null` without sign-in |

---

## PortalItem

`@arcgis/core/portal/PortalItem.js`

| Member | Description |
|---|---|
| `new PortalItem({ id })` | Reference an item by id |
| `load()` | Required before reading metadata (`title`/`type` are `null` before) |
| `title` / `type` / `owner` | Metadata (post-load) |
| `fetchData()` | Item JSON data |

---

## PortalQueryParams

`@arcgis/core/portal/PortalQueryParams.js`

| Property | Type | Description |
|---|---|---|
| `query` | `string` | Lucene-like, e.g. `type:"Web Map" AND owner:esri` |
| `num` / `start` | `number` | Page size (default 10, max 100) / 1-based offset; `start + num` ≤ 10000 |
| `sortField` / `sortOrder` | `string` | Sorting; `sortOrder` defaults to `"asc"` |

A query result's `nextQueryParams` drives the next page. It is always present: `start === -1` means there are no
more pages (measured).
