---
name: arcgis-feature-effects
description: >
  Aplica efectos visuales en el ArcGIS Maps SDK for JavaScript 5.0: efectos a toda
  la capa (bloom, blur, drop-shadow, brightness, grayscale) vía layer.effect, y
  énfasis filtrado vía layer.featureEffect con un FeatureFilter y efectos
  included/excluded. Usa esta skill cuando el usuario quiera resaltar, atenuar,
  hacer brillar, o enfatizar por filtro las features visualmente.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: visualization
tags:
  - effects
  - bloom
  - feature-effect
  - filter
  - highlight
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Efectos de Features

> **Cuándo usar:** Activa esta skill cuando el usuario quiera glow, blur, atenuar o enfatizar
> features visualmente — toda la capa o un subconjunto filtrado.

## Resumen

Los efectos son filtros tipo CSS aplicados a capas. `featureEffect` agrega un filtro para que las
features que cumplen y las que no reciban efectos distintos.

- **Problema que resuelve:** atraer la atención a features sin cambiar el renderer.
- **A quién sirve:** desarrolladores que construyen interacciones de foco/resaltado y énfasis.
- **Patrón que enseña:** `layer.effect` para toda la capa; `layer.featureEffect` para un subconjunto.
- **Qué NO cubre:** simbología (ver `arcgis-visualization`) ni queries (ver `arcgis-layers`).

## Inicio Rápido

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });
layer.effect = "bloom(1.5, 0.5px, 0.1)";
```

## Árbol de Decisión

1. **¿Efecto en toda la capa?**
   - Sí → `layer.effect = "<filter string>"`.

2. **¿Enfatizar solo algunas features?**
   - Sí → `layer.featureEffect` con un `FeatureFilter` más `includedEffect`/`excludedEffect`.

3. **¿Filtrar por geometría/tiempo en vez de atributos?**
   - Sí → define `FeatureFilter.geometry` / `timeExtent`.

**Default:** `effect` para estilo global; `featureEffect` para interacciones de foco.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect.js";
```

### Imports Dinámicos (CDN)

```javascript
const FeatureEffect = await $arcgis.import("@arcgis/core/layers/support/FeatureEffect.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Define effect/featureEffect en una capa agregada al map del componente.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Strings de efecto

`effect` es un string tipo CSS: `bloom(...)`, `blur(2px)`, `drop-shadow(...)`, `brightness(1.2)`,
`grayscale(50%)`, `opacity(40%)`. Encadena varios con espacios.

### Concepto 2: featureEffect con un filtro

`FeatureEffect` combina un `FeatureFilter` (un `where`, geometría, o filtro de tiempo) con
`includedEffect` (a los que cumplen) y `excludedEffect` (al resto).

### Concepto 3: Efectos vs renderers

Los efectos son post-procesado encima de los símbolos renderizados. No reemplazan al renderer —
úsalos para énfasis, no para el estilo principal.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Unidades incorrectas en strings de efecto

```typescript
// ❌ Anti-patrón
layer.effect = "blur(2)"; // falta unidad
```

```typescript
// ✅ Correcto
layer.effect = "blur(2px)";
```

**Impacto:** el efecto se ignora o lanza error porque el valor necesita unidad.

### Pitfall 2: Esperar que featureEffect oculte features

```typescript
// ❌ Anti-patrón
layer.featureEffect = new FeatureEffect({ filter, excludedEffect: "opacity(0%)" }); // siguen dibujadas/clicables
```

```typescript
// ✅ Correcto
layer.featureEffect = new FeatureEffect({ filter }); // des-énfasis visual
layer.definitionExpression = "POP > 100000";          // para removerlas de verdad
```

**Impacto:** `opacity(0%)` solo oculta visualmente; las features siguen en hitTest/queries.

### Pitfall 3: Abusar de efectos pesados en capas densas

```typescript
// ❌ Anti-patrón
denseLayer.effect = "bloom(3, 2px, 0)"; // costoso en 100k features
```

```typescript
// ✅ Correcto
focusLayer.featureEffect = new FeatureEffect({ filter, includedEffect: "bloom(2, 1px, 0)" });
```

**Impacto:** caída de frames cuando efectos pesados cubren toda la capa densa.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de effect / FeatureEffect | `references/api-detail.md` |
| Ejemplos de resaltar / atenuar / filtrar | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-layers` — la capa a la que aplican los efectos
- `arcgis-visualization` — renderers (estilo principal)
- `arcgis-interaction` — maneja featureEffect desde la selección

## Samples de Referencia

- [Layer effects](https://developers.arcgis.com/javascript/latest/sample-code/intro-effect-layer/)
- [Feature effect](https://developers.arcgis.com/javascript/latest/sample-code/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
