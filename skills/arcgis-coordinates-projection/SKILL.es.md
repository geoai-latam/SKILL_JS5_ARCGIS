---
name: arcgis-coordinates-projection
description: >
  Maneja sistemas de coordenadas y reproyección con el ArcGIS Maps SDK for
  JavaScript 5.0: SpatialReference y WKIDs, el projectOperator de 5.0 (load +
  execute) para reproyección general, y webMercatorUtils para conversión rápida
  geográfica ↔ web-mercator. Usa esta skill cuando el usuario reproyecte geometría,
  trabaje con WKIDs/spatial references, o alinee datos entre sistemas de coordenadas.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: spatial
tags:
  - projection
  - spatialreference
  - wkid
  - webmercator
  - reproject
requires:
  - arcgis-geometry-operations
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Coordenadas y Proyección

> **Cuándo usar:** Activa esta skill cuando el usuario reproyecte geometría, maneje WKIDs / spatial
> references, o alinee datos entre sistemas de coordenadas.

## Resumen

Cada geometría tiene una spatial reference; mezclar sistemas requiere reproyección.

- **Problema que resuelve:** manejo correcto de coordenadas y reproyección.
- **A quién sirve:** desarrolladores que integran datos en distintos sistemas de coordenadas.
- **Patrón que enseña:** WKIDs, `projectOperator.load()`+`execute`, y atajos de webMercatorUtils.
- **Qué NO cubre:** overlay de geometría (ver `arcgis-geometry-operations`).

## Inicio Rápido

```typescript
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
const wm = webMercatorUtils.geographicToWebMercator(geographicPoint);
```

## Árbol de Decisión

1. **¿Solo Geográfica (4326) ↔ Web Mercator (3857)?**
   - Sí → `webMercatorUtils` (síncrono, sin load).

2. **¿Cualquier otra reproyección?**
   - Sí → `projectOperator.load()` y luego `projectOperator.execute(geom, outSR)`.

3. **¿Solo etiquetar un sistema?**
   - Sí → `new SpatialReference({ wkid })`.

**Default:** webMercatorUtils para el par común; projectOperator en otro caso.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
```

### Imports Dinámicos (CDN)

```javascript
const SpatialReference = await $arcgis.import("@arcgis/core/geometry/SpatialReference.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Reproyecta geometrías que lees de la view del componente antes de mezclar sistemas.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: SpatialReference y WKID

Un `SpatialReference` identifica el sistema de coordenadas, normalmente por `wkid` (ej. 4326 = WGS84,
3857 = Web Mercator). La geometría lleva su propia `spatialReference`.

### Concepto 2: projectOperator (load asíncrono)

El motor de proyección general debe cargarse una vez: `await projectOperator.load()`. Luego
`projectOperator.execute(geometry, outSpatialReference)` retorna la geometría reproyectada.

### Concepto 3: Atajo webMercatorUtils

Para el par común 4326 ↔ 3857, `webMercatorUtils.geographicToWebMercator` /
`webMercatorToGeographic` son síncronos y no requieren cargar el motor.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Llamar execute antes de load

```typescript
// ❌ Anti-patrón
projectOperator.execute(geom, outSR); // motor no cargado aún
```

```typescript
// ✅ Correcto
await projectOperator.load();
projectOperator.execute(geom, outSR);
```

**Impacto:** la llamada lanza error porque el motor de proyección no está listo.

### Pitfall 2: Comparar geometrías en distintos SR

```typescript
// ❌ Anti-patrón
geometryEngine.intersects(geom4326, geom3857);
```

```typescript
// ✅ Correcto
await projectOperator.load();
const same = projectOperator.execute(geom4326, geom3857.spatialReference);
```

**Impacto:** resultados erróneos/vacíos por sistemas de coordenadas desalineados.

### Pitfall 3: Hacer la matemática de web-mercator a mano

```typescript
// ❌ Anti-patrón
const x = (lon * 20037508.34) / 180; // propenso a errores
```

```typescript
// ✅ Correcto
const wm = webMercatorUtils.geographicToWebMercator(point);
```

**Impacto:** errores sutiles de proyección frente al helper probado.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de SpatialReference / projectOperator | `references/api-detail.md` |
| Ejemplos de reproyección | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-geometry-operations` — opera después de proyectar
- `arcgis-core-maps` — spatial reference de la view
- `arcgis-layers` — capas en varios sistemas de coordenadas

## Samples de Referencia

- [Projection](https://developers.arcgis.com/javascript/latest/sample-code/geometry-operators/)
- [Spatial reference](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-SpatialReference.html)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
