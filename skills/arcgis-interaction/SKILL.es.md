---
name: arcgis-interaction
description: >
  Maneja la interacción usuario-mapa en el ArcGIS Maps SDK for JavaScript 5.1:
  view.hitTest para identificar features clicadas (resultados tipados,
  include/exclude, outFields en capas de servicio, el suelo del SceneView), eventos
  click y pointer-move con promiseUtils.debounce, y dibujo con SketchViewModel o el
  componente arcgis-sketch. Usa esta skill cuando el usuario haga clic/tap en el
  mapa para seleccionar features, dibuje geometrías, o construya interacciones de
  mapa personalizadas.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Interacción

> **Cuándo usar:** Activa esta skill cuando el usuario haga clic/tap en el mapa para identificar
> features, dibuje geometrías, o cablee interacciones de pointer personalizadas.

## Resumen

La interacción convierte eventos del puntero en acciones espaciales: identificar qué hay bajo el cursor, o dibujar
formas nuevas.

- **Problema que resuelve:** conectar los gestos del usuario con features y geometrías.
- **A quién sirve:** desarrolladores que construyen herramientas de selección, identificación y dibujo.
- **Patrón que enseña:** `view.hitTest` con resultados tipados para identificar; `SketchViewModel` /
  `arcgis-sketch` para dibujar.
- **Qué NO cubre:** popups (ver `arcgis-popup-templates`) ni persistir la edición (ver `arcgis-editing`).

## Inicio Rápido

```typescript
view.on("click", async (event) => {
  const { results } = await view.hitTest(event, { include: [myLayer] });
  const hit = results.find((r) => r.type === "graphic"); // estrecha antes de leer .graphic
  if (hit?.type === "graphic") console.log(hit.graphic.attributes);
});
```

En una `FeatureLayer` **de servicio**, `hit.graphic.attributes` solo trae lo que el cliente cargó: medido con
5.1.27, solo `objectid`. Pon en la capa `outFields` con los campos que vas a leer (o `["*"]`).

## Árbol de Decisión

1. **¿Identificar lo que el usuario clicó?**
   - Sí → `view.hitTest(event, { include: [layer] })`, y estrecha `r.type === "graphic"`.
   - Necesitas campos de una capa de servicio → `outFields` en la capa, o `layer.queryFeatures` con el object id.

2. **¿Dejar que el usuario dibuje?**
   - UI rápida → componente `arcgis-sketch` (crea y agrega su propia `GraphicsLayer`).
   - Control propio → `SketchViewModel({ view, layer })`.

3. **¿Hover o seguimiento continuo?**
   - Sí → `view.on("pointer-move", ...)` envuelto en `promiseUtils.debounce`.

**Por defecto:** `hitTest` + `include` + estrechar el tipo para identificar; `SketchViewModel` para dibujar por
código.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
```

### Imports dinámicos (CDN)

```javascript
const SketchViewModel = await $arcgis.import("@arcgis/core/widgets/Sketch/SketchViewModel.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-sketch";
```

## Conceptos Clave

### Concepto 1: los resultados de hitTest son tipados

`view.hitTest(screenPoint | event, { include?, exclude? })` resuelve a `{ results }`. En 5.x cada elemento es una
unión (`graphic`, `media`, `route`, `raster`, `layer`) con un campo `type`, así que TypeScript rechaza
`results[0].graphic` hasta que compruebes `type === "graphic"`. Medido con dos capas en el mismo punto: los
resultados llegan con la capa de arriba primero (`graphic:dibujos, graphic:cuadros`); `include` y `exclude`
filtran como dice la documentación. Un clic sobre una **etiqueta** devuelve el graphic del feature etiquetado, no
un objeto aparte.

### Concepto 2: el SceneView agrega el suelo

En un `SceneView` el suelo **no** está en `results`: medido, un clic sobre terreno vacío da `results: []` y el
punto en `response.ground.mapPoint`. Filtrar en 3D con `include` sirve para las otras capas, no para el terreno.

### Concepto 3: SketchViewModel

`SketchViewModel({ view, layer })` dibuja en una `GraphicsLayer`. En 5.x `create(tool)` devuelve una **Promise**.
Estados medidos: un punto da `start, complete`; un polígono `start, active` (una vez por vértice y por movimiento
del cursor) y luego `complete`. Llamar `create()` otra vez a mitad del dibujo **cancela** el primero
(`polygon:cancel`) y arranca la nueva herramienta; nada se apila. `arcgis-sketch` trae por defecto
`creationMode: "continuous"`: después de una forma la herramienta queda lista para la siguiente.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Leer atributos que la capa de servicio nunca cargó

```typescript
// ❌ Anti-patrón
const states = new FeatureLayer({ url }); // outFields por defecto
view.on("click", async (e) => {
  const hit = (await view.hitTest(e, { include: [states] })).results[0];
  if (hit?.type === "graphic") console.log(hit.graphic.attributes.state_name); // undefined
});
```

```typescript
// ✅ Correcto
const states = new FeatureLayer({ url, outFields: ["state_name", "pop2000"] });
```

**Impacto:** medido en el servicio público de estados de EE. UU.: el hit por defecto traía 1 campo
(`objectid`); con `outFields: ["*"]`, 9 campos y `state_name = "Kansas"`. Sin error, solo `undefined`.

### Pitfall 2: Actuar en cada estado del evento de sketch

```typescript
// ❌ Anti-patrón
sketch.on("create", (e) => save(e.graphic)); // también se dispara en start/active
```

```typescript
// ✅ Correcto
sketch.on("create", (e) => { if (e.state === "complete") save(e.graphic); });
```

**Impacto:** medido: un polígono de tres vértices disparó 4 eventos `active` antes de `complete`; hasta un punto
dispara `start` primero. Cada uno guardaría una geometría a medias.

### Pitfall 3: Correr un hitTest en cada pointer-move

```typescript
// ❌ Anti-patrón
view.on("pointer-move", async (e) => highlight(await view.hitTest(e)));
```

```typescript
// ✅ Correcto
const hover = promiseUtils.debounce(async (e: { x: number; y: number }) => highlight(await view.hitTest(e)));
const handle = view.on("pointer-move", (e) => {
  hover(e).catch((err) => { if (!promiseUtils.isAbortError(err)) throw err; });
});
// después: handle.remove();
```

**Impacto:** el SDK no limita `pointer-move` (medido: llegaron 30 de 30 movimientos). Con 30 llamadas seguidas, el
código plano corrió 30 hitTests; el que tiene debounce resolvió 2 y abortó 28 con `AbortError`, que hay que
tragarse.

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

- **0.2.0** (2026-10-27): SDK 5.1. Medido en `tests/runtime/casos/arcgis-interaction.ts`. Los resultados de
  hitTest son una unión tipada: estrecha `type === "graphic"` (el viejo `results[0].graphic` no compila). Nuevo
  pitfall principal: las capas de servicio devuelven solo `objectid` en el hit si no pones `outFields`. Dos pitfalls
  extendidos eran falsos: el SceneView pone el suelo en `response.ground`, no en `results`, y un segundo `create()`
  cancela el primero en vez de apilarse. El pitfall de "hacerlo fuera del hilo" era relleno; lo reemplaza
  `promiseUtils.debounce` (medido: corrieron 2 de 30 hitTests).
- **0.1.0** (2026-05-31): Versión inicial.
