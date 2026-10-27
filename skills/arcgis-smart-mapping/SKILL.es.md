---
name: arcgis-smart-mapping
description: >
  Genera renderers a partir de los datos con los módulos de Smart Mapping del
  ArcGIS Maps SDK for JavaScript 5.1: los creadores de color, tamaño y tipo. Cubre
  createContinuousRenderer, createClassBreaksRenderer (intervalos iguales por
  defecto, que amontonan datos sesgados en una clase), createRenderer (las 10
  categorías principales más "Otro" por defecto), de dónde salen las estadísticas
  y los resultados silenciosos con el tipo de campo equivocado. Usa esta skill
  cuando el usuario quiera que el SDK elija la simbología a partir de los datos.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: visualization
tags:
  - smart-mapping
  - renderer
  - color-ramp
  - statistics
  - data-driven
requires:
  - arcgis-visualization
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Smart Mapping

> **Cuándo usar:** Activa esta skill cuando el usuario quiera que el SDK elija la simbología
> automáticamente — rampas de color/size y class breaks calculados desde los datos.

## Resumen

Los creadores de Smart Mapping calculan las estadísticas de un campo y devuelven un renderer listo para usar.

- **Problema que resuelve:** elegir cortes, rampas y tamaños sin ajuste manual.
- **A quién sirve:** desarrolladores que quieren mapas temáticos rápidos y bien fundados estadísticamente.
- **Patrón que enseña:** llama un creador con `{ layer, field, view }` y asigna su `renderer`.
- **Qué NO cubre:** renderers hechos a mano (ver `arcgis-visualization`).

## Inicio Rápido

```typescript
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";

const { renderer } = await colorRendererCreator.createClassBreaksRenderer({
  layer, view, field: "POP",
  classificationMethod: "quantile", // el de por defecto, intervalos iguales, amontona datos sesgados en una clase
  numClasses: 5,
});
layer.renderer = renderer; // el creador nunca lo asigna
```

## Árbol de Decisión

1. **¿Qué codifica el valor?**
   - Color → `smartMapping/renderers/color.js`.
   - Tamaño → `smartMapping/renderers/size.js`.
   - Categoría/tipo → `smartMapping/renderers/type.js` (campos de texto).

2. **¿Continuo o por clases?**
   - Continuo → `createContinuousRenderer`.
   - Por clases → `createClassBreaksRenderer` con un `classificationMethod` explícito.

3. **¿Muchas categorías?**
   - Sí → decide `numTypes` (por defecto 10; `-1` para todas).

**Por defecto:** color `createContinuousRenderer` para campos numéricos; `type.createRenderer` para categorías.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";
```

### Imports dinámicos (CDN)

```javascript
const colorRendererCreator = await $arcgis.import("@arcgis/core/smartMapping/renderers/color.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Pasa la vista del componente (await el.viewOnReady(); el.view) al creador.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: de dónde salen las estadísticas

Medido con 5.1.27: las estadísticas cubrieron **toda la capa, no la extensión de la vista**. Una capa de servicio dio
`n=3557` con la vista sobre Nueva York, sobre todo el país y sin vista; una capa cliente armada con `source` también
dio los 51 features con la vista sobre Nueva York. El `definitionExpression` de la capa sí se respeta
(`st = 'NY'` dio `n=187`); un `filter` con `where` se ignora (solo cuentan los filtros de geometría `intersects`).

### Concepto 2: para qué sirve la vista

`view` le permite al creador leer el fondo para elegir colores (`basemapTheme` volvió `"light"` sobre OSM). Es
opcional: sin ella los creadores también resolvieron. Medido: un creador llamado antes de `view.when()` resolvió con
las mismas estadísticas.

### Concepto 3: el objeto resultado

Los creadores devuelven `{ renderer, statistics, basemapTheme, … }` (el continuo de color también
`visualVariable`). Nunca tocan la capa: medido, `layer.renderer` siguió en `simple` hasta asignarlo.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Cortes por defecto sobre datos sesgados

```typescript
// ❌ Anti-patrón
const { renderer } = await colorRendererCreator.createClassBreaksRenderer({ layer, view, field: "POP" });
```

```typescript
// ✅ Correcto
const { renderer } = await colorRendererCreator.createClassBreaksRenderer({
  layer, view, field: "POP", classificationMethod: "quantile", // o "natural-breaks"
});
```

**Impacto:** medido con la población de ciudades de EE. UU.: el valor por defecto dio 5 intervalos iguales de ~1,6
millones, y **3553 de 3557 ciudades cayeron en la primera clase**: un solo color para casi todo el mapa. Con
`"quantile"` la primera clase terminó en 12938 y tuvo 712.

### Pitfall 2: Un mapa de categorías que solo muestra diez

```typescript
// ❌ Anti-patrón
const { renderer } = await typeRendererCreator.createRenderer({ layer, view, field: "STATE" });
```

```typescript
// ✅ Correcto
const { renderer } = await typeRendererCreator.createRenderer({ layer, view, field: "STATE", numTypes: -1 });
```

**Impacto:** medido en un campo con 51 valores: 10 `uniqueValueInfos`, y todo lo demás pintado con el símbolo por
defecto con la etiqueta `Otro`. Con `numTypes: -1`, los 51.

### Pitfall 3: Un renderer continuo sobre un campo de texto

```typescript
// ❌ Anti-patrón
colorRendererCreator.createContinuousRenderer({ layer, view, field: "NAME" });
```

```typescript
// ✅ Correcto
typeRendererCreator.createRenderer({ layer, view, field: "NAME" }); // categorías
```

**Impacto:** medido: **ningún error**. Devolvió un renderer `class-breaks` con `min`/`max` en `undefined` y stops
inventados `0, 25, 50, 75, 100`. Revisa el tipo del campo antes de elegir el módulo.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de los creadores | `references/api-detail.md` |
| Ejemplos de color / size / type | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-visualization` — los renderers que produce Smart Mapping
- `arcgis-layers` — la capa a analizar
- `arcgis-core-maps` — la view usada para estadísticas

## Samples de Referencia

- [Smart Mapping color](https://developers.arcgis.com/javascript/latest/visualization/)
- [Smart Mapping size](https://developers.arcgis.com/javascript/latest/sample-code/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Medido en `tests/runtime/casos/arcgis-smart-mapping.ts`. Dos de los tres pitfalls
  principales de antes eran falsos: llamar antes de `view.when()` funciona, y un campo de texto no falla (devuelve en
  silencio stops inventados, que ahora es el tercer pitfall). El Concepto 1 viejo ("muestrea los features de la
  vista") era falso: las estadísticas cubren toda la capa. Nuevos pitfalls principales, medidos: los intervalos
  iguales pusieron 3553 de 3557 ciudades en una clase, y el creador de tipos se queda con 10 categorías. Se agregó
  que `filter.where` se ignora; se cambió el `view.watch` deprecado.
- **0.1.0** (2026-05-31): Versión inicial.
