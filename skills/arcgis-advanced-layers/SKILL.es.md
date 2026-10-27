---
name: arcgis-advanced-layers
description: >
  Agrega capas OGC y de servicios de mapa dinámicos con el ArcGIS Maps SDK for
  JavaScript 5.0: WMSLayer, WFSLayer, KMLLayer, MapImageLayer (con sublayers), y
  la nueva CatalogLayer para navegar muchos datasets desde un servicio. Usa esta
  skill cuando el usuario integre servicios OGC/terceros, sublayers de MapServer,
  KML, o un servicio de catálogo.
lang: es
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

# Capas Avanzadas

> **Cuándo usar:** Activa esta skill cuando el usuario integre servicios OGC (WMS/WFS/KML),
> sublayers de MapImageLayer dinámico, o la nueva CatalogLayer.

## Resumen

Más allá de datos de features, el SDK consume estándares OGC, servicios de mapa dinámicos y de catálogo.

- **Problema que resuelve:** traer datos de terceros y renderizados en servidor a un mapa.
- **A quién sirve:** desarrolladores que integran servicios GIS externos/empresariales.
- **Patrón que enseña:** asociar la clase de capa al protocolo; controlar visibilidad de sublayers.
- **Qué NO cubre:** datos de features hosted (ver `arcgis-layers`) ni 3D (ver `arcgis-3d-layers`).

## Inicio Rápido

```typescript
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";
const layer = new WMSLayer({ url: "https://example/geoserver/wms", sublayers: [{ name: "topp:states" }] });
map.add(layer);
```

## Árbol de Decisión

1. **¿Qué protocolo/servicio?**
   - WMS (tiles renderizados) → `WMSLayer`.
   - WFS (features vectoriales) → `WFSLayer`.
   - KML/KMZ → `KMLLayer`.
   - ArcGIS MapServer dinámico → `MapImageLayer` (alterna `sublayers`).
   - Muchos datasets en un servicio → `CatalogLayer` (nueva en 5.0).

**Default:** `MapImageLayer` para MapServers de ArcGIS; la clase OGC que corresponda en otro caso.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import MapImageLayer from "@arcgis/core/layers/MapImageLayer.js";
```

### Imports Dinámicos (CDN)

```javascript
const MapImageLayer = await $arcgis.import("@arcgis/core/layers/MapImageLayer.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Crea la capa con la Core API y luego agrégala al map del componente.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Clases de capa OGC

`WMSLayer` renderiza imágenes del servidor; `WFSLayer` trae features vectoriales (consultables en
cliente); `KMLLayer` renderiza KML/KMZ. Cada una mapea a un estándar OGC.

### Concepto 2: Sublayers de MapImageLayer

Un `MapImageLayer` expone `sublayers`, cada uno con `id` y `visible`. El servicio renderiza los
sublayers solicitados en una imagen dinámica — alterna visibilidad sin re-crear la capa.

### Concepto 3: CatalogLayer (nueva en 5.0)

`CatalogLayer` expone muchos datasets publicados en un solo servicio de catálogo, dejando al
usuario navegar y agregar footprints/capas dinámicamente. Llama `await layer.load()` antes de inspeccionarla.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Esperar queries de cliente en una capa WMS

```typescript
// ❌ Anti-patrón
const wms = new WMSLayer({ url });
await wms.queryFeatures(); // WMS son imágenes renderizadas, no features consultables
```

```typescript
// ✅ Correcto
import WFSLayer from "@arcgis/core/layers/WFSLayer.js";
const wfs = new WFSLayer({ url }); // WFS retorna features vectoriales consultables
```

**Impacto:** no vuelven features de una capa WMS porque sirve imágenes.

### Pitfall 2: Re-crear MapImageLayer para alternar un sublayer

```typescript
// ❌ Anti-patrón
map.remove(layer);
map.add(new MapImageLayer({ url, sublayers: [{ id: 1, visible: true }] }));
```

```typescript
// ✅ Correcto
const sub = layer.findSublayerById(1);
if (sub) sub.visible = true;
```

**Impacto:** re-fetch innecesario y parpadeo en cada toggle.

### Pitfall 3: CORS/SSL en endpoints OGC de terceros

```typescript
// ❌ Anti-patrón
new WMSLayer({ url: "http://insecure-host/wms" }); // mixed content / CORS bloqueado
```

```typescript
// ✅ Correcto
new WMSLayer({ url: "https://host/wms" }); // HTTPS + CORS del servidor, o un proxy
```

**Impacto:** la capa no carga por errores de mixed-content o CORS.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de capas (WMS/WFS/MapImage/Catalog) | `references/api-detail.md` |
| Ejemplos de sublayers + OGC | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-layers` — fundamentos de datos de features hosted
- `arcgis-imagery` — servicios de imágenes y raster functions
- `arcgis-core-maps` — el mapa donde van las capas

## Samples de Referencia

- [WMSLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-wms/)
- [MapImageLayer sublayers](https://developers.arcgis.com/javascript/latest/sample-code/layers-mapimagelayer-sublayers/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
