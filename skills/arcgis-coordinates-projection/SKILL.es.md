---
name: arcgis-coordinates-projection
description: >
  Maneja sistemas de coordenadas y reproyección con el ArcGIS Maps SDK for
  JavaScript 5.1: SpatialReference y WKIDs (incluido el EPSG 9377 de Colombia),
  projectOperator (load + execute/executeMany), transformaciones de datum con
  geographicTransformationUtils, y webMercatorUtils para WGS84 ↔ web mercator.
  Usa esta skill cuando el usuario reproyecte geometría, trabaje con WKIDs o
  datums, o alinee datos entre sistemas de coordenadas.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
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
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import Point from "@arcgis/core/geometry/Point.js";

if (!projectOperator.isLoaded()) await projectOperator.load();
const bogota = new Point({ longitude: -74.0761, latitude: 4.5981 }); // x = lon, y = lat
// MAGNA-SIRGAS / Origen-Nacional, Colombia's official plane system since 2020
const plano = projectOperator.execute(bogota, new SpatialReference({ wkid: 9377 }));
```

## Árbol de Decisión

1. **¿Solo WGS84 (4326) ↔ Web Mercator (3857/102100)?**
   - Sí → `webMercatorUtils` (síncrono, sin load). No revisa el datum: ver Pitfall 2.
2. **¿Cualquier otro sistema (cuadrículas nacionales, UTM, otro datum)?**
   - Sí → `projectOperator.load()` una vez, luego `execute` / `executeMany`.
3. **¿Datums distintos (Bogotá 1975, NAD27, PSAD56…)?**
   - Sí → elige la transformación: `geographicTransformationUtils.getTransformations(in, out, aoi)`
     y pásala como `{ geographicTransformation }`. Las transformaciones por grilla no están soportadas.
4. **¿Comparar o superponer geometrías?**
   - Llévalas primero a un mismo sistema de referencia: los operadores no reproyectan por ti.

**Por defecto:** `projectOperator` con un destino explícito; `webMercatorUtils` solo para el par WGS84.

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
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: SpatialReference y WKID

Un `SpatialReference` identifica el sistema de coordenadas por `wkid`: 4326 (WGS84), 3857/102100
(Web Mercator), 4686 (MAGNA-SIRGAS geográfico), 9377 (MAGNA-SIRGAS / Origen-Nacional, el sistema
plano oficial único de Colombia: resoluciones 471 y 529 de 2020 del IGAC, código EPSG fijado en
2021; reemplaza las cinco zonas como la 3116 "Bogota zone"). Cada geometría lleva su propio
`spatialReference`. En un `Point`, `x` es la longitud y `y` la latitud.

### Concepto 2: projectOperator (cargar una vez)

`projectOperator` necesita su motor: `if (!projectOperator.isLoaded()) await projectOperator.load()`.
Medido con 5.1.27: llamar `execute` antes lanza `p is not a function`, un mensaje que no dice
"load". Los operadores geodésicos (`geodeticDistanceOperator`, `geodesicBufferOperator`…) tienen el
mismo `load()`. `executeMany` proyecta un arreglo que **comparte un solo sistema de referencia**: una
geometría en otro sistema vuelve `null`, sin error. Los valores Z pasan (medido), pero un cambio de
sistema vertical lanza una excepción.

### Concepto 3: La transformación de datum se elige, no se supone

Cuando los datums difieren, `execute` aplica por su cuenta una transformación por ecuación por
defecto (medido: el resultado sin opciones es igual al de `getTransformation(in, out)`). La de
defecto es una entre muchas: de Bogotá 1975 (4218) a WGS84 hay 27, y en Bogotá difieren hasta
22 m. Elige la de tu zona con `getTransformations(in, out, areaOfInterestExtent)`, pásala explícita
y deja escrito cuál usaste.

### Concepto 4: Atajo webMercatorUtils

`geographicToWebMercator` / `webMercatorToGeographic` son síncronos y no necesitan load, pero solo
conocen WGS84 ↔ Web Mercator y no validan la entrada (ver los pitfalls).

## Pitfalls Comunes (Top 3)

### Pitfall 1: Llamar execute antes de load

```typescript
// ❌ Anti-patrón
projectOperator.execute(geom, outSR); // motor sin cargar
```

```typescript
// ✅ Correcto
if (!projectOperator.isLoaded()) await projectOperator.load();
projectOperator.execute(geom, outSR);
```

**Impacto:** medido con 5.1.27: lanza `p is not a function`, que no señala el `load()` que falta.

### Pitfall 2: Superponer geometrías en sistemas de referencia distintos

```typescript
// ❌ Anti-patrón
intersectsOperator.execute(poly4326, poly3857);
```

```typescript
// ✅ Correcto
if (!projectOperator.isLoaded()) await projectOperator.load();
const same = projectOperator.execute(poly4326, poly3857.spatialReference)!;
intersectsOperator.execute(same, poly3857);
```

**Impacto:** medido: para el mismo polígono en 4326 y en 3857, `intersectsOperator` devuelve `false`
sin error. Toda prueba espacial sobre sistemas mezclados sale mal en silencio.

### Pitfall 3: Reetiquetar coordenadas en vez de transformar el datum

```typescript
// ❌ Anti-patrón: coordenadas en Bogotá 1975 (4218) marcadas como WGS84
const p = new Point({ x: -74.0761, y: 4.5981, spatialReference: { wkid: 4326 } });
```

```typescript
// ✅ Correcto
const src = new Point({ x: -74.0761, y: 4.5981, spatialReference: { wkid: 4218 } });
const t = geographicTransformationUtils.getTransformation(src.spatialReference, SpatialReference.WGS84, aoi);
const p = projectOperator.execute(src, SpatialReference.WGS84, { geographicTransformation: t });
```

**Impacto:** medido: 492 m de corrimiento en Bogotá. La cartografía colombiana antigua (y los datos
en NAD27, PSAD56 o SAD69 en otros países) se transforma, no se reetiqueta.

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

- [Projection](https://developers.arcgis.com/javascript/latest/api-reference/)
- [Spatial reference](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-SpatialReference.html)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Medido: `execute` antes de `load()` lanza `p is not a function`;
  `intersectsOperator` con sistemas mezclados devuelve `false` en silencio (el anti-patrón usaba el `geometryEngine`
  deprecado); `execute` aplica solo una transformación de datum por defecto, para Bogotá 1975 hay 27 que difieren
  22 m, y reetiquetar en vez de transformar corre 492 m; `executeMany` devuelve `null` para una geometría en otro
  sistema; `webMercatorUtils` no revisa el datum ni recorta en los polos. El 9377 de Colombia reemplaza al 3116.
  En `tests/runtime/casos/arcgis-coordinates-projection.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
