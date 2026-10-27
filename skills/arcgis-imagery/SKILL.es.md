---
name: arcgis-imagery
description: >
  Muestra y analiza imágenes ráster con el ArcGIS Maps SDK for JavaScript 5.1:
  ImageryLayer (procesada en el servidor) e ImageryTileLayer (teselas y COGs
  procesados en el cliente), funciones ráster con rasterFunctionUtils (NDVI y otros
  índices con bandas desde 0), reglas de mosaico y queryRasters. Usa esta skill
  cuando el usuario agregue imágenes satelitales/de elevación, calcule un índice,
  aplique una función ráster o controle un mosaic dataset.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: specialized
tags:
  - imagery
  - raster-function
  - mosaic-rule
  - ndvi
  - imagerylayer
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Imágenes

> **Cuándo usar:** Activa esta skill cuando el usuario agregue imágenes ráster, aplique una raster
> function (NDVI, hillshade), o controle un mosaic dataset.

## Resumen

Las capas de imagery transmiten datos ráster; las raster functions los procesan al vuelo sin alterar la fuente.

- **Problema que resuelve:** mostrar y analizar imágenes satelitales/de elevación.
- **A quién sirve:** desarrolladores que construyen apps de teledetección y análisis.
- **Patrón que enseña:** ImageryLayer vs ImageryTileLayer; raster functions encadenables; mosaic rules.
- **Qué NO cubre:** capas vectoriales (ver `arcgis-layers`) ni mallas 3D (ver `arcgis-3d-layers`).

## Inicio Rápido

```typescript
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
import * as rasterFunctionUtils from "@arcgis/core/layers/support/rasterFunctionUtils.js";

const layer = new ImageryLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Toronto/ImageServer", // Azul, Verde, Rojo, NIR
  rasterFunction: rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 }), // desde 0
});
```

Medido con 5.1.27: `identify` devuelve `0.0148` sobre Queen's Park y `-0.263` sobre el puerto, lo
mismo que `(NIR − R) / (NIR + R)` calculado a mano con los píxeles crudos.

## Árbol de Decisión

1. **¿Un ImageServer de ArcGIS (dinámico, mosaic datasets)?**
   - Sí → `ImageryLayer`; el proceso corre en el servidor (`rasterFunction`, `mosaicRule`).

2. **¿Un servicio de imágenes en teselas o un ráster en la nube (COG / CRF)?**
   - Sí → `ImageryTileLayer`; también recibe `rasterFunction`, procesada **en el cliente**.

3. **¿Un índice (NDVI, NDWI, NBR, SAVI, EVI...)?**
   - `rasterFunctionUtils.bandArithmeticNDVI(...)` y compañía: valores reales, bandas desde 0.

**Default:** `rasterFunction` + `rasterFunctionUtils`; `renderingRule` es el nombre de 4.x.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
import * as rasterFunctionUtils from "@arcgis/core/layers/support/rasterFunctionUtils.js";
```

### Imports Dinámicos (CDN)

```javascript
const rasterFunctionUtils = await $arcgis.import("@arcgis/core/layers/support/rasterFunctionUtils.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Agrega la capa de imágenes al mapa del componente.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: ImageryLayer vs ImageryTileLayer

`ImageryLayer` le pide cada imagen a un ImageServer; el servidor aplica la función ráster y la regla
de mosaico. `ImageryTileLayer` lee teselas (o un COG/CRF) y las pinta y procesa en el navegador:
también acepta `rasterFunction` (medido: la conserva), así que "las teselas vienen pre-renderizadas y
la función ráster se ignora" es falso.

### Concepto 2: Funciones ráster e índices de banda

`rasterFunctionUtils` (desde 4.28) arma el `RasterFunction` por ti: aritmética de bandas
(`bandArithmeticNDVI`, `NDWI`, `NBR`, `SAVI`, `EVI`, `custom`), estiramientos, `colormap`,
`threshold`. Los ids de banda son índices **desde 0** sobre las bandas del servicio: para Azul,
Verde, Rojo, NIR el rojo es 2 y el NIR 3; para Landsat 8 (Costera, Azul, Verde, Rojo, NIR, ...) el
rojo es 3 y el NIR 4. Lee el orden en `layer.serviceRasterInfo` antes de escribir los ids. Encadena
funciones pasando una como `raster` de la siguiente.

### Concepto 3: Reglas de mosaico y consultas al catálogo

`mosaicRule` ordena los rásteres que se solapan en un mosaic dataset (por atributo, fecha, bloqueo a
un ráster). Para listar las escenas, `layer.queryRasters({ geometry, outFields })` devuelve un
`FeatureSet` de ítems del catálogo; los valores de píxel salen de `identify`, `getSamples` o
`fetchPixels`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Leer la función NDVI del servidor como -1..1

```typescript
// ❌ Anti-patrón
const rf = new RasterFunction({ functionName: "NDVI", functionArguments: { VisibleBandID: 2, InfraredBandID: 3 } });
// identify → 101: "NDVI > 0.3 es vegetación" nunca se cumple
```

```typescript
// ✅ Correcto
const rf = rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 }); // identify → 0.0148
```

**Impacto:** medido en el mismo píxel: la función ráster clásica `"NDVI"` devuelve **101** (y 74 sobre
el agua), la salida entera escalada de 0 a 200 (`100 × (1 + NDVI)`); `bandArithmeticNDVI` devuelve
0,0148 y -0,263. Los umbrales escritos para NDVI real no seleccionan nada o seleccionan todo, sin
avisar.

### Pitfall 2: Contar las bandas desde 1

```typescript
// ❌ Anti-patrón
rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 4, nirBandId: 5 }); // números de banda de Landsat 8
```

```typescript
// ✅ Correcto
rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 3, nirBandId: 4 }); // Landsat 8, desde 0
```

**Impacto:** con los números de banda del sensor calculas el índice sobre las bandas equivocadas.
Medido en el servicio Toronto de 4 bandas: verde en vez de rojo da 85 en vez de 101 (sin error). Un
id fuera de rango, o ningún argumento, dio el resultado por defecto, así que un id equivocado tampoco
siempre se nota.

### Pitfall 3: renderingRule de 4.x

```typescript
// ❌ Anti-patrón
new ImageryLayer({ url, renderingRule: { functionName: "NDVI" } });
```

```typescript
// ✅ Correcto
new ImageryLayer({ url, rasterFunction: rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 }) });
```

**Impacto:** `renderingRule` no está en los tipos de 5.1 (TypeScript falla). Medido sin tipos: no llena
`rasterFunction` (queda `null`).

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de ImageryLayer / RasterFunction | `references/api-detail.md` |
| Ejemplos de NDVI / hillshade / mosaic | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-layers` — capas de datos vectoriales
- `arcgis-visualization` — renderers para simbología ráster
- `arcgis-3d-layers` — elevación/malla en 3D

## Samples de Referencia

- [ImageryLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-imagerylayer/)
- [Raster function](https://developers.arcgis.com/javascript/latest/sample-code/layers-imagery-rasterfunction/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Medido con identify sobre un servicio público de 4 bandas: la función ráster
  clásica `"NDVI"` devuelve un valor escalado de 0 a 200 (101), no -1..1; `rasterFunctionUtils.bandArithmeticNDVI`
  devuelve el NDVI real y ahora es el default. Los ids de banda van desde 0 (Landsat 8 rojo/NIR = 3/4). El pitfall 1
  era falso: `ImageryTileLayer` acepta funciones ráster (en el cliente). `renderingRule` ya no está en los tipos de
  5.1. Se agregó `queryRasters`. En `tests/runtime/casos/arcgis-imagery.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
