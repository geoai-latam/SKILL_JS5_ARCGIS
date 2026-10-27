---
name: arcgis-feature-effects
description: >
  Aplica efectos visuales en el ArcGIS Maps SDK for JavaScript 5.1: efectos a toda
  la capa (bloom, blur, drop-shadow, brightness, grayscale) vía layer.effect, y
  énfasis filtrado vía layer.featureEffect con un FeatureFilter y efectos
  included/excluded. Usa esta skill cuando el usuario quiera resaltar, atenuar,
  hacer brillar, o enfatizar por filtro las features visualmente.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
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
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Strings de efecto

`effect` es un string tipo CSS: `bloom(...)`, `blur(2px)`, `drop-shadow(...)`, `brightness(1.2)`,
`grayscale(50%)`, `opacity(40%)`, `hue-rotate(270deg)`. Encadena varios con espacios; se aplican en
orden. También puede ser un array de paradas `{ scale, value }` para efectos que dependen de la
escala. Medido con 5.1.27: `grayscale(100%)` vuelve un cuadrado rojo puro `rgb(54,54,54)`;
`blur(8px)` lo esparce unos 10 px.

### Concepto 2: featureEffect con un filtro

`FeatureEffect` junta un `FeatureFilter` (`where`, `geometry` + `spatialRelationship`, `timeExtent`)
con `includedEffect` (los que cumplen) y `excludedEffect` (el resto). Medido: con
`where: "POP > 1000000"`, el cuadrado que cumple quedó gris y el otro se desvaneció a
`rgb(255,153,153)` (40 % de opacidad). **Sin filtro, todos los features cuentan como incluidos**: los
dos cuadrados tomaron el `includedEffect`. Las etiquetas de los excluidos se ocultan por defecto
(`excludedLabelsVisible: false`); ponlo en `true` para conservarlas.

### Concepto 3: Efectos vs renderers vs filtros

Los efectos son post-proceso sobre los símbolos ya pintados: no reemplazan el renderer y no quitan
nada. Para sacar de verdad features de la vista (y de los clics), usa `layerView.filter` (en el
cliente) o `layer.definitionExpression` (en el servidor). Los efectos **se ignoran en un SceneView**
y en capas con heatmap (según la documentación de 5.1; medido: asignar uno en 3D no lanza y no se ve
nada).

## Pitfalls Comunes (Top 3)

### Pitfall 1: Unidades incorrectas en strings de efecto

```typescript
// ❌ Anti-patrón
layer.effect = "blur(2)"; // falta la unidad
```

```typescript
// ✅ Correcto
layer.effect = "blur(2px)";
```

**Impacto:** medido: no hay excepción; la consola escribe `Invalid Effect` y la capa se pinta sin
ningún efecto. Solo la consola te avisa.

### Pitfall 2: Esperar que featureEffect oculte features

```typescript
// ❌ Anti-patrón
layer.featureEffect = new FeatureEffect({ filter, excludedEffect: "opacity(0%)" }); // sigue clicable
```

```typescript
// ✅ Correcto
const layerView = await view.whenLayerView(layer);
layerView.filter = new FeatureFilter({ where: "POP > 1000000" }); // fuera de la vista y del hitTest
```

**Impacto:** medido: con `opacity(0%)` el feature es invisible, pero `view.hitTest` sobre él lo
devuelve y `layerView.queryFeatureCount()` sigue contando 2. Con `layerView.filter`, el hitTest no
devuelve nada ahí y el layer view cuenta 1 (la capa sigue teniendo 2).

### Pitfall 3: Abusar de efectos pesados en capas densas

```typescript
// ❌ Anti-patrón
denseLayer.effect = "bloom(3, 2px, 0)"; // caro en 100k features
```

```typescript
// ✅ Correcto
focusLayer.featureEffect = new FeatureEffect({ filter, includedEffect: "bloom(2, 1px, 0)" });
```

**Impacto:** caídas de cuadros cuando efectos pesados cubren toda la capa densa (no medido aquí).

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

- **0.2.0** (2026-10-27): SDK 5.1. El código corría. Medido con píxeles: un efecto sin unidad se ignora con un
  aviso `Invalid Effect` en consola (sin excepción); los features con `opacity(0%)` siguen en el hitTest. El pitfall
  extendido "featureEffect sin filtro no resalta nada" era falso: todo toma el `includedEffect`. Se agregó la
  alternativa `layerView.filter` (medida), los efectos por escala, `excludedLabelsVisible` y los límites de
  SceneView/heatmap. En `tests/runtime/casos/arcgis-feature-effects.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
