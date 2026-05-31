---
name: arcgis-arcade
description: >
  Escribe y ejecuta expresiones Arcade con el ArcGIS Maps SDK for JavaScript 5.0:
  createArcadeExecutor con el profile correcto para popups, labels y renderers, más
  sintaxis de expresiones y tips de rendimiento. Usa esta skill cuando el usuario
  escriba una expresión Arcade para un popup, label o renderer, o calcule un valor
  desde atributos/geometría de features.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: specialized
tags:
  - arcade
  - expressions
  - labels
  - popups
  - renderer
requires:
  - arcgis-visualization
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Arcade

> **Cuándo usar:** Activa esta skill cuando el usuario escriba una expresión Arcade para popups,
> labels o renderers, o calcule valores desde atributos/geometría.

## Resumen

Arcade es el lenguaje de expresiones de Esri; el SDK compila un script en un executor con alcance a un profile.

- **Problema que resuelve:** texto y valores dinámicos data-driven sin round-trips.
- **A quién sirve:** desarrolladores que personalizan popups, labels y simbología.
- **Patrón que enseña:** elige el profile para el contexto; compila una vez con `createArcadeExecutor`.
- **Qué NO cubre:** los renderers en sí (ver `arcgis-visualization`) ni los popups (`arcgis-popup-templates`).

## Inicio Rápido

```typescript
import { createArcadeExecutor } from "@arcgis/core/arcade.js";
const executor = await createArcadeExecutor("$feature.POP * 2", {
  variables: [{ name: "$feature", type: "feature" }],
});
```

## Árbol de Decisión

1. **¿Dónde corre la expresión?**
   - Popup → usa un profile de popup (a menudo vía `expressionInfos` del PopupTemplate).
   - Label → profile de label.
   - Renderer / variable visual → profile de renderer (`valueExpression`).

2. **¿Compilas manualmente?**
   - Sí → `createArcadeExecutor(script, profile)` con las variables correspondientes.

**Default:** declara la expresión en el objeto consumidor (popup/label/renderer) y deja que el SDK la compile.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import { createArcadeExecutor } from "@arcgis/core/arcade.js";
```

### Imports Dinámicos (CDN)

```javascript
const arcade = await $arcgis.import("@arcgis/core/arcade.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Las expresiones viven en popupTemplate/labelingInfo/renderer de capas del map del componente.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Profiles

Un profile declara las variables disponibles para el script (ej. `$feature`, `$layer`, `$map`).
Usa el profile que corresponda al contexto para que existan los globals correctos.

### Concepto 2: createArcadeExecutor

`createArcadeExecutor(script, profile, options?)` retorna un `ArcadeExecutor` que llamas con el
contexto de runtime (la feature). Compila una vez, ejecuta muchas.

### Concepto 3: Dónde viven las expresiones

La mayoría de las veces no llamas al executor tú mismo — defines `expressionInfos` en un popup,
`valueExpression` en un renderer, o una expresión de label, y el SDK la ejecuta.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Profile incorrecto para el contexto

```typescript
// ❌ Anti-patrón
createArcadeExecutor(script, { variables: [] }); // $feature no declarado
```

```typescript
// ✅ Correcto
createArcadeExecutor(script, { variables: [{ name: "$feature", type: "feature" }] });
```

**Impacto:** el script falla porque `$feature` es undefined.

### Pitfall 2: Compilar en cada render

```typescript
// ❌ Anti-patrón
features.forEach(async (f) => { const e = await createArcadeExecutor(script, profile); });
```

```typescript
// ✅ Correcto
const executor = await createArcadeExecutor(script, profile); // una vez, reusa por feature
```

**Impacto:** recompilar por feature es lento.

### Pitfall 3: Funciones FeatureSet pesadas en labels

```typescript
// ❌ Anti-patrón
// Usar FeatureSetByName / agregaciones en una expresión de label sobre muchas features
```

```typescript
// ✅ Correcto
// Mantén las expresiones de label/renderer livianas; precalcula valores pesados.
```

**Impacto:** ralentizaciones drásticas cuando Arcade costoso corre por feature.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de executor / profile | `references/api-detail.md` |
| Ejemplos de expresiones popup / label / renderer | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-popup-templates` — expressionInfos en popups
- `arcgis-visualization` — valueExpression en renderers
- `arcgis-layers` — los datos que leen las expresiones

## Samples de Referencia

- [Arcade in popups](https://developers.arcgis.com/javascript/latest/sample-code/)
- [Arcade renderer](https://developers.arcgis.com/javascript/latest/sample-code/visualization-arcade/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
