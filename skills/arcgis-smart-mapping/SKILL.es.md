---
name: arcgis-smart-mapping
description: >
  Auto-genera renderers data-driven con los módulos Smart Mapping del ArcGIS Maps
  SDK for JavaScript 5.0: creadores de renderer de color, size y type que calculan
  estadísticas y eligen breaks y rampas sensatos. Cubre createContinuousRenderer,
  createClassBreaksRenderer y createRenderer. Usa esta skill cuando el usuario
  quiera que el SDK elija la simbología automáticamente desde los datos.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Smart Mapping

> **Cuándo usar:** Activa esta skill cuando el usuario quiera que el SDK elija la simbología
> automáticamente — rampas de color/size y class breaks calculados desde los datos.

## Resumen

Los creadores de Smart Mapping inspeccionan las estadísticas de una capa y retornan un renderer listo para usar.

- **Problema que resuelve:** elegir buenos breaks, rampas y tamaños sin ajuste manual.
- **A quién sirve:** desarrolladores que quieren mapas temáticos rápidos y estadísticamente sólidos.
- **Patrón que enseña:** llamar a un creador con `{ layer, field, view }`, luego asignar su `renderer`.
- **Qué NO cubre:** renderers hechos a mano (ver `arcgis-visualization`).

## Inicio Rápido

```typescript
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field: "POP" });
layer.renderer = renderer;
```

## Árbol de Decisión

1. **¿Qué debe codificar el valor?**
   - Color → `smartMapping/renderers/color.js`.
   - Size → `smartMapping/renderers/size.js`.
   - Categoría/type → `smartMapping/renderers/type.js`.

2. **¿Continuo o por clases?**
   - Continuo → `createContinuousRenderer`.
   - Por clases → `createClassBreaksRenderer`.

**Default:** color `createContinuousRenderer` para campos numéricos; `type.createRenderer` para categorías.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";
```

### Imports Dinámicos (CDN)

```javascript
const colorRendererCreator = await $arcgis.import("@arcgis/core/smartMapping/renderers/color.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Pasa la view del componente (de arcgisViewReadyChange) al creador.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Los creadores necesitan una view

Smart Mapping muestrea features en la view actual para calcular estadísticas, así que la mayoría de
creadores requieren `layer` y `view`. Llámalos después de que la view esté lista.

### Concepto 2: El objeto resultado

Los creadores retornan `{ renderer, statistics, ... }`. Asigna `result.renderer` a `layer.renderer`;
conserva `statistics` si quieres alimentar una leyenda o slider.

### Concepto 3: Módulos color/size/type

Los módulos `color`, `size` y `type` exponen variantes `createContinuousRenderer` /
`createClassBreaksRenderer` / `createRenderer` afinadas a ese canal visual.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Llamar a un creador antes de que la view esté lista

```typescript
// ❌ Anti-patrón
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
// la view no está lista → estadísticas erróneas/vacías
```

```typescript
// ✅ Correcto
await view.when();
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
```

**Impacto:** el renderer usa estadísticas vacías y se ve plano o incorrecto.

### Pitfall 2: Olvidar asignar el renderer

```typescript
// ❌ Anti-patrón
await colorRendererCreator.createContinuousRenderer({ layer, view, field }); // resultado descartado
```

```typescript
// ✅ Correcto
const { renderer } = await colorRendererCreator.createContinuousRenderer({ layer, view, field });
layer.renderer = renderer;
```

**Impacto:** nada cambia porque el renderer calculado nunca se aplicó.

### Pitfall 3: Usar un campo no numérico para un renderer continuo

```typescript
// ❌ Anti-patrón
colorRendererCreator.createContinuousRenderer({ layer, view, field: "NAME" });
```

```typescript
// ✅ Correcto
typeRendererCreator.createRenderer({ layer, view, field: "NAME" }); // categorías
```

**Impacto:** los creadores continuos esperan números; las categorías necesitan el módulo `type`.

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

- **0.1.0** (2026-05-31): Versión inicial.
