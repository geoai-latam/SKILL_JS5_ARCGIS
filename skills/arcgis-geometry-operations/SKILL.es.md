---
name: arcgis-geometry-operations
description: >
  Realiza operaciones de geometría del lado cliente con el ArcGIS Maps SDK for
  JavaScript 5.0: la nueva operators API por operación (bufferOperator,
  intersectionOperator, unionOperator, ...) y el clásico geometryEngine síncrono
  (contains, intersects, geodesicBuffer, simplify). Usa esta skill cuando el
  usuario haga buffer, intersección, unión, mida, o pruebe relaciones espaciales.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: spatial
tags:
  - geometryengine
  - operators
  - buffer
  - intersect
  - measurement
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Operaciones de Geometría

> **Cuándo usar:** Activa esta skill cuando el usuario haga buffer, intersección, unión, mida, o
> pruebe relaciones espaciales entre geometrías en el cliente.

## Resumen

El SDK calcula geometría localmente — buffers, overlays, relaciones y mediciones — sin un servicio.

- **Problema que resuelve:** matemática espacial (buffer/overlay/relate/medir) en el navegador.
- **A quién sirve:** desarrolladores que construyen herramientas de análisis y selección.
- **Patrón que enseña:** prefiere la operators API de 5.0; usa geometryEngine para amplitud.
- **Qué NO cubre:** geoprocessing en servidor (ver `arcgis-spatial-analysis`) ni proyección (`arcgis-coordinates-projection`).

## Inicio Rápido

```typescript
import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator.js";
const ring = bufferOperator.execute(point, 1000, { unit: "meters" });
```

## Árbol de Decisión

1. **¿Operación única y bien definida (buffer/intersección/unión/...)?**
   - Sí → el módulo operator correspondiente (`bufferOperator`, `intersectionOperator`, ...).

2. **¿Muchas operaciones o un test de relación que aún no es operator?**
   - Sí → métodos de `geometryEngine` (sync) como `contains`, `within`, `crosses`.

3. **¿Geodésico (áreas grandes / lat-lon)?**
   - Sí → usa variantes geodésicas (`geodesicBuffer`, `geodesicBufferOperator`).

**Default:** operators para código nuevo; geometryEngine donde no exista un operator.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";
```

### Imports Dinámicos (CDN)

```javascript
const geometryEngine = await $arcgis.import("@arcgis/core/geometry/geometryEngine.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Opera sobre geometrías que lees de la view del componente (hitTest, sketch, query).
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Operators API (nueva en 5.0)

Cada operación es su propio módulo que exporta `execute` (única) y `executeMany` (lote), ej.
`bufferOperator.execute(geometry, distance, { unit })`. Tree-shakeable y compatible con workers.

### Concepto 2: geometryEngine (clásico, síncrono)

`geometryEngine` expone muchas operaciones y tests de relación en un módulo: `contains`,
`intersects`, `simplify`, `geodesicBuffer`, `geodesicLength`, `union`.

### Concepto 3: Planar vs geodésico

La matemática planar funciona dentro de una zona proyectada; para extensiones grandes o coordenadas
geográficas usa las variantes geodésicas para evitar distorsión de distancia/área.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Buffer planar en coordenadas geográficas

```typescript
// ❌ Anti-patrón
bufferOperator.execute(latLonPoint, 1000, { unit: "meters" }); // distorsionado en áreas grandes
```

```typescript
// ✅ Correcto
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
geodesicBufferOperator.execute(latLonPoint, 1000, { unit: "meters" });
```

**Impacto:** tamaño/forma de buffer incorrectos lejos del ecuador.

### Pitfall 2: Operar sobre geometría inválida/auto-intersecante

```typescript
// ❌ Anti-patrón
intersectionOperator.execute(messyPolygon, other); // puede dar resultado erróneo
```

```typescript
// ✅ Correcto
const clean = geometryEngine.simplify(messyPolygon);
intersectionOperator.execute(clean, other);
```

**Impacto:** resultados de overlay incorrectos por geometría no simple.

### Pitfall 3: Bloquear la UI con ops en lote enormes

```typescript
// ❌ Anti-patrón
bigGeoms.forEach((g) => bufferOperator.execute(g, 100)); // sync en el hilo principal
```

```typescript
// ✅ Correcto
const buffers = bufferOperator.executeMany(bigGeoms, distances); // por lote
```

**Impacto:** caída de frames al bufferear miles de geometrías una por una.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de operators + geometryEngine | `references/api-detail.md` |
| Ejemplos de buffer / overlay / relate | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-coordinates-projection` — proyecta antes de matemática planar
- `arcgis-spatial-analysis` — geoprocessing del lado servidor
- `arcgis-interaction` — obtén geometrías de sketch/hitTest

## Samples de Referencia

- [Geometry operators](https://developers.arcgis.com/javascript/latest/sample-code/geometry-operator-worker/)
- [geometryEngine](https://developers.arcgis.com/javascript/latest/sample-code/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
