---
name: arcgis-interaction
description: >
  Maneja la interacción usuario-mapa en el ArcGIS Maps SDK for JavaScript 5.0:
  view.hitTest para identificar features clicadas, eventos de pointer/click, y
  dibujo con SketchViewModel (o el componente arcgis-sketch). Usa esta skill cuando
  el usuario haga clic/tap en el mapa para seleccionar features, dibuje geometrías,
  o construya interacciones de mapa personalizadas.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: interaction
tags:
  - hittest
  - pointer-events
  - sketch
  - selection
  - drawing
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Interacción

> **Cuándo usar:** Activa esta skill cuando el usuario haga clic/tap en el mapa para identificar
> features, dibuje geometrías, o cablee interacciones de pointer personalizadas.

## Resumen

La interacción convierte eventos de pointer en acciones espaciales: identificar qué hay
bajo el cursor o dibujar nuevas formas.

- **Problema que resuelve:** conectar gestos del usuario con features y geometrías.
- **A quién sirve:** desarrolladores que construyen herramientas de selección, identify y dibujo.
- **Patrón que enseña:** `view.hitTest` para identify; `SketchViewModel` / `arcgis-sketch` para dibujar.
- **Qué NO cubre:** popups (ver `arcgis-popup-templates`) ni persistencia de edición (ver `arcgis-editing`).

## Inicio Rápido

```typescript
view.on("click", async (event) => {
  const { results } = await view.hitTest(event);
  console.log("features bajo el cursor:", results.length);
});
```

## Árbol de Decisión

1. **¿Identificar qué clicó el usuario?**
   - Sí → `view.hitTest(event)`.

2. **¿Dejar que el usuario dibuje una forma?**
   - UI rápida → componente `arcgis-sketch`.
   - Control custom → `SketchViewModel`.

3. **¿Seguimiento continuo del pointer?**
   - Sí → `view.on("pointer-move", ...)` (con throttle).

**Default:** `hitTest` para identify; `SketchViewModel` para dibujo programático.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
```

### Imports Dinámicos (CDN)

```javascript
const SketchViewModel = await $arcgis.import("@arcgis/core/widgets/Sketch/SketchViewModel.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/dist/components/arcgis-sketch";
```

## Conceptos Clave

### Concepto 1: hitTest

`view.hitTest(screenPoint | clickEvent)` resuelve a `{ results }`. Cada resultado referencia un
gráfico y su capa. Filtra por `layer` para identificar solo la capa que te interesa.

### Concepto 2: SketchViewModel

`SketchViewModel({ view, layer })` maneja el dibujo en un `GraphicsLayer`. Escucha eventos `create` /
`update`; actúa cuando `event.state === "complete"`.

### Concepto 3: Eventos de pointer

`view.on("pointer-move" | "click" | "double-click", handler)` retorna un handle. Remuévelo en la
limpieza, y aplica throttle a eventos de alta frecuencia como `pointer-move`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: hitTest sin filtrar capas

```typescript
// ❌ Anti-patrón
const { results } = await view.hitTest(event); // incluye basemap/labels
const g = results[0];
```

```typescript
// ✅ Correcto
const { results } = await view.hitTest(event, { include: [myLayer] });
```

**Impacto:** tomas el gráfico equivocado (ej. una etiqueta) en vez de tu feature.

### Pitfall 2: Actuar en cada estado del evento sketch

```typescript
// ❌ Anti-patrón
sketch.on("create", (e) => save(e.graphic)); // dispara en start/active también
```

```typescript
// ✅ Correcto
sketch.on("create", (e) => { if (e.state === "complete") save(e.graphic); });
```

**Impacto:** geometrías a medio terminar se guardan repetidamente.

### Pitfall 3: Fugar handlers de pointer-move

```typescript
// ❌ Anti-patrón
view.on("pointer-move", heavyHandler); // nunca se remueve, corre constantemente
```

```typescript
// ✅ Correcto
const handle = view.on("pointer-move", heavyHandler);
// después: handle.remove();
```

**Impacto:** starvation del hilo principal y fugas entre re-renders.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de hitTest / SketchViewModel | `references/api-detail.md` |
| Ejemplos de identify / dibujo / selección | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-popup-templates` — muestra info de features clicadas
- `arcgis-editing` — persiste geometrías dibujadas/editadas
- `arcgis-feature-effects` — enfatiza la selección

## Samples de Referencia

- [hitTest](https://developers.arcgis.com/javascript/latest/sample-code/view-hittest/)
- [SketchViewModel](https://developers.arcgis.com/javascript/latest/sample-code/sketch-geometries/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
