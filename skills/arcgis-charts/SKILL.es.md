---
name: arcgis-charts
description: >
  Agrega charts de datos a una app de mapas con los charts components del ArcGIS
  Maps SDK for JavaScript 5.1: el elemento arcgis-chart manejado por un modelo de
  createModel() (bar, line, pie, scatterplot, histogram, box plot, gauge, heat),
  enlazado a un FeatureLayer o a imágenes, series de tiempo y selección sincronizada
  con el mapa. Usa esta skill cuando el usuario visualice
  atributos de features como un chart o enlace un chart con el mapa.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: new-in-5.0
tags:
  - charts
  - chart
  - visualization
  - time-series
  - components
requires:
  - arcgis-layers
packages:
  - "@arcgis/charts-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Charts

> **Cuándo usar:** Activa esta skill cuando el usuario visualice atributos de features como un chart
> (bar/line/scatter/histogram/pie) o enlace un chart con el mapa.

## Resumen

Los charts components renderizan los atributos de una capa como charts interactivos, opcionalmente enlazados al mapa.

- **Problema que resuelve:** convertir datos de atributos en charts legibles e interactivos.
- **A quién sirve:** desarrolladores que construyen dashboards y vistas analíticas.
- **Patrón que enseña:** enlaza `arcgis-chart` a una capa + un modelo de `createModel()`;
  sincroniza la selección con el mapa.
- **Qué NO cubre:** simbología del mapa (ver `arcgis-visualization`) ni las capas en sí (`arcgis-layers`).

## Inicio Rápido

```typescript
import "@arcgis/charts-components/components/arcgis-chart";
import { createModel } from "@arcgis/charts-components/model/shared/setup-utils"; // no ".js"

const model = await createModel({ layer, chartType: "barChart" });
model.xAxisField = "sub_region";
model.aggregationType = "count";

const chart = document.querySelector("arcgis-chart")!;
chart.layer = layer;
chart.model = model;
```

## Árbol de Decisión

1. **¿Qué chart?**
   - Categorías → bar/pie; tendencia → line; correlación → scatter; distribución → histogram.

2. **¿Serie de tiempo?**
   - Sí → line chart sobre un campo de fecha.

3. **¿Enlazar al mapa?**
   - Sí → sincroniza la selección del chart con la selección de features.

**Default:** bar chart enlazado a un FeatureLayer; line chart para series de tiempo.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/charts-components/components/arcgis-chart";
```

### Imports Dinámicos (CDN)

```html
<!-- Core + el paquete de charts desde la CDN, misma versión que el resto del SDK -->
<script src="https://js.arcgis.com/5.1/"></script>
<script type="module" src="https://js.arcgis.com/5.1/charts-components/"></script>
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: El chart lo maneja un modelo, no un objeto `config`

`arcgis-chart` **no tiene propiedad `config` pública** (los tipos no la traen; en ejecución existe
una interna y asignarla no dibuja nada). Un chart es un `model` (o un `WebChart` guardado en
la capa) más un `layer`. El modelo se arma con `createModel()`:

- `createModel({ layer, chartType })` — `chartType` es uno de `"barChart"`, `"lineChart"`,
  `"comboBarLineChart"`, `"pieChart"`, `"scatterplot"`, `"histogram"`, `"boxPlot"`, `"gauge"`,
  `"radarChart"`, `"heatChart"`.
- Después se definen los campos del modelo: `xAxisField`, `numericFields`, `aggregationType`
  (`"count"`, `"sum"`, `"avg"`, …), `splitByField`, `binTemporalData`…
- En 5.1 se importa de `@arcgis/charts-components/model/shared/setup-utils` **sin `.js`**: el mapa
  de exports del paquete no tiene la entrada con `.js`, así que la ruta que imprimen las notas de
  versión falla en Vite ("Missing specifier"). Importarlo desde el índice del paquete está
  deprecado (se quita en 6.0).

