---
name: arcgis-custom-rendering
description: >
  Agrega rendering WebGL2 custom a un SceneView con la RenderNode API del ArcGIS
  Maps SDK for JavaScript 5.1 (externalRenderers ya no existe en 5.x):
  RenderNode.createSubclass con consumes/produces, bindRenderTarget, la cámara de
  render, toRenderCoordinates, y BaseLayerViewGL2D para WebGL custom en un
  MapView 2D. Usa esta skill cuando el usuario necesite visuales WebGL a medida,
  shaders custom, o integrar una librería de render en un mapa o escena.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: specialized
tags:
  - rendernode
  - webgl
  - custom-rendering
  - shaders
  - 3d
requires:
  - arcgis-3d-layers
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Rendering Custom

> **Cuándo usar:** Activa esta skill cuando el usuario necesite rendering WebGL custom en una escena
> 3D — visuales a medida, shaders, o integrar una librería de render.

## Resumen

`RenderNode` inyecta pasos WebGL2 custom en el pipeline de render de un SceneView. En 5.x es la
única vía: `views/3d/externalRenderers.js` (4.x) ya no está en el paquete. Esri marca la API como
**experimental** (puede cambiar en versiones menores).

- **Problema que resuelve:** dibujar WebGL custom que las capas estándar no pueden expresar.
- **A quién sirve:** desarrolladores que ya saben WebGL.
- **Patrón que enseña:** `RenderNode.createSubclass({ consumes, produces, render })` y luego
  `new Node({ view })`; para 2D, `BaseLayerViewGL2D`.
- **Lo que NO cubre:** capas estándar (ver `arcgis-3d-layers`) ni cómo escribir shaders.

## Inicio Rápido

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
import type SceneView from "@arcgis/core/views/SceneView.js";

declare const view: SceneView;

const TintNode = RenderNode.createSubclass({
  consumes: { required: ["composite-color"] }, // un objeto, no un array
  produces: "composite-color",                  // una salida, un string
  render() {
    const gl = this.gl;                         // WebGL2RenderingContext
    const output = this.bindRenderTarget();     // dibuja encima del composite actual
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, gl.drawingBufferHeight - 40, 40, 40);
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);              // un cuadrado rojo de 40 px, arriba a la izquierda
    gl.disable(gl.SCISSOR_TEST);
    return output;                              // debe devolver el ManagedFBO que produce
  },
});
const node = new TintNode({ view });            // activo desde aquí
// node.destroy() quita el paso
```

Medido con 5.1.27 (Chromium): el cuadrado aparece en `view.takeScreenshot()`, `render` corre en
cada redibujado (15 llamadas mientras la escena se asienta), más después de `node.requestRender()`
y ninguna después de `destroy()`.

## Árbol de Decisión

1. **¿Lo resuelve una capa, un renderer o un efecto?**
   - Sí → úsalo (`arcgis-visualization`, `arcgis-feature-effects`): soportado y más barato.
   - No → continúa.

2. **¿3D (SceneView)?**
   - Sí → `RenderNode.createSubclass` (esta skill).

3. **¿2D (MapView)?**
   - Sí → una capa cuyo `createLayerView` devuelva un `BaseLayerViewGL2D.createSubclass({ render })`:
     `render({ context, state })` recibe un `WebGL2RenderingContext` (medido: 91 llamadas en 1,5 s).

**Default:** capas estándar; `RenderNode` solo para WebGL custom de verdad.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
import * as webgl from "@arcgis/core/views/3d/webgl.js"; // toRenderCoordinates y compañía
import BaseLayerViewGL2D from "@arcgis/core/views/2d/layers/BaseLayerViewGL2D.js";
```

### Imports Dinámicos (CDN)

```javascript
const RenderNode = await $arcgis.import("@arcgis/core/views/3d/webgl/RenderNode.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-scene";
// const el = document.querySelector("arcgis-scene")!; await el.viewOnReady();
// new TintNode({ view: el.view });
```

## Conceptos Clave

### Concepto 1: consumes y produces

`produces` es **una** `RenderNodeOutput`: `"opaque-color"`, `"transparent-color"`,
`"composite-color"` o `"final-color"` (después del post-proceso). `consumes` es
`{ required: RenderNodeInput[], optional?: RenderNodeInput[] }`, donde las entradas suman
`"normals"` y `"highlights"`. Si en un cuadro falta una entrada requerida (por ejemplo
`"highlights"` sin nada resaltado) el nodo se salta ese cuadro. `render(inputs)` debe devolver el
`ManagedFBO` que produce: `bindRenderTarget()` para dibujar encima, o
`acquireOutputFramebuffer()` para uno nuevo cuando lees la entrada como textura.

