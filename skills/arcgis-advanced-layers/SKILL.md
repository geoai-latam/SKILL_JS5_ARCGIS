---
name: arcgis-advanced-layers
description: >
  Add OGC and dynamic map service layers with the ArcGIS Maps SDK for JavaScript
  5.1: WMSLayer, WMTSLayer, WFSLayer (WFS 2.0.0 + GeoJSON only), OGCFeatureLayer
  (OGC API Features), KMLLayer, MapImageLayer (with sublayers), and CatalogLayer
  (a catalog layer in a FeatureServer). Use this skill when the user integrates
  OGC/third-party services, a national spatial-data portal, dynamic MapServer
  sublayers, KML, or a catalog service.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
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
   - WMS (server-rendered images) → `WMSLayer`.
   - WMTS (pre-cached OGC tiles) → `WMTSLayer`.
   - WFS (vector features) → `WFSLayer`, **only** if the server speaks WFS 2.0.0 and offers GeoJSON
     output. A WFS 1.x-only server will not load.
   - OGC API – Features (`/collections/{id}`) → `OGCFeatureLayer` with `url` + `collectionId`.
   - KML/KMZ → `KMLLayer`.
   - Dynamic ArcGIS MapServer → `MapImageLayer` (toggle `sublayers`).
   - Many datasets in one service → `CatalogLayer` (since 4.30), pointed at a **FeatureServer**
     that contains a catalog layer. A MapServer is rejected ("There is no Catalog Layer in the service").
   - WCS / imagery → see `arcgis-imagery`.

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
`OGCFeatureLayer` reads OGC API – Features; `KMLLayer` renders KML/KMZ.

Two things fail without an error, both measured with SDK 5.1.27:

- A `WMSLayer` sublayer `name` that is not in the GetCapabilities still resolves `load()` with
  `loadError = null` and draws nothing. Load the layer **without** `sublayers` once and read
  `layer.allSublayers.map((s) => s.name)` to get the real names.
- `OGCFeatureLayer` has no `queryFeatures()` on the layer: query through its layer view
  (`(await view.whenLayerView(layer)).queryFeatures()`).

### Concept 2: MapImageLayer sublayers

A `MapImageLayer` exposes `sublayers`, each with `id` and `visible`. The service renders the
requested sublayers into a dynamic image — toggle visibility without re-creating the layer.

Declaring `sublayers` in the constructor **replaces** the service's list: on the USA sample
service, two declared sublayers leave the layer with 2 sublayers instead of 4. List every sublayer
you want to keep, or omit `sublayers` and toggle after `load()`. A per-sublayer `renderer` or
`definitionExpression` needs `capabilities.exportMap.supportsDynamicLayers`.

### Concept 3: CatalogLayer (since 4.30)

A catalog layer lives inside a **FeatureServer** and references many datasets. After
`await layer.load()` it has two sublayers: `footprintLayer` (one polygon per dataset) and
`dynamicGroupLayer` (the datasets visible in the view, read-only, up to 10 at a time by default:
`dynamicGroupLayer.maximumVisibleSublayers`). To edit or restyle one dataset, add it to the map with
`await layer.createLayerFromFootprint(footprintGraphic)`.

```typescript
import CatalogLayer from "@arcgis/core/layers/CatalogLayer.js";
const catalog = new CatalogLayer({ url: "https://services3.arcgis.com/TVDq0jswpjtt1Xia/arcgis/rest/services/PNW_Forest_Fuels_Inventory_Status/FeatureServer" });
await catalog.load();
map.add(catalog);
```

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
const wfs = new WFSLayer({ url, name: "ms:cities" }); // WFS 2.0.0 + GeoJSON; `name` is the typename
const count = await wfs.queryFeatureCount();
```

**Impact:** `WMSLayer` has no `queryFeatures()`: it serves images. For click-to-identify on a WMS,
use its popup (GetFeatureInfo, `featureInfoFormat`).

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
- [CatalogLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-cataloglayer/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. `CatalogLayer` is from 4.30 and needs a FeatureServer (a MapServer is
  rejected, measured); footprint/dynamic-group usage; WFS 2.0.0 + GeoJSON requirement; silent wrong WMS name;
  declared `sublayers` replace the service list; `WMTSLayer` and `OGCFeatureLayer`. Every claim run in
  `tests/runtime/casos/arcgis-advanced-layers.ts` against public services.
- **0.1.0** (2026-05-31): Initial release.
