---
name: arcgis-cim-symbols
description: >
  Construye símbolos avanzados multi-capa con CIMSymbol en el ArcGIS Maps SDK for
  JavaScript 5.1. Cubre la estructura CIM JSON (CIMSymbolReference, símbolos de
  punto/línea/polígono, symbol layers, vector markers) y cuándo CIM supera a los
  símbolos simples. Usa esta skill cuando el usuario necesite íconos en capas,
  patrones de línea complejos, overrides por dato, o símbolos cartográficos precisos.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: visualization
tags:
  - cim
  - symbols
  - cartography
  - vector-marker
  - multi-layer
requires:
  - arcgis-visualization
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Símbolos CIM

> **Cuándo usar:** Activa esta skill cuando los símbolos simples no alcanzan — íconos en capas,
> patrones de línea complejos, o simbología cartográfica precisa.

## Resumen

Un `CIMSymbol` envuelve el JSON del Cartographic Information Model de Esri, dejándote apilar capas de símbolo.

- **Problema que resuelve:** simbología que los símbolos simples de marker/line/fill no pueden expresar.
- **A quién sirve:** cartógrafos y desarrolladores que necesitan símbolos en capas o con patrones.
- **Patrón que enseña:** la jerarquía CIMSymbolReference → symbol → symbolLayers.
- **Qué NO cubre:** renderers básicos (ver `arcgis-visualization`) ni simbología automática (`arcgis-smart-mapping`).

## Inicio Rápido

```typescript
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";

// Un cuadrado rojo de 16×16 dibujado a 20 pt (≈27 px). Un symbolLayers vacío no dibuja nada.
const symbol = new CIMSymbol({
  data: {
    type: "CIMSymbolReference",
    symbol: {
      type: "CIMPointSymbol",
      symbolLayers: [{
        type: "CIMVectorMarker",
        enable: true,
        size: 20,
        frame: { xmin: 0, ymin: 0, xmax: 16, ymax: 16 },
        markerGraphics: [{
          type: "CIMMarkerGraphic",
          geometry: { rings: [[[0, 0], [16, 0], [16, 16], [0, 16], [0, 0]]] },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [{ type: "CIMSolidFill", enable: true, color: [255, 0, 0, 255] }],
          },
        }],
      }],
    },
  },
});
```

## Árbol de Decisión

1. **¿Un SimpleMarker/Line/Fill lo expresa?**
   - Sí → usa el símbolo simple (más barato y simple).
   - No → continúa.

2. **¿Necesitas capas apiladas, vector markers, o dashes/patrones?**
   - Sí → `CIMSymbol` con múltiples `symbolLayers`.

3. **¿El símbolo debe reaccionar a primitivas de datos?**
   - Sí → usa CIM primitive overrides.

