---
name: arcgis-cim-symbols
description: >
  Construye símbolos avanzados multi-capa con CIMSymbol en el ArcGIS Maps SDK for
  JavaScript 5.0. Cubre la estructura CIM JSON (CIMSymbolReference, símbolos de
  punto/línea/polígono, symbol layers, vector markers) y cuándo CIM supera a los
  símbolos simples. Usa esta skill cuando el usuario necesite íconos en capas,
  patrones de línea complejos, overrides por dato, o símbolos cartográficos precisos.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
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
const symbol = new CIMSymbol({
  data: { type: "CIMSymbolReference", symbol: { type: "CIMPointSymbol", symbolLayers: [] } },
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
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: La jerarquía CIM

`data` es un `CIMSymbolReference` cuyo `symbol` es un `CIMPointSymbol` / `CIMLineSymbol` /
`CIMPolygonSymbol`. Cada uno contiene `symbolLayers` dibujados de abajo hacia arriba.

### Concepto 2: Symbol layers

Las capas incluyen `CIMVectorMarker` (geometría custom), `CIMSolidStroke`/`CIMSolidFill`, y efectos
de dash. Apilarlas crea íconos compuestos y líneas con patrón.

### Concepto 3: Primitive overrides

CIM soporta `primitiveOverrides` que enlazan una propiedad del símbolo a una expresión Arcade o
campo, habilitando detalles de símbolo data-driven más allá de las variables visuales.

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

**Impacto:** el símbolo no parsea porque `data` debe ser un `CIMSymbolReference`.

### Pitfall 2: Olvidar `enable: true` en una capa

```typescript
// ❌ Anti-patrón
symbolLayers: [{ type: "CIMSolidFill", color: [255, 0, 0, 255] }];
```

```typescript
// ✅ Correcto
symbolLayers: [{ type: "CIMSolidFill", enable: true, color: [255, 0, 0, 255] }];
```

**Impacto:** una capa deshabilitada simplemente no se dibuja.

### Pitfall 3: Colores RGBA fuera de rango

```typescript
// ❌ Anti-patrón
color: [255, 0, 0, 1]; // el alpha aquí es 0-255, no 0-1
```

```typescript
// ✅ Correcto
color: [255, 0, 0, 255]; // totalmente opaco
```

**Impacto:** símbolos casi transparentes porque el alpha se interpreta en escala 0–255.

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

- **0.1.0** (2026-05-31): Versión inicial.
