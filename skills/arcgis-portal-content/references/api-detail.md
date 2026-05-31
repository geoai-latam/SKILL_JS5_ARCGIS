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
| `new Portal({ url? })` | Defaults to ArcGIS Online; set `url` for Enterprise |
| `load()` | Loads portal metadata |
| `queryItems(params)` | Returns `{ results, nextQueryParams, total }` |
| `queryGroups(params)` | Query portal groups |
| `user` | The signed-in `PortalUser` (if any) |

---

## PortalItem

`@arcgis/core/portal/PortalItem.js`

| Member | Description |
|---|---|
| `new PortalItem({ id })` | Reference an item by id |
| `load()` | Required before reading metadata |
| `title` / `type` / `owner` | Metadata (post-load) |
| `fetchData()` | Item JSON data |

---

## PortalQueryParams

`@arcgis/core/portal/PortalQueryParams.js`

| Property | Type | Description |
|---|---|---|
| `query` | `string` | Lucene-like, e.g. `type:"Web Map" AND owner:esri` |
| `num` / `start` | `number` | Page size / offset |
| `sortField` / `sortOrder` | `string` | Sorting |

A query result's `nextQueryParams` drives the next page.
