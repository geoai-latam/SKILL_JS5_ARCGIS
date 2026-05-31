---
name: arcgis-rest-services
description: >
  Call ArcGIS location services with the ArcGIS Maps SDK for JavaScript 5.0 rest
  modules: route (directions), locator (geocoding), places (POI search), and
  query against feature services. Use this skill whenever the user geocodes an
  address, solves a route, searches places, or runs a standalone query against a
  REST endpoint.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# REST Services

> **When to use:** Activate this skill whenever the user geocodes, routes, searches places, or runs
> a standalone REST query.

## Overview

The `rest/*` modules are thin function wrappers over ArcGIS location services.

- **Problem it solves:** routing, geocoding, place search, and ad-hoc queries.
- **Who it serves:** developers integrating location services.
- **Pattern it teaches:** `import * as <service>`; call its function with a URL + params.
- **What it does NOT cover:** geoprocessing (see `arcgis-spatial-analysis`) or auth setup (see `arcgis-authentication`).

## Quick Start

```typescript
import * as locator from "@arcgis/core/rest/locator.js";
const results = await locator.addressToLocations(geocodeUrl, { address: { SingleLine: "Bogotá" } });
```

## Decision Tree

1. **What task?**
   - Address → coords → `locator.addressToLocations`.
   - Coords → address → `locator.locationToAddress`.
   - Directions → `route.solve` with `RouteParameters`.
   - POI search → `places` module.
   - Standalone feature query → `query.executeQueryJSON`.

2. **Secured/billed service?**
   - Yes → set `esriConfig.apiKey` or sign in (see `arcgis-authentication`).

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
import "@arcgis/map-components/dist/components/arcgis-search";
```

## Key Concepts

### Concept 1: Function modules

Each service is a namespace of functions (`route.solve`, `locator.addressToLocations`). Import the
namespace and call the function with the service URL plus a typed parameters object.

### Concept 2: Parameter classes

Some services use parameter classes — e.g. `RouteParameters` with a `stops` FeatureSet — to express
complex inputs cleanly.

### Concept 3: World service URLs + API key

Esri's world route/geocode services need an API key (or token). Set `esriConfig.apiKey` before
calling them; they are billed.

## Common Pitfalls (Top 3)

### Pitfall 1: Calling world services without an API key

```typescript
// ❌ Anti-pattern
await route.solve(WORLD_ROUTE_URL, params); // 401 without a key
```

```typescript
// ✅ Correct
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
await route.solve(WORLD_ROUTE_URL, params);
```

**Impact:** the request returns 401/Unauthorized.

### Pitfall 2: Passing raw arrays where a parameter class is expected

```typescript
// ❌ Anti-pattern
route.solve(url, { stops: [[-74, 4.6], [-74.1, 4.7]] });
```

```typescript
// ✅ Correct
const params = new RouteParameters({ stops: new FeatureSet({ features: stopGraphics }) });
route.solve(url, params);
```

**Impact:** the service rejects malformed stop input.

### Pitfall 3: Using esriRequest where a typed helper exists

```typescript
// ❌ Anti-pattern
await esriRequest(`${url}/solve?stops=...`); // hand-built, fragile
```

```typescript
// ✅ Correct
await route.solve(url, params); // typed, handles tokens/format
```

**Impact:** brittle URLs and missing token/format handling.

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

- **0.1.0** (2026-05-31): Initial release.
