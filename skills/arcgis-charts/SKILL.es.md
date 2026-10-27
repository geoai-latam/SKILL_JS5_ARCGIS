---
name: arcgis-charts
description: >
  Agrega charts de datos a una app de mapas con los charts components del ArcGIS
  Maps SDK for JavaScript 5.0: el elemento arcgis-chart enlazado a un FeatureLayer
  con una config de chart (bar, line, scatter, histogram, pie), incluyendo series
  de tiempo e interactividad mapa-chart. Usa esta skill cuando el usuario visualice
  atributos de features como un chart o enlace un chart con el mapa.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/charts-components@^5.0"
  - "@arcgis/core@^5.0"
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
- **Patrón que enseña:** enlaza `arcgis-chart` a una capa + config; sincroniza selección con el mapa.
- **Qué NO cubre:** simbología del mapa (ver `arcgis-visualization`) ni las capas en sí (`arcgis-layers`).

## Inicio Rápido

```typescript
import "@arcgis/charts-components/components/arcgis-chart";
// <arcgis-chart></arcgis-chart> — define .layer y .config en código
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

```javascript
// La CDN unificada 5.0 incluye charts-components; referencia el custom element.
const script = "https://js.arcgis.com/5.0/";
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Config de chart

`arcgis-chart` renderiza desde una config de chart (tipo, campos, agregación). Las configs pueden
venir de un chart guardado en la capa o construirse en código.

### Concepto 2: Enlazar a una capa

Define el `layer` del chart (un FeatureLayer) para que lea atributos. El chart consulta la capa por
los valores que grafica.

### Concepto 3: Interactividad mapa-chart

La selección puede sincronizarse en ambos sentidos: seleccionar una barra resalta features, y
seleccionar features filtra el chart — cablea los eventos para mantenerlos en sincronía.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Chart sin layer/config

```typescript
// ❌ Anti-patrón
// <arcgis-chart></arcgis-chart> sin layer ni config
```

```typescript
// ✅ Correcto
chartEl.layer = featureLayer;
chartEl.config = chartConfig;
```

**Impacto:** el chart renderiza vacío.

### Pitfall 2: Graficar datasets enormes sin agregar

```typescript
// ❌ Anti-patrón
// Graficar cientos de miles de filas crudas
```

```typescript
// ✅ Correcto
// Agrega (group/bin) en la config del chart.
```

**Impacto:** charts lentos y visuales ilegibles.

### Pitfall 3: Tipo de campo incorrecto para el chart

```typescript
// ❌ Anti-patrón
// Una "serie de tiempo" line sobre un campo string
```

```typescript
// ✅ Correcto
// Usa un campo de fecha para series de tiempo, numérico para ejes de valor.
```

**Impacto:** charts rotos o sin sentido.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de arcgis-chart / config | `references/api-detail.md` |
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

- **0.1.0** (2026-05-31): Versión inicial.
