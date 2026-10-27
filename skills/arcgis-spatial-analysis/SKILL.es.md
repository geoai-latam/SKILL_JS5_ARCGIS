---
name: arcgis-spatial-analysis
description: >
  Ejecuta análisis espacial en el servidor con el ArcGIS Maps SDK for JavaScript
  5.1: servicios de geoprocesamiento con el módulo geoprocessor (execute para
  tareas síncronas, submitJob para las asíncronas), entradas GP con su tipo
  (FeatureSet, LinearUnit), trabajos que fallan (waitForJobCompletion rechaza con
  el JobInfo) y estadísticas con outStatistics en vez de bajar features con tope.
  Usa esta skill cuando el usuario corra una herramienta GP, un viewshed, un
  hotspot o un enrichment, o calcule estadísticas agregadas sobre features.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Análisis Espacial

> **Cuándo usar:** Activa esta skill cuando el usuario corra una herramienta/job de geoprocessing o
> calcule estadísticas agregadas sobre features.

## Resumen

El análisis pesado corre en un servidor con geoprocesamiento; la agregación corre como queries de estadísticas.

- **Problema que resuelve:** análisis demasiado pesado o propietario para la geometría del cliente.
- **A quién sirve:** desarrolladores que corren modelos GP, enrichment y estadísticas.
- **Patrón que enseña:** `execute` para tareas síncronas, `submitJob` para las asíncronas, entradas con su tipo.
- **Qué NO cubre:** geometría en el cliente (ver `arcgis-geometry-operations`) ni rutas (ver `arcgis-rest-services`).

## Inicio Rápido

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";
import LinearUnit from "@arcgis/core/rest/support/LinearUnit.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";

const VIEWSHED = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed";
const observer = new FeatureSet({ features: [new Graphic({ geometry: new Point({ longitude: -122.42, latitude: 37.77 }) })] });
const { results } = (await geoprocessor.execute(VIEWSHED, {
  Input_Observation_Point: observer,                                   // GPFeatureRecordSetLayer → FeatureSet
  Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }), // GPLinearUnit → LinearUnit
})) as { results: Array<{ paramName: string; value: FeatureSet }> };
const viewshed = results.find((p) => p.paramName === "Viewshed_Result")?.value; // 73 polígonos, medido
```

## Árbol de Decisión

1. **¿Qué dice la página de la tarea en "Execution Type"?**
   - `esriExecutionTypeSynchronous` → `geoprocessor.execute(url, params)`.
   - `esriExecutionTypeAsynchronous` → `geoprocessor.submitJob(url, params)` + `waitForJobCompletion()` +
     `fetchResultData(name)`.

2. **¿El `dataType` de cada entrada en esa misma página?**
   - `GPFeatureRecordSetLayer` → `FeatureSet`; `GPLinearUnit` → `LinearUnit`; `GPString`/`GPDouble` → valores
     planos.

3. **¿Solo agregados sobre features?**
   - Sí → una query de estadísticas (`outStatistics`), ni una tarea GP ni un bucle en el cliente.

**Por defecto:** lee primero la página REST de la tarea (`<url de la tarea>?f=json`): tipo de ejecución, nombres y
tipos de los parámetros.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
```

### Imports dinámicos (CDN)

```javascript
const geoprocessor = await $arcgis.import("@arcgis/core/rest/geoprocessor.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Alimenta las entradas desde la vista del componente (sketch/query); pinta las salidas como capas o graphics.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: execute vs submitJob

Lo decide el servicio. Medido con 5.1.27: `execute` sobre una tarea asíncrona falló con
`Error performing execute operation`. Un trabajo asíncrono pasó de `job-executing` a `job-succeeded`, y
`fetchResultData("Hotspot_Raster")` devolvió un parámetro `raster-data-layer`.

### Concepto 2: el servicio define el tipo de cada parámetro

Las entradas van con los nombres de parámetro de la tarea y tienen que respetar su `dataType`. Medido: el servidor
aceptó los nombres sin distinguir mayúsculas (`input_observation_point` funcionó), pero un nombre mal escrito, un
número suelto para un `GPLinearUnit` o un solo `Graphic` para un `GPFeatureRecordSetLayer` fallaron con el mismo
`Unable to complete operation.`, que no nombra ni el parámetro ni el problema. Un `FeatureSet` y su `toJSON()`
funcionaron los dos.

### Concepto 3: resultados

`execute` resuelve con `{ results, messages }`; cada resultado es un valor de parámetro con `paramName`, `dataType` y
`value` (un `FeatureSet` de verdad para salidas de features, medido). Busca las salidas por `paramName`, no por
posición.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Agregar features en el cliente

```typescript
// ❌ Anti-patrón
const { features } = await layer.queryFeatures({ where: "1=1", outFields: ["POP"] });
const total = features.reduce((s, f) => s + f.attributes.POP, 0);
```

```typescript
// ✅ Correcto
const q = layer.createQuery();
q.outStatistics = [{ statisticType: "sum", onStatisticField: "POP", outStatisticFieldName: "total" }];
const total = (await layer.queryFeatures(q)).features[0].attributes.total;
```

**Impacto:** medido con las ciudades de EE. UU.: el bucle en el cliente sumó **54.124.707** con las primeras 1000
filas (`exceededTransferLimit: true`); la query de estadísticas devolvió el valor real, **165.628.942**. Es un número
equivocado, no solo lento.

### Pitfall 2: Valores planos para entradas GP con tipo

```typescript
// ❌ Anti-patrón
geoprocessor.execute(VIEWSHED, { Input_Observation_Point: graphic, Viewshed_Distance: 5000 });
```

```typescript
// ✅ Correcto
geoprocessor.execute(VIEWSHED, {
  Input_Observation_Point: new FeatureSet({ features: [graphic] }),
  Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }),
});
```

**Impacto:** medido: cada uno de esos dos valores planos hizo fallar la tarea con `Unable to complete operation.`.
Revisa el `dataType` de cada parámetro en la página de la tarea.

### Pitfall 3: Tratar un trabajo fallido como uno resuelto

```typescript
// ❌ Anti-patrón
const done = await job.waitForJobCompletion();
if (done.jobStatus !== "job-succeeded") showError(done.jobStatus); // nunca corre si falla
```

```typescript
// ✅ Correcto
try {
  await job.waitForJobCompletion();
} catch (failed) {
  const info = failed as JobInfo; // rechaza con el JobInfo, no con un Error
  showError(info.jobStatus, info.messages.at(-1)?.description);
}
```

**Impacto:** medido: un trabajo con una entrada inválida rechazó con un `JobInfo` (`jobStatus` `job-failed`, último
mensaje `Failed.`). `e.message` es `undefined`, así que un manejador de errores genérico no muestra nada útil.

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

- **0.2.0** (2026-10-27): SDK 5.1. Medido contra servicios GP públicos en
  `tests/runtime/casos/arcgis-spatial-analysis.ts`. El ejemplo y el snippet de antes pasaban
  `Viewshed_Distance: 5000`, que falla (`GPLinearUnit` necesita un `LinearUnit`). El pitfall de trabajos fallidos
  revisaba `jobStatus` después de `waitForJobCompletion()`, pero un trabajo fallido rechaza con el JobInfo. La suma en
  el cliente no solo es lenta sino equivocada (54 M de 165 M, por el tope de 1000 filas). Los nombres de parámetro no
  distinguían mayúsculas en el servidor; lo que falla, con un mensaje opaco, es la ortografía y el tipo. Se cambió el
  pitfall de autenticación que era solo un comentario.
- **0.1.0** (2026-05-31): Versión inicial.
