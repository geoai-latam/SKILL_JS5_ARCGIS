---
name: arcgis-imagery
description: >
  Muestra y analiza imágenes ráster con el ArcGIS Maps SDK for JavaScript 5.0:
  ImageryLayer (dinámico, procesado en servidor) e ImageryTileLayer (cacheado),
  raster functions para procesamiento al vuelo (NDVI, hillshade), y mosaic rules.
  Usa esta skill cuando el usuario agregue imágenes satelitales/de elevación,
  aplique una raster function, o controle un mosaic dataset.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
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
const layer = new ImageryLayer({ url: "https://.../ImageServer" });
```

## Árbol de Decisión

1. **¿Imágenes dinámicas, procesadas en servidor (raster functions, mosaic rules)?**
   - Sí → `ImageryLayer`.

2. **¿Tiles cacheados pre-renderizados (rápido, fijo)?**
   - Sí → `ImageryTileLayer`.

3. **¿Procesamiento al vuelo (NDVI, hillshade, stretch)?**
   - Sí → define `rasterFunction` (encadenable).

**Default:** `ImageryLayer` para análisis; `ImageryTileLayer` para display rápido.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
```

### Imports Dinámicos (CDN)

```javascript
const RasterFunction = await $arcgis.import("@arcgis/core/layers/support/RasterFunction.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Agrega la capa de imagery al map del componente.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: ImageryLayer vs ImageryTileLayer

`ImageryLayer` pide imágenes procesadas en servidor y soporta raster functions y mosaic rules.
`ImageryTileLayer` sirve tiles cacheados — más rápido pero con procesamiento fijo.

### Concepto 2: Raster functions

Una `RasterFunction` (`functionName` + `functionArguments`) procesa píxeles al vuelo (ej. NDVI,
Hillshade, Stretch). Encadénalas vía el argumento `Raster` de una función.

### Concepto 3: Mosaic rules

`mosaicRule` controla cómo se seleccionan/ordenan los rásters solapados de un mosaic dataset (por
fecha, atributo, o lock-to-raster) antes de mostrarlos.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Raster functions en una tile layer

```typescript
// ❌ Anti-patrón
new ImageryTileLayer({ url, rasterFunction }); // los tiles son pre-renderizados
```

```typescript
// ✅ Correcto
new ImageryLayer({ url, rasterFunction }); // procesamiento dinámico
```

**Impacto:** la función se ignora porque los tiles son fijos.

### Pitfall 2: Índices de banda incorrectos para NDVI

```typescript
// ❌ Anti-patrón
new RasterFunction({ functionName: "NDVI", functionArguments: {} });
```

```typescript
// ✅ Correcto
new RasterFunction({ functionName: "NDVI", functionArguments: { VisibleBandID: 2, InfraredBandID: 3 } });
```

**Impacto:** salida basura por bandas default/incorrectas.

### Pitfall 3: Imagery dinámica pesada sin expectativas de cache

```typescript
// ❌ Anti-patrón
// Esperar que ImageryLayer sea tan rápido como tiles cacheados
```

```typescript
// ✅ Correcto
// Usa ImageryTileLayer donde un display fijo y rápido es suficiente.
```

**Impacto:** pans/zooms lentos por procesamiento en servidor por petición.

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

- **0.1.0** (2026-05-31): Versión inicial.
