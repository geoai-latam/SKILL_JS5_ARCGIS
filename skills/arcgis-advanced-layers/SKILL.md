---
name: arcgis-advanced-layers
description: >
  Add OGC and dynamic map service layers with the ArcGIS Maps SDK for JavaScript
  5.0: WMSLayer, WFSLayer, KMLLayer, MapImageLayer (with sublayers), and the new
  CatalogLayer for browsing many datasets from one service. Use this skill when
  the user integrates OGC/third-party services, dynamic MapServer sublayers, KML,
  or a catalog service.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: layers
tags:
  - wms
  - wfs
  - mapimagelayer
  - cataloglayer
  - ogc
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Advanced Layers

> **When to use:** Activate this skill whenever the user integrates OGC services (WMS/WFS/KML),
> dynamic MapImageLayer sublayers, or the new CatalogLayer.

## Overview

Beyond feature data, the SDK consumes OGC standards, dynamic map services, and catalog services.

- **Problem it solves:** bringing third-party and server-rendered data into a map.
- **Who it serves:** developers integrating external/enterprise GIS services.
- **Pattern it teaches:** match the layer class to the protocol; control sublayer visibility.
- **What it does NOT cover:** hosted feature data (see `arcgis-layers`) or 3D (see `arcgis-3d-layers`).

## Quick Start

```typescript
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";
const layer = new WMSLayer({ url: "https://example/geoserver/wms", sublayers: [{ name: "topp:states" }] });
map.add(layer);
```

## Decision Tree

1. **What protocol/service?**
   - WMS (rendered tiles) → `WMSLayer`.
   - WFS (vector features) → `WFSLayer`.
   - KML/KMZ → `KMLLayer`.
   - Dynamic ArcGIS MapServer → `MapImageLayer` (toggle `sublayers`).
   - Many datasets in one service → `CatalogLayer` (new in 5.0).

**Default:** `MapImageLayer` for ArcGIS MapServers; the OGC class that matches the standard otherwise.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import MapImageLayer from "@arcgis/core/layers/MapImageLayer.js";
```

### Dynamic Imports (CDN)

```javascript
const MapImageLayer = await $arcgis.import("@arcgis/core/layers/MapImageLayer.js");
```

### Map Components (recommended for new projects)

```typescript
// Create the layer with the Core API, then add it to the component's map.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: OGC layer classes

`WMSLayer` renders server images; `WFSLayer` pulls vector features (queryable client-side);
`KMLLayer` renders KML/KMZ. Each maps to one OGC standard.

### Concept 2: MapImageLayer sublayers

A `MapImageLayer` exposes `sublayers`, each with `id` and `visible`. The service renders the
requested sublayers into a dynamic image — toggle visibility without re-creating the layer.

### Concept 3: CatalogLayer (new in 5.0)

`CatalogLayer` surfaces many datasets published in a single catalog service, letting users browse
and add footprints/layers dynamically. Call `await layer.load()` before inspecting its contents.

## Common Pitfalls (Top 3)

### Pitfall 1: Expecting client queries on a WMS layer

```typescript
// ❌ Anti-pattern
const wms = new WMSLayer({ url });
await wms.queryFeatures(); // WMS is rendered images, not queryable features
```

```typescript
// ✅ Correct
import WFSLayer from "@arcgis/core/layers/WFSLayer.js";
const wfs = new WFSLayer({ url }); // WFS returns vector features you can query
```

**Impact:** no features come back from a WMS layer because it serves images.

### Pitfall 2: Re-creating MapImageLayer to toggle a sublayer

```typescript
// ❌ Anti-pattern
map.remove(layer);
map.add(new MapImageLayer({ url, sublayers: [{ id: 1, visible: true }] }));
```

```typescript
// ✅ Correct
const sub = layer.findSublayerById(1);
if (sub) sub.visible = true;
```

**Impact:** unnecessary re-fetch and flicker on every toggle.

### Pitfall 3: CORS/SSL on third-party OGC endpoints

```typescript
// ❌ Anti-pattern
new WMSLayer({ url: "http://insecure-host/wms" }); // mixed content / CORS blocked
```

```typescript
// ✅ Correct
new WMSLayer({ url: "https://host/wms" }); // HTTPS + server CORS, or a proxy
```

**Impact:** the layer fails to load due to mixed-content or CORS errors.

## When to Read references/

| If you need... | Read |
|---|---|
| Layer signatures (WMS/WFS/MapImage/Catalog) | `references/api-detail.md` |
| Sublayer + OGC examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-layers` — hosted feature data basics
- `arcgis-imagery` — imagery services and raster functions
- `arcgis-core-maps` — the map the layers go on

## Reference Samples

- [WMSLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-wms/)
- [MapImageLayer sublayers](https://developers.arcgis.com/javascript/latest/sample-code/layers-mapimagelayer-sublayers/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
