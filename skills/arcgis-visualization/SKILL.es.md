---
name: arcgis-visualization
description: >
  Simboliza capas con renderers en el ArcGIS Maps SDK for JavaScript 5.1:
  SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer, HeatmapRenderer y
  DotDensityRenderer, más variables visuales (color, tamaño, opacidad, rotación).
  Cubre lo que en silencio no dibuja nada: valores sin clase y sin defaultSymbol,
  valores únicos que difieren en mayúsculas, un heatmap sobre polígonos y
  graphic.symbol en features de una FeatureLayer (gana el renderer). Usa esta
  skill cuando el usuario estilice una capa, aplique un renderer, arme un mapa
  temático o maneje la simbología con atributos.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Visualización

> **Cuándo usar:** Activa esta skill cuando el usuario estilice una capa, aplique un renderer,
> construya un mapa temático, o maneje color/tamaño desde atributos.

## Resumen

Un renderer decide cómo se dibujan las features de una capa. Elige el renderer según la historia que cuentan los datos.

- **Problema que resuelve:** convertir features crudas en un mapa temático legible.
- **A quién sirve:** desarrolladores que construyen mapas por categorías, graduados, de densidad o guiados por datos.
- **Patrón que enseña:** renderer según la intención, un `defaultSymbol` para todo lo que las clases no cubren y
  variables visuales para datos continuos.
- **Qué NO cubre:** la generación automática de renderers (ver `arcgis-smart-mapping`) ni los símbolos CIM
  (`arcgis-cim-symbols`).

## Inicio Rápido

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";

const states = new FeatureLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2",
  renderer: new UniqueValueRenderer({
    field: "sub_region",
    uniqueValueInfos: [
      { value: "Pacific", symbol: new SimpleFillSymbol({ color: "#2b8cbe" }) },
      { value: "Mtn", symbol: new SimpleFillSymbol({ color: "#a6bddb" }) },
    ],
    defaultSymbol: new SimpleFillSymbol({ color: "#d9d9d9" }), // sin él, los demás estados no se dibujan
  }),
});
```

## Árbol de Decisión

1. **¿Qué historia cuentan los datos?**
   - Un símbolo para todo → `SimpleRenderer`.
   - Categorías → `UniqueValueRenderer`.
   - Rangos numéricos → `ClassBreaksRenderer`.
   - Densidad de puntos → `HeatmapRenderer` (solo puntos).
   - Conteos o proporciones en áreas → `DotDensityRenderer`.

2. **¿Atributo numérico continuo?**
   - Sí → agrega `visualVariables` (color, tamaño) sobre un `SimpleRenderer`.

3. **¿Algún valor puede quedar fuera de las clases o ser nulo?**
   - Sí → pon `defaultSymbol`, o esas features no se dibujan.

**Por defecto:** `UniqueValueRenderer` para categorías, variables visuales para valores continuos, siempre con
`defaultSymbol`.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";
```

### Imports dinámicos (CDN)

```javascript
const HeatmapRenderer = await $arcgis.import("@arcgis/core/renderers/HeatmapRenderer.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Construye el renderer con la Core API y asígnalo a una capa agregada al mapa del componente.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Tipos de renderer

`SimpleRenderer` (uniforme), `UniqueValueRenderer` (categorías con `field` + `uniqueValueInfos`),
`ClassBreaksRenderer` (`classBreakInfos` numéricos), `HeatmapRenderer` (densidad de puntos), `DotDensityRenderer`.

### Concepto 2: Lo que no tiene clase no se dibuja

Medido en 5.1.27 leyendo los píxeles dibujados: un valor en el hueco entre cortes, por encima del último corte o nulo
no se dibujó en absoluto cuando el renderer no tenía `defaultSymbol`; con uno, se dibujó con ese símbolo. En un borde
compartido (`maxValue` 100 y `minValue` 100), el valor 100 fue a la clase de abajo.

### Concepto 3: Variables visuales

`visualVariables` asignan un campo a `color`, `size`, `opacity` o `rotation` mediante `stops`, sobre un símbolo base.
El orden de los stops no importa: medido, los stops al revés dieron los mismos colores que los ordenados.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Poner graphic.symbol en features de una FeatureLayer

```typescript
// ❌ Anti-patrón: se ignora en una FeatureLayer
const { features } = await layer.queryFeatures();
features.forEach((f) => (f.symbol = makeSymbol(f.attributes.TYPE)));
```

```typescript
// ✅ Correcto
layer.renderer = new UniqueValueRenderer({ field: "TYPE", uniqueValueInfos, defaultSymbol });
```

**Impacto:** medido: una FeatureLayer de cliente cuyo gráfico fuente tenía un `symbol` rojo lo dibujó con el azul del
renderer. `graphic.symbol` solo aplica en una `GraphicsLayer` o en `view.graphics`.

### Pitfall 2: Valores que ninguna clase cubre, sin defaultSymbol

```typescript
// ❌ Anti-patrón
new ClassBreaksRenderer({ field: "v", classBreakInfos: [{ minValue: 0, maxValue: 100, symbol }, { minValue: 200, maxValue: 300, symbol }] });
```

```typescript
// ✅ Correcto
new ClassBreaksRenderer({
  field: "v",
  classBreakInfos: [{ minValue: 0, maxValue: 100, symbol }, { minValue: 100, maxValue: 300, symbol }],
  defaultSymbol, // valores por encima de 300, por debajo de 0 o nulos
});
```

**Impacto:** medido: una feature con 150 (en el hueco), 500 (fuera de rango) o nulo no se dibujó, sin aviso.

### Pitfall 3: Un heatmap sobre una capa de polígonos

```typescript
// ❌ Anti-patrón
statesLayer.renderer = new HeatmapRenderer({ radius: 18 });
```

```typescript
// ✅ Correcto
pointLayer.renderer = new HeatmapRenderer({ radius: 18, colorStops });
```

**Impacto:** medido sobre el servicio de estados de USA: la vista de la capa se creó, el renderer siguió en `heatmap`,
no salió ningún error; sobre un polígono de
cliente, el heatmap no dibujó nada.

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

- [Visualization guide](https://developers.arcgis.com/javascript/latest/visualization/)
- [Visual variables](https://developers.arcgis.com/javascript/latest/sample-code/visualization-vv-color/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Pruebas en tiempo de ejecución en `tests/runtime/casos/arcgis-visualization.ts`, que
  leen los píxeles dibujados. Dos pitfalls extendidos eran falsos y se fueron: el `field` del renderer se compara sin
  importar mayúsculas (`"type"` dibujó igual que `"TYPE"`), y los stops de las variables visuales se ordenan solos. Se
  reemplazaron con lo medido: los valores únicos sí distinguen mayúsculas (`"Park"` cayó al símbolo por defecto), los
  valores sin clase o nulos no se dibujan sin `defaultSymbol`, un borde compartido va a la clase de abajo,
  `graphic.symbol` se ignora en una FeatureLayer y un heatmap sobre polígonos no dibuja nada y no da error. Se quitó el
  pitfall del web map (su bloque fallaba con TS2339) y el de escala del heatmap, que no se midió; la URL de relleno del
  snippet ahora es un servicio público.
- **0.1.0** (2026-05-31): Versión inicial.
