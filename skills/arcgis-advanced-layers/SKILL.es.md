---
name: arcgis-advanced-layers
description: >
  Agrega capas OGC y de servicios de mapa dinámicos con el ArcGIS Maps SDK for
  JavaScript 5.1: WMSLayer, WMTSLayer, WFSLayer (solo WFS 2.0.0 + GeoJSON),
  OGCFeatureLayer (OGC API Features), KMLLayer, MapImageLayer (con sublayers) y
  CatalogLayer (una capa de catálogo dentro de un FeatureServer). Usa esta skill
  cuando el usuario integre servicios OGC/terceros, el geoportal de una IDE nacional,
  sublayers de MapServer, KML o un servicio de catálogo.
lang: es
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
   - WMS (imágenes renderizadas en el servidor) → `WMSLayer`.
   - WMTS (teselas OGC en caché) → `WMTSLayer`.
   - WFS (features vectoriales) → `WFSLayer`, **solo** si el servidor habla WFS 2.0.0 y ofrece salida
     GeoJSON. Un servidor que solo tiene WFS 1.x no carga.
   - OGC API – Features (`/collections/{id}`) → `OGCFeatureLayer` con `url` + `collectionId`.
   - KML/KMZ → `KMLLayer`.
   - ArcGIS MapServer dinámico → `MapImageLayer` (alterna `sublayers`).
   - Muchos datasets en un servicio → `CatalogLayer` (desde 4.30), apuntando a un **FeatureServer**
     que contenga una capa de catálogo. Un MapServer se rechaza ("There is no Catalog Layer in the service").
   - WCS / imágenes → ver `arcgis-imagery`.

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
cliente); `OGCFeatureLayer` lee OGC API – Features; `KMLLayer` renderiza KML/KMZ.

Dos cosas fallan sin error, las dos medidas con el SDK 5.1.27:

- Un `name` de sublayer de `WMSLayer` que no está en el GetCapabilities igual resuelve `load()` con
  `loadError = null` y no dibuja nada. Carga la capa una vez **sin** `sublayers` y lee
  `layer.allSublayers.map((s) => s.name)` para tener los nombres reales.
- `OGCFeatureLayer` no tiene `queryFeatures()` en la capa: consulta por su layer view
  (`(await view.whenLayerView(layer)).queryFeatures()`).

### Concepto 2: Sublayers de MapImageLayer

Un `MapImageLayer` expone `sublayers`, cada uno con `id` y `visible`. El servicio renderiza los
sublayers solicitados en una imagen dinámica — alterna visibilidad sin re-crear la capa.

Declarar `sublayers` en el constructor **reemplaza** la lista del servicio: en el servicio de
ejemplo USA, dos sublayers declarados dejan la capa con 2 en vez de 4. Lista todos los que quieras
conservar, u omite `sublayers` y alterna después de `load()`. Un `renderer` o un
`definitionExpression` por sublayer requiere `capabilities.exportMap.supportsDynamicLayers`.

### Concepto 3: CatalogLayer (desde 4.30)

Una capa de catálogo vive dentro de un **FeatureServer** y referencia muchos datasets. Después de
`await layer.load()` tiene dos sublayers: `footprintLayer` (un polígono por dataset) y
`dynamicGroupLayer` (los datasets visibles en la vista, de solo lectura, hasta 10 a la vez por
defecto: `dynamicGroupLayer.maximumVisibleSublayers`). Para editar o re-simbolizar un dataset,
agrégalo al mapa con `await layer.createLayerFromFootprint(footprintGraphic)`.

```typescript
import CatalogLayer from "@arcgis/core/layers/CatalogLayer.js";
const catalog = new CatalogLayer({ url: "https://services3.arcgis.com/TVDq0jswpjtt1Xia/arcgis/rest/services/PNW_Forest_Fuels_Inventory_Status/FeatureServer" });
await catalog.load();
map.add(catalog);
```

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
const wfs = new WFSLayer({ url, name: "ms:cities" }); // WFS 2.0.0 + GeoJSON; `name` es el typename
const count = await wfs.queryFeatureCount();
```

**Impacto:** `WMSLayer` no tiene `queryFeatures()`: sirve imágenes. Para identificar con clic en un
WMS, usa su popup (GetFeatureInfo, `featureInfoFormat`).

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
- [CatalogLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-cataloglayer/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. `CatalogLayer` es de 4.30 y necesita un FeatureServer (un MapServer se
  rechaza, medido); uso de footprint y grupo dinámico; requisito de WFS 2.0.0 + GeoJSON; nombre WMS
  equivocado que falla en silencio; los `sublayers` declarados reemplazan la lista del servicio; `WMTSLayer` y
  `OGCFeatureLayer`. Cada afirmación se ejecutó en `tests/runtime/casos/arcgis-advanced-layers.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