### Concepto 2: Enlazar a una capa

Define `chart.layer` (un `FeatureLayer`, un `FeatureLayerView`, o desde 5.1 un `ImageryLayer`,
`ImageryTileLayer` o `WCSLayer` para histogramas y diagramas de dispersión). El chart consulta la
capa por los valores que grafica. Una capa con charts guardados se muestra con
`chart.layer = layer` y `chart.chartIndex = 0`.

### Concepto 3: Interactividad mapa-chart

Dale la vista al chart (`chart.view = view`) y activa `syncViewSelection` (5.1; reemplaza a
`syncSelectionsBetweenChartAndLayerViewPolicy`) para mantener sincronizada la selección del chart y
la del mapa. El evento `arcgisSelectionComplete` trae `{ selectionData, model }`.

### Concepto 4: Fijar versión: Calcite 5.2 rompe los charts 5.1

Medido el 2026-10-27: con `@esri/calcite-components` 5.2.0 (lo que hoy resuelve `^5.1.1`),
`arcgis-chart` 5.1.27 nunca dibuja — amCharts lanza "Unknown color syntax: light-dark(...)" y
`arcgisDataProcessComplete` nunca se dispara. Con Calcite 5.1.2 dibuja. Fija `"~5.1.2"` hasta que
el paquete de charts se actualice.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Inventar un objeto `config` para el chart

```typescript
// ❌ Anti-patrón
chartEl.layer = featureLayer;
chartEl.config = { type: "bar", category: { field: "TYPE" }, aggregation: "count" };
```

```typescript
// ✅ Correcto
const model = await createModel({ layer: featureLayer, chartType: "barChart" });
model.xAxisField = "TYPE";
model.aggregationType = "count";
chartEl.layer = featureLayer;
chartEl.model = model;
```

**Impacto:** medido con 5.1.27: el `config` inventado se ignora, no se crea ningún modelo y
`arcgisDataProcessComplete` nunca se dispara — un chart vacío sin error. Solo "compila" si se hace
cast del elemento a un tipo laxo.

### Pitfall 2: Graficar datasets enormes sin agregar

```typescript
// ❌ Anti-patrón
// Graficar cientos de miles de filas crudas
```

```typescript
// ✅ Correcto
model.aggregationType = "count"; // agrupa por xAxisField; los histogramas agrupan en bins
```

**Impacto:** charts lentos y visuales ilegibles.

### Pitfall 3: Dejar que Calcite suba a 5.2

```json
// ❌ Anti-patrón (package.json)
"@esri/calcite-components": "^5.1.1"
```

```json
// ✅ Correcto (hasta que se actualice charts-components)
"@esri/calcite-components": "~5.1.2"
```

**Impacto:** medido el 2026-10-27: `^5.1.1` instala Calcite 5.2.0, y con ella `arcgis-chart`
5.1.27 nunca dibuja (amCharts: "Unknown color syntax: light-dark(...)"). Ni chart ni un error útil
en la interfaz. Con 5.1.2 el mismo código dibuja.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de arcgis-chart / modelo | `references/api-detail.md` |
| Ejemplos de bar / line / map-link | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-layers` — los datos detrás del chart
- `arcgis-interaction` — selección para enlazar con el mapa
- `arcgis-visualization` — simboliza los mismos datos en el mapa

## Samples de Referencia

- [Charts components](https://developers.arcgis.com/javascript/latest/references/charts-components/)
- [Chart + map](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Reescrita sobre la API real: `arcgis-chart` no tiene `config`; los charts
  son `createModel()` + `model` (medido: el código anterior no dibujaba nada). `createModel` se importa sin
  `.js`; Calcite 5.2 rompe los charts 5.1 (medido, fijar `~5.1.2`); `syncViewSelection` y los renombres de 5.1;
  URL real de la CDN. En `tests/runtime/casos/arcgis-charts.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
