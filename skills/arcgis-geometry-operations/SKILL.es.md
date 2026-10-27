---
name: arcgis-geometry-operations
description: >
  Realiza operaciones de geometría del lado cliente con los operadores de geometría
  del ArcGIS Maps SDK for JavaScript 5.1 (bufferOperator, geodesicBufferOperator,
  intersectionOperator, unionOperator, containsOperator, simplifyOperator,
  geodeticAreaOperator, ...): cuáles piden load(), planar vs geodésico, y cómo
  dejar geometryEngine (deprecado desde 4.32). Usa esta skill cuando el usuario
  haga buffer, intersección, unión, mida, o pruebe relaciones espaciales.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Operaciones de Geometría

> **Cuándo usar:** Activa esta skill cuando el usuario haga buffer, intersección, unión, mida, o
> pruebe relaciones espaciales entre geometrías en el cliente.

## Resumen

El SDK calcula geometría localmente (buffers, overlays, relaciones y mediciones) sin un servicio.

- **Problema que resuelve:** matemática espacial (buffer/overlay/relate/medir) en el navegador.
- **A quién sirve:** desarrolladores que construyen herramientas de análisis y selección.
- **Patrón que enseña:** un módulo operador por operación; operadores geodésicos para lon/lat.
- **Qué NO cubre:** geoprocessing en servidor (ver `arcgis-spatial-analysis`) ni proyección (`arcgis-coordinates-projection`).

## Inicio Rápido

```typescript
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
import Point from "@arcgis/core/geometry/Point.js";

await geodesicBufferOperator.load(); // los operadores geodésicos lanzan error sin esto
const bogota = new Point({ longitude: -74.08, latitude: 4.6 });
const ring = geodesicBufferOperator.execute(bogota, 1000, { unit: "meters" });
```

Medido con 5.1.27: el área geodésica del anillo es 3,138 km² (un círculo de 1 km da 3,142). El
`bufferOperator` planar sobre este mismo punto en lon/lat **lanza** "Unable to convert from a linear
unit to an angular unit".

## Árbol de Decisión

1. **¿Geometría en lon/lat (wkid 4326) y una distancia en metros?**
   - Sí → `geodesicBufferOperator`, `geodeticLengthOperator`, `geodeticAreaOperator`,
     `geodeticDistanceOperator`, cada uno después de `await op.load()`.

2. **¿Geometría en un sistema proyectado (Web Mercator, MAGNA-SIRGAS 9377, UTM)?**
   - Área pequeña cerca del centro de la proyección → `bufferOperator`, `areaOperator`,
     `lengthOperator` planares (sin `load()`).
   - Área grande o latitud alta en Web Mercator → igual geodésico (el planar se va 4× a 60°N).

3. **¿Prueba de relación?**
   - `containsOperator`, `withinOperator`, `intersectsOperator`, `crossesOperator`,
     `touchesOperator`, `disjointOperator`, `equalsOperator`, `relateOperator`.

4. **¿Código viejo con `geometryEngine.*`?**
   - Reemplázalo: cada método tiene su operador, y `geometryEngine` está deprecado desde 4.32.

**Default:** solo operadores; los geodésicos para todo lo que esté en lon/lat.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";
```

### Imports Dinámicos (CDN)

```javascript
const intersectionOperator = await $arcgis.import("@arcgis/core/geometry/operators/intersectionOperator.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Opera sobre geometrías que lees de la vista del componente (hitTest, sketch, query).
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Un módulo por operación

Cada operador (`@arcgis/core/geometry/operators/*`, disponibles desde 4.31) exporta `execute` y, la
mayoría, `executeMany`. Los resultados pueden ser `null`: protégelos siempre. Los geodésicos
(`geodesicBuffer`, `geodeticArea`, `geodeticLength`, `geodeticDistance`, `geodeticDensify`,
`geodesicProximity`) necesitan `await op.load()` antes; sin eso, medido, `execute` lanza "m is not a
function" e `isLoaded()` da `false`.

### Concepto 2: geometryEngine está deprecado

`geometryEngine` sigue funcionando en 5.1.27 (medido: `contains` devuelve `true` igual que
`containsOperator`) y no escribe ningún aviso en tiempo de ejecución, pero sus tipos lo marcan
deprecado desde 4.32. El mapa: `contains` → `containsOperator`, `simplify` → `simplifyOperator`,
`geodesicBuffer` → `geodesicBufferOperator`, `geodesicLength` → `geodeticLengthOperator`,
`geodesicArea` → `geodeticAreaOperator`, `union` → `unionOperator.executeMany`, `clip` →
`clipOperator`.

### Concepto 3: Planar vs geodésico

Las cuentas planares usan las coordenadas tal como vienen. En lon/lat rechaza los metros (lanza
error). En Web Mercator usa metros proyectados, que crecen con la latitud: medido, un buffer planar
de 1000 m cubre 3,099 km² en Bogotá (1,4 % menos) y 0,787 km² a 60°N (75 % menos).

## Pitfalls Comunes (Top 3)

### Pitfall 1: Buffer planar sobre lon/lat

```typescript
// ❌ Anti-patrón
bufferOperator.execute(latLonPoint, 1000, { unit: "meters" });
```

```typescript
// ✅ Correcto
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
await geodesicBufferOperator.load();
geodesicBufferOperator.execute(latLonPoint, 1000, { unit: "meters" });
```

**Impacto:** medido: no distorsiona; lanza "Unable to convert from a linear unit to an angular
unit". Olvidar el `load()` en la versión correcta también lanza error.

### Pitfall 2: Medir geometría auto-intersecada

```typescript
// ❌ Anti-patrón
areaOperator.execute(bowtie); // un anillo en forma de ocho
```

```typescript
// ✅ Correcto
const clean = simplifyOperator.isSimple(bowtie) ? bowtie : simplifyOperator.execute(bowtie);
areaOperator.execute(clean as Polygon);
```

**Impacto:** medido sobre un moño de 10×10: el área del anillo crudo es **0** (los dos lóbulos se
cancelan); después de `simplifyOperator` son 2 anillos y 50. La intersección con una caja dio 50 en
los dos casos.

### Pitfall 3: Esperar que executeMany no congele la UI

```typescript
// ❌ Anti-patrón
const buffers = bufferOperator.executeMany(bigGeoms, distances, { union: true }); // "va en lote"
```

```typescript
// ✅ Correcto
// execute y executeMany son síncronos. Para trabajo pesado, córrelo en un Web Worker,
// o pártelo en tandas entre cuadros.
```

**Impacto:** medido con 5.000 puntos: un loop de `execute` tardó 150 ms y `executeMany` 113 ms, los
dos bloqueando el hilo principal; con `union: true` tardó 2,9 s.

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

- **0.2.0** (2026-10-27): SDK 5.1. El Inicio Rápido lanzaba error con la entrada más común: un `bufferOperator`
  planar sobre un punto en lon/lat con metros lanza "Unable to convert from a linear unit to an angular unit" (no
  "distorsiona"). El arreglo geodésico también pide `load()` (sin eso lanza). `geometryEngine`, presentado como
  respaldo, está deprecado desde 4.32: ahora solo operadores, con el mapa de migración. Los operadores son de 4.31,
  no "nuevos en 5.0". Medido: error planar en Web Mercator por latitud, área 0 del moño, `executeMany` también es
  síncrono, referencias espaciales distintas dan `null`. En `tests/runtime/casos/arcgis-geometry-operations.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
