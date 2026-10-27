---
name: arcgis-visualization
description: >
  Simboliza capas con renderers en el ArcGIS Maps SDK for JavaScript 5.0:
  SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer, HeatmapRenderer y
  DotDensityRenderer, más variables visuales (color, size, opacity, rotation). Usa
  esta skill cuando el usuario estilice una capa, aplique un renderer, construya un
  mapa temático, o maneje la simbología desde atributos de los datos.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: visualization
tags:
  - renderer
  - unique-value
  - class-breaks
  - heatmap
  - visual-variables
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Visualización

> **Cuándo usar:** Activa esta skill cuando el usuario estilice una capa, aplique un renderer,
> construya un mapa temático, o maneje color/tamaño desde atributos.

## Resumen

Un renderer decide cómo se dibujan las features de una capa. Elige el renderer por la historia que cuentan tus datos.

- **Problema que resuelve:** convertir features crudas en un mapa temático legible.
- **A quién sirve:** desarrolladores que construyen mapas de categoría, graduados, de densidad o data-driven.
- **Patrón que enseña:** renderer-por-intención, más variables visuales para datos continuos.
- **Qué NO cubre:** auto-generar renderers (ver `arcgis-smart-mapping`) ni símbolos CIM (`arcgis-cim-symbols`).

## Inicio Rápido

```typescript
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
layer.renderer = new UniqueValueRenderer({
  field: "TYPE",
  uniqueValueInfos: [{ value: "park", symbol: new SimpleFillSymbol({ color: "green" }) }],
});
```

## Árbol de Decisión

1. **¿Qué historia cuentan los datos?**
   - Un símbolo para todo → `SimpleRenderer`.
   - Categorías → `UniqueValueRenderer`.
   - Rangos numéricos → `ClassBreaksRenderer`.
   - Densidad de puntos → `HeatmapRenderer`.
   - Conteos/proporciones en áreas → `DotDensityRenderer`.

2. **¿Atributo numérico continuo?**
   - Sí → agrega `visualVariables` (color/size) sobre un SimpleRenderer.

**Default:** `UniqueValueRenderer` para categorías; variables visuales para valores continuos.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";
```

### Imports Dinámicos (CDN)

```javascript
const HeatmapRenderer = await $arcgis.import("@arcgis/core/renderers/HeatmapRenderer.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Construye el renderer con la Core API y luego asígnalo a una capa del map del componente.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Tipos de renderer

`SimpleRenderer` (uniforme), `UniqueValueRenderer` (categorías vía `field` + `uniqueValueInfos`),
`ClassBreaksRenderer` (numérico `classBreakInfos`), `HeatmapRenderer` (densidad), `DotDensityRenderer`.

### Concepto 2: Variables visuales

`visualVariables` mapea un campo a `color`, `size`, `opacity` o `rotation` vía `stops`. Se aplican
sobre un símbolo base para un estilo continuo y suave.

### Concepto 3: Renderer de capa vs símbolo de feature

Define `layer.renderer` para estilo data-driven de toda la capa. Define `Graphic.symbol` solo para
gráficos ad-hoc individuales en un `GraphicsLayer`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Símbolos por gráfico donde corresponde un renderer

```typescript
// ❌ Anti-patrón
features.forEach((f) => (f.symbol = makeSymbol(f.attributes.TYPE)));
```

```typescript
// ✅ Correcto
layer.renderer = new UniqueValueRenderer({ field: "TYPE", uniqueValueInfos });
```

**Impacto:** sin leyenda, actualizaciones lentas y estilo inconsistente.

### Pitfall 2: Class breaks que dejan huecos

```typescript
// ❌ Anti-patrón
classBreakInfos: [{ minValue: 0, maxValue: 100 }, { minValue: 200, maxValue: 300 }];
```

```typescript
// ✅ Correcto
classBreakInfos: [{ minValue: 0, maxValue: 100 }, { minValue: 100, maxValue: 300 }];
```

**Impacto:** las features en el hueco (100–200) dibujan con el símbolo default o desaparecen.

### Pitfall 3: Heatmap sin suficientes puntos

```typescript
// ❌ Anti-patrón
polygonLayer.renderer = new HeatmapRenderer({ ... }); // los heatmaps son para puntos
```

```typescript
// ✅ Correcto
pointLayer.renderer = new HeatmapRenderer({ radius: 18, colorStops });
```

**Impacto:** los heatmaps solo tienen sentido para capas densas de puntos, no polígonos.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de renderer + visualVariable | `references/api-detail.md` |
| Ejemplos de renderer (cada tipo) | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-layers` — la capa que simbolizas
- `arcgis-smart-mapping` — auto-genera renderers desde estadísticas
- `arcgis-cim-symbols` — símbolos avanzados multi-capa

## Samples de Referencia

- [UniqueValueRenderer](https://developers.arcgis.com/javascript/latest/visualization/)
- [Visual variables](https://developers.arcgis.com/javascript/latest/sample-code/visualization-vv-color/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
