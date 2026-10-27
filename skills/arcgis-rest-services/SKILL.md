---
name: arcgis-rest-services
description: >
  Call ArcGIS location services with the ArcGIS Maps SDK for JavaScript 5.1 rest
  modules: route (directions), locator (geocoding), places (POI search), and
  standalone queries against feature services. Covers what happens without an API
  key (a sign-in dialog and a promise that never settles, not a 401), route stops
  as FeatureSet or Collection<Stop>, and the silent query results (0 features on
  a service root, 1000-row cap, no geometry by default). Use this skill whenever
  the user geocodes an address, solves a route, searches places, or runs a
  standalone query against a REST endpoint.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: services
tags:
  - route
  - locator
  - places
  - query
  - rest
requires:
  - arcgis-authentication
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# REST Services

> **When to use:** Activate this skill whenever the user geocodes, routes, searches places, or runs
> a standalone REST query.

## Overview

The `rest/*` modules are function wrappers over ArcGIS location and feature services.

- **Problem it solves:** routing, geocoding, place search, and ad-hoc queries.
- **Who it serves:** developers integrating location services.
- **Pattern it teaches:** `import * as <service>`; call its function with a URL + a typed parameters object.
- **What it does NOT cover:** geoprocessing (see `arcgis-spatial-analysis`) or auth setup (see `arcgis-authentication`).

## Quick Start

```typescript
import esriConfig from "@arcgis/core/config.js";
import * as locator from "@arcgis/core/rest/locator.js";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string; // before the first call
const GEOCODE_URL = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
const candidates = await locator.addressToLocations(GEOCODE_URL, {
  address: { SingleLine: "Plaza de Bolívar, Bogotá" },
  maxLocations: 3,
  outFields: ["Addr_type", "City", "Country"], // attributes are empty without it
});
const best = candidates[0]; // undefined when nothing matches
```

## Decision Tree

1. **What task?**
   - Address → coords → `locator.addressToLocations`.
   - Coords → address → `locator.locationToAddress`.
   - Directions → `route.solve(url, new RouteParameters({ stops }))`, `stops` a `FeatureSet` or `Collection<Stop>`.
   - POI search → `places.queryPlacesNearPoint(new PlacesQueryParameters({ point, searchText }))` (no URL argument).
   - Standalone feature query → `query.executeQueryJSON(layerUrl, query)`, with the layer index in the URL.

2. **Esri world service (geocode-api, route-api, places-api)?**
   - Yes → set `esriConfig.apiKey` first (or sign in, see `arcgis-authentication`).

**Default:** the `rest/*` module matching the task.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import * as route from "@arcgis/core/rest/route.js";
```

### Dynamic Imports (CDN)

```javascript
const locator = await $arcgis.import("@arcgis/core/rest/locator.js");
```

### Map Components (recommended for new projects)

```typescript
// The arcgis-search component wraps locator/places for a ready-made UI.
import "@arcgis/map-components/components/arcgis-search";
```

## Key Concepts

### Concept 1: Function modules

Each service is a namespace of functions (`route.solve`, `locator.addressToLocations`). Import the namespace and
call the function with the service URL plus a parameters object. `places` is the exception: its functions take only
the parameters and use Esri's places service.

### Concept 2: Parameter classes

`route.solve` needs a real `RouteParameters`, and its `stops` a `FeatureSet` of point graphics or a
`Collection<Stop>`. Measured on a public route service: both solved (a polyline, `Total_TravelTime` 14.79 min). With
`returnDirections: true` and `directionsLanguage: "es"` it returned 12 maneuvers, starting with
`Salga desde Location 1`; by default there are none.

### Concept 3: Results arrive in WGS84, and that is fine

Geocoder results came back with `wkid` 4326. Added to a Web Mercator view, the point landed at (200, 157) of a
400×300 view centered on it: the view reprojects WGS84 on the fly. Ask for `outSpatialReference` only when you will
do math in the view's coordinates.

## Common Pitfalls (Top 3)

### Pitfall 1: Calling a world service without an API key

```typescript
// ❌ Anti-pattern
await route.solve(WORLD_ROUTE_URL, params); // no esriConfig.apiKey
```

```typescript
// ✅ Correct
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
await route.solve(WORLD_ROUTE_URL, params);
```

**Impact:** measured on `geocode-api`, `route-api` and `places`: no 401 and no rejection. The IdentityManager fired
`dialog-create`, a sign-in `calcite-dialog` opened, and the promise stayed pending; a `catch` never runs.

### Pitfall 2: Raw stops or a plain parameters object

```typescript
// ❌ Anti-pattern
route.solve(url, { stops: [[-74.08, 4.6], [-74.05, 4.65]] } as never);
```

```typescript
// ✅ Correct
const params = new RouteParameters({ stops: new FeatureSet({ features: stopGraphics }) });
route.solve(url, params);
```

**Impact:** measured: both a raw coordinate array in `stops` and a plain object instead of `RouteParameters` failed
before any request, with `TypeError: t.toJSON is not a function`, an error that does not say what is wrong.

### Pitfall 3: Querying the service root instead of a layer

```typescript
// ❌ Anti-pattern
await query.executeQueryJSON(MAPSERVER_URL, { where: "1=1" });
```

```typescript
// ✅ Correct
await query.executeQueryJSON(`${MAPSERVER_URL}/0`, { where: "pop2000 > 1000000", outFields: ["areaname"] });
```

**Impact:** measured: the root returned **0 features and no error**; `/0` returned 9. On the layer, `where: "1=1"`
returned 1000 of 3557 rows (`exceededTransferLimit: true`), and the features had no geometry unless
`returnGeometry: true`.

## When to Read references/

| If you need... | Read |
|---|---|
| route / locator / places / query signatures | `references/api-detail.md` |
| Geocode / route / query examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-authentication` — API keys / OAuth for services
- `arcgis-spatial-analysis` — geoprocessing services
- `arcgis-layers` — query layers directly

## Reference Samples

- [Find route](https://developers.arcgis.com/javascript/latest/sample-code/sandbox/?sample=route-simple)
- [Geocoding](https://developers.arcgis.com/javascript/latest/sample-code/widgets-search-3d/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Measured in `tests/runtime/casos/arcgis-rest-services.ts` (public services, no
  API key). The old "401 without a key" was wrong: the SDK opens a sign-in dialog and the promise never settles. A
  query on the service root returns 0 features instead of failing. Raw stops fail with an opaque `toJSON` TypeError.
  Removed the false "WGS84 results land offset" pitfall and three comment-only ones (quotas, CORS, esriRequest);
  added measured ones for directions, outFields, empty matches, returnGeometry and the 1000-row cap. `places` takes
  no URL.
- **0.1.0** (2026-05-31): Initial release.
