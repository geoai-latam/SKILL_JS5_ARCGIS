---
name: arcgis-arcade
description: >
  Escribe y ejecuta expresiones Arcade con el ArcGIS Maps SDK for JavaScript 5.1:
  createArcadeProfile y createArcadeExecutor para popups, labels y renderers,
  execute frente a executeAsync, fieldsUsed/geometryUsed (si faltan, devuelven 0
  en silencio) y medidas geodésicas frente a planas. Usa esta skill cuando el usuario
  escriba una expresión Arcade para un popup, label o renderer, o calcule un valor
  desde atributos/geometría de features.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
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
const value = executor.execute({ $feature: graphic }); // el graphic debe traer POP
```

## Árbol de Decisión

1. **¿Dónde corre la expresión?**
   - Popup → usa un profile de popup (a menudo vía `expressionInfos` del PopupTemplate).
   - Label → profile de label.
   - Renderer / variable visual → profile de renderer (`valueExpression`).

2. **¿Compilas manualmente?**
   - Sí → `createArcadeExecutor(script, createArcadeProfile("popup"))`. Los nombres de profile son
     `"popup"`, `"labeling"`, `"visualization"` (renderers), `"field-calculation"`,
     `"form-calculation"`, `"form-constraint"`, `"aggregate-field"`, entre otros; el helper
     declara todas las variables del contexto (`$feature`, `$layer`, `$map`, `$view`, …).

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
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Profiles

Un profile declara las variables disponibles para el script (ej. `$feature`, `$layer`, `$map`).
Usa el profile que corresponda al contexto para que existan los globals correctos.

### Concepto 2: createArcadeExecutor

`createArcadeExecutor(script, profile, options?)` retorna un `ArcadeExecutor` que llamas con el
contexto de runtime (la feature). Compila una vez, ejecuta muchas.

Lo que el executor te dice, y lo que sale mal si lo ignoras (medido con el SDK 5.1.27):

- `isAsync`: `true` cuando el script usa una función FeatureSet. Entonces solo sirve
  `executeAsync()`; `execute()` lanza "Cannot execute the script in synchronous mode". Para muchas
  features, `executeAsyncBatch()`.
- `fieldsUsed`: pide esos campos (`layer.outFields = executor.fieldsUsed`, o el `outFields` de la
  consulta). Un campo que no se pidió llega como `null`, y `null / 1000` da **0**: un número
  plausible y equivocado, sin error.
- `geometryUsed`: pide la geometría (`returnGeometry: true`). Sin ella, `Area($feature)` devuelve
  **0**, sin error.
- `options.cache` (5.0) reemplaza al deprecado `lruCache`; `options.timeZone` debería ser la zona
  horaria de la vista cuando se muestran fechas.

Los nombres de campo no distinguen mayúsculas: `$feature.pop` lee un campo llamado `POP`.

### Concepto 2b: Área y longitud son planas salvo que digas lo contrario

`Area()` y `Length()` miden en la proyección de la geometría. En Web Mercator eso está mal lejos del
ecuador: una celda de 0,01° a 50° S mide 1,928 km² con `Area` y 0,798 km² con `AreaGeodetic`
(factor 2,42). Usa `AreaGeodetic()` / `LengthGeodetic()` para tamaños reales.

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

### Pitfall 3: Nunca se pidió un campo o la geometría

```typescript
// ❌ Anti-patrón
const e = await createArcadeExecutor("$feature.pop2000 / 1000", profile);
const { features } = await layer.queryFeatures({ where: "1=1", outFields: ["objectid"] });
e.execute({ $feature: features[0] }); // 0, en silencio
```

```typescript
// ✅ Correcto
const { features } = await layer.queryFeatures({
  where: "1=1",
  outFields: e.fieldsUsed,
  returnGeometry: e.geometryUsed,
});
e.execute({ $feature: features[0] }); // 1211.537
```

**Impacto:** medido en el servicio de ejemplo USA: el campo que falta llega como `null` y la
expresión devuelve 0, un valor creíble y equivocado sin error. `Area()` sin geometría también
devuelve 0.

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

- **0.2.0** (2026-10-27): SDK 5.1. Se quitó el pitfall falso de "mayúsculas en el nombre del campo" (Arcade
  no las distingue, medido); campos o geometría que faltan devuelven 0 en silencio; `isAsync` /
  `executeAsync`; `createArcadeProfile`; `cache` reemplaza a `lruCache` (5.0); área plana frente a geodésica.
  Cada afirmación se ejecutó en `tests/runtime/casos/arcgis-arcade.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