### Concepto 2: Coordenadas de render

En una escena global el sistema de coordenadas de render es ECEF en metros. Convierte con
`webgl.toRenderCoordinates(view, src, 0, SpatialReference.WGS84, dest, 0, count)`: medido, Bogotá
`[-74.08, 4.6, 2600]` → `[1744566, -6116243, 511728]`, a 6.380.737 m del centro de la Tierra. Los
mismos números pasados crudos son un punto a 2,6 km del centro de la Tierra: no se ve nada. Haz las
cuentas en doble precisión y resta un origen local (`renderCoordinateTransformAt`) antes de mandar
los vértices a la GPU como float32.

### Concepto 3: Cámara, redibujado y ciclo de vida

`this.camera` (`RenderCamera`) tiene `viewMatrix`, `projectionMatrix` (4×4, 16 números),
`viewport` y `pixelRatio`; léela dentro de `render`, en cada cuadro. La vista no se redibuja sola
mientras está quieta: llama `requestRender()` cuando cambien tus datos, o una vez por cuadro desde
`render` para una animación. Crea los recursos GL una vez (en el primer `render`) y libéralos en
`destroy()`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Escribir la API externalRenderers de 4.x

```typescript
// ❌ Anti-patrón (4.x)
import * as externalRenderers from "@arcgis/core/views/3d/externalRenderers.js";
externalRenderers.add(view, { setup() {}, render() {} });
```

```typescript
// ✅ Correcto (5.x)
const Node = RenderNode.createSubclass({ consumes: { required: ["composite-color"] }, produces: "composite-color", render() { return this.bindRenderTarget(); } });
new Node({ view });
```

**Impacto:** el módulo no está en `@arcgis/core` 5.1: el import falla al compilar.

### Pitfall 2: consumes como array

```typescript
// ❌ Anti-patrón
new TintNode({ view, consumes: [{ name: "composite-color" }] });
```

```typescript
// ✅ Correcto
const TintNode = RenderNode.createSubclass({ produces: "composite-color", render() { return this.bindRenderTarget(); } });
new TintNode({ view, consumes: { required: ["composite-color"] } });
```

**Impacto:** medido: el constructor lo acepta y luego **cada cuadro** lanza "Cannot read
properties of undefined (reading 'includes')", `render` nunca se llama y toda la escena sale negra
(`rgb(0,0,0)`), no solo el paso custom.

### Pitfall 3: Una clase ES normal

```typescript
// ❌ Anti-patrón
class TintNode extends RenderNode { render() { return this.bindRenderTarget(); } }
new TintNode({ view, consumes: { required: ["composite-color"] }, produces: "composite-color" });
```

```typescript
// ✅ Correcto
const TintNode = RenderNode.createSubclass({ /* consumes, produces, render */ });
```

**Impacto:** medido: el constructor lanza "Cannot read properties of null (reading 'stage')".
`RenderNode` es un Accessor: hereda con `createSubclass` (o `@subclass` de
`core/accessorSupport/decorators`, no probado aquí).

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de RenderNode, utilidades webgl y BaseLayerViewGL2D | `references/api-detail.md` |
| Ejemplos de setup de RenderNode | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-3d-layers` — contenido 3D estándar
- `arcgis-scene-environment` — ilumina tu escena
- `arcgis-performance` — administra el costo de GPU

## Samples de Referencia

- [RenderNode](https://developers.arcgis.com/javascript/latest/sample-code/custom-render-node-color/)
- [Custom WebGL](https://developers.arcgis.com/javascript/latest/sample-code/scene-external-renderer/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Los ejemplos no corrían: `consumes: [{ name }]` deja negra toda la escena y
  lanza en cada cuadro (medido), y una `class extends RenderNode` normal lanza en el constructor; ahora
  `createSubclass` con `consumes: { required }`. `externalRenderers` ya no existe en 5.x (decía "superada"). Sí hay
  WebGL custom en 2D (`BaseLayerViewGL2D`; el árbol mandaba a un GraphicsLayer). Coordenadas de render medidas. El
  pitfall "estado GL sucio rompe el SDK" no se reprodujo con SCISSOR_TEST y queda como precaución. En
  `tests/runtime/casos/arcgis-custom-rendering.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