**Default:** símbolos simples primero; usa CIM solo cuando se requiere apilar capas.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";
```

### Imports Dinámicos (CDN)

```javascript
const CIMSymbol = await $arcgis.import("@arcgis/core/symbols/CIMSymbol.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Usa el CIMSymbol en un renderer asignado a una capa del map del componente.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: La jerarquía CIM

`data` es un `CIMSymbolReference` cuyo `symbol` es un `CIMPointSymbol` / `CIMLineSymbol` /
`CIMPolygonSymbol`. Cada uno contiene `symbolLayers`; la **primera** capa del arreglo se dibuja
**encima** (orden CIM, como en la lista de capas de ArcGIS Pro).

### Concepto 2: Vector markers: `size` en puntos, geometría en unidades del `frame`

Un `CIMVectorMarker` lleva su `frame` a `size`, y `size` está en **puntos**: medido con 5.1.27,
`size: 20` pinta 27 px y `size: 40` pinta 54 px (1 pt = 1,33 px). La geometría de cada
`markerGraphic` va en unidades del frame, y el frame no recorta: un anillo que llega a 100 en un
frame 0..16 pinta un marcador de 120 px en vez de 27 px.

### Concepto 3: Primitive overrides

Ponle `primitiveName` a una capa del símbolo y agrega `primitiveOverrides` al
`CIMSymbolReference`: cada uno define una `propertyName` de esa primitiva desde una
`valueExpressionInfo` de Arcade. `propertyName` va en **Proper case** (`"Size"`, `"Color"`,
`"TextString"`); un `"size"` en minúscula se ignora sin aviso (medido: los dos features quedan en el
tamaño base).

### Concepto 4: Utilidades en vez de editar el JSON a mano

`cimSymbolUtils` lee y cambia un símbolo ya armado: `getCIMSymbolSize`/`scaleCIMSymbolTo`,
`getCIMSymbolColor`/`applyCIMSymbolColor`, `getCIMSymbolRotation`/`applyCIMSymbolRotation`.
`symbolUtils.renderPreviewHTML(symbol)` dibuja una vista previa, la forma más rápida de saber si un
JSON CIM pinta algo. Nuevo en 5.1 (beta): `CIMSymbolAnimationMoveAlongLine` (un marcador que
avanza por una línea) y `CIMMarkerPlacementAtMeasuredUnits`. Las animaciones no corren en un
SceneView ni en la leyenda.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Tipo de nivel superior incorrecto

```typescript
// ❌ Anti-patrón
new CIMSymbol({ data: { type: "CIMPointSymbol", symbolLayers: [] } as any });
```

```typescript
// ✅ Correcto
new CIMSymbol({ data: { type: "CIMSymbolReference", symbol: { type: "CIMPointSymbol", symbolLayers: [] } } });
```

**Impacto:** medido con 5.1.27: no da error al construirlo; la vista previa lanza "Cannot read
properties of null" y no se dibuja nada. TypeScript lo atrapa solo si no está el `as any`.

### Pitfall 2: Alfa en escala 0–1

```typescript
// ❌ Anti-patrón
color: [255, 0, 0, 1]; // el alfa aquí es 0-255, no 0-1
```

```typescript
// ✅ Correcto
color: [255, 0, 0, 255]; // totalmente opaco
```

**Impacto:** medido: alfa `1` pinta con un alfa de 1/255, un símbolo invisible. Los colores CIM no
son objetos `Color`, donde el alfa sí va de 0 a 1.

### Pitfall 3: `propertyName` en minúscula en un override

```typescript
// ❌ Anti-patrón
primitiveOverrides: [{ type: "CIMPrimitiveOverride", primitiveName: "m", propertyName: "size",
  valueExpressionInfo: { type: "CIMExpressionInfo", title: "s", expression: "$feature.s", returnType: "Default" } }];
```

```typescript
// ✅ Correcto
primitiveOverrides: [{ type: "CIMPrimitiveOverride", primitiveName: "m", propertyName: "Size",
  valueExpressionInfo: { type: "CIMExpressionInfo", title: "s", expression: "$feature.s", returnType: "Default" } }];
```

**Impacto:** medido en un MapView: con `"Size"` los features con s=8 y s=40 pintan 132 y 2970 px;
con `"size"` los dos quedan en el tamaño base (210 y 196 px), sin aviso.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Referencia de estructura CIM | `references/api-detail.md` |
| Ejemplos completos de símbolos CIM | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-visualization` — renderers que usan el símbolo
- `arcgis-arcade` — expresiones para primitive overrides
- `arcgis-layers` — la capa que se simboliza

## Samples de Referencia

- [CIMSymbol](https://developers.arcgis.com/javascript/latest/sample-code/sandbox/?sample=cim-symbols)
- [CIM primitive overrides](https://developers.arcgis.com/javascript/latest/visualization/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. El Inicio Rápido no dibujaba nada (`symbolLayers` vacío); el pitfall
  "si olvidas `enable: true` no se dibuja" era falso (medido: sin `enable` dibuja, solo `false` lo oculta); la
  geometría fuera del frame no se recorta, agranda el marcador; `size` va en puntos; la primera capa queda encima;
  primitive overrides con un ejemplo real y la trampa de `propertyName` en Proper case; `cimSymbolUtils`; la
  animación y la colocación de 5.1. En `tests/runtime/casos/arcgis-cim-symbols.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
