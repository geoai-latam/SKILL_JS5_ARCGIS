---
name: arcgis-spatial-analysis
description: >
  Ejecuta análisis espacial del lado servidor con el ArcGIS Maps SDK for
  JavaScript 5.0: servicios de geoprocessing vía el módulo geoprocessor (execute y
  submitJob para jobs asíncronos), más estadísticas de resumen desde queries de
  FeatureLayer. Usa esta skill cuando el usuario corra una herramienta GP, un
  viewshed/hotspot/enrichment, o calcule estadísticas agregadas sobre features.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: spatial
tags:
  - geoprocessing
  - geoprocessor
  - statistics
  - analysis
  - jobs
requires:
  - arcgis-rest-services
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Análisis Espacial

> **Cuándo usar:** Activa esta skill cuando el usuario corra una herramienta/job de geoprocessing o
> calcule estadísticas agregadas sobre features.

## Resumen

El análisis pesado corre en servidor vía geoprocessing; la agregación ligera corre como queries de estadística.

- **Problema que resuelve:** análisis muy pesado o propietario para geometría del lado cliente.
- **A quién sirve:** desarrolladores que corren modelos GP, enrichment y estadísticas.
- **Patrón que enseña:** `execute` para herramientas rápidas, `submitJob` para jobs largos asíncronos.
- **Qué NO cubre:** geometría cliente (ver `arcgis-geometry-operations`) ni routing (ver `arcgis-rest-services`).

## Inicio Rápido

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
const result = await geoprocessor.execute(gpUrl, { Input: value });
```

## Árbol de Decisión

1. **¿La herramienta GP es síncrona (rápida)?**
   - Sí → `geoprocessor.execute(url, params)`.

2. **¿Es una tarea de larga duración?**
   - Sí → `geoprocessor.submitJob(url, params)` y luego poll/`waitForJobCompletion`.

3. **¿Solo agregados sobre features?**
   - Sí → una query de estadísticas (`outStatistics`) en el FeatureLayer.

**Default:** `execute` para herramientas rápidas; `submitJob` para lo que tome segundos o más.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
```

### Imports Dinámicos (CDN)

```javascript
const geoprocessor = await $arcgis.import("@arcgis/core/rest/geoprocessor.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Alimenta inputs desde la view del componente (sketch/query); renderiza outputs como capas.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: execute vs submitJob

`execute` retorna resultados directamente (servicios GP síncronos). `submitJob` retorna un job que
consultas (servicios asíncronos); trae los outputs cuando completa.

### Concepto 2: Nombres de parámetros

Los inputs GP se indexan por los nombres exactos de parámetro de la herramienta (case-sensitive), ej.
`Input_Observation_Point`. Lee la página del servicio para acertarlos.

### Concepto 3: Queries de estadísticas

Para conteos/sumas/promedios, define `query.outStatistics` (StatisticDefinition[]) y opcionalmente
`groupByFieldsForStatistics` — mucho más barato que descargar features.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Usar execute en un servicio asíncrono

```typescript
// ❌ Anti-patrón
const r = await geoprocessor.execute(asyncGpUrl, params); // timeout / error
```

```typescript
// ✅ Correcto
const job = await geoprocessor.submitJob(asyncGpUrl, params);
const result = await job.waitForJobCompletion();
```

**Impacto:** la llamada falla porque el servicio solo soporta jobs.

### Pitfall 2: Nombres de parámetro incorrectos

```typescript
// ❌ Anti-patrón
geoprocessor.execute(url, { input: 5 }); // la herramienta espera "Input_Field"
```

```typescript
// ✅ Correcto
geoprocessor.execute(url, { Input_Field: 5 });
```

**Impacto:** la herramienta ignora el input o falla.

### Pitfall 3: Descargar features solo para contarlas

```typescript
// ❌ Anti-patrón
const { features } = await layer.queryFeatures();
const total = features.reduce((s, f) => s + f.attributes.POP, 0);
```

```typescript
// ✅ Correcto
const q = layer.createQuery();
q.outStatistics = [{ statisticType: "sum", onStatisticField: "POP", outStatisticFieldName: "total" }];
const { features } = await layer.queryFeatures(q);
```

**Impacto:** descargas enormes cuando una sola query de estadísticas bastaría.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de geoprocessor / estadísticas | `references/api-detail.md` |
| Ejemplos de GP + estadísticas | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-rest-services` — otras tareas REST (route, locator)
- `arcgis-geometry-operations` — geometría del lado cliente
- `arcgis-layers` — las capas que analizas

## Samples de Referencia

- [Geoprocessing](https://developers.arcgis.com/javascript/latest/sample-code/)
- [Query statistics](https://developers.arcgis.com/javascript/latest/api-reference/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
