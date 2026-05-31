---
name: arcgis-custom-rendering
description: >
  Agrega rendering WebGL custom a un SceneView con la RenderNode API del ArcGIS
  Maps SDK for JavaScript 5.0 (sucesora de externalRenderers): inyecta pasos de
  render, accede al contexto WebGL y la cámara, y dibuja geometría custom en la
  escena. Usa esta skill cuando el usuario necesite visuales WebGL a medida,
  shaders custom, o integrar una librería de render 3D en una escena.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Rendering Custom

> **Cuándo usar:** Activa esta skill cuando el usuario necesite rendering WebGL custom en una escena
> 3D — visuales a medida, shaders, o integrar una librería de render.

## Resumen

`RenderNode` inyecta pasos WebGL custom en el pipeline de render de un SceneView (reemplaza externalRenderers).

- **Problema que resuelve:** dibujar WebGL custom que las capas estándar no pueden expresar.
- **A quién sirve:** desarrolladores avanzados haciendo gráficos 3D custom.
- **Patrón que enseña:** subclasea `RenderNode`, declara produces/consumes, renderiza con el contexto de la view.
- **Qué NO cubre:** capas estándar (ver `arcgis-3d-layers`) ni render 2D.

## Inicio Rápido

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
// class MyNode extends RenderNode { render(inputs) { /* dibuja con this.gl */ return ...; } }
```

## Árbol de Decisión

1. **¿Una SceneLayer/renderer puede hacerlo?**
   - Sí → usa la capa/renderer estándar (más barato, soportado).
   - No → continúa.

2. **¿Necesitas WebGL custom en el pipeline 3D?**
   - Sí → subclasea `RenderNode` y adjúntalo al SceneView.

3. **¿Dibujo custom 2D?**
   - Usa un `GraphicsLayer`/overlay canvas (RenderNode es 3D).

**Default:** capas estándar; usa RenderNode solo para WebGL verdaderamente custom.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
```

### Imports Dinámicos (CDN)

```javascript
const RenderNode = await $arcgis.import("@arcgis/core/views/3d/webgl/RenderNode.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Obtén el SceneView de arcgisViewReadyChange y luego adjunta tu RenderNode.
import "@arcgis/map-components/dist/components/arcgis-scene";
```

## Conceptos Clave

### Concepto 1: RenderNode

Subclasea `RenderNode`, define `produces`/`consumes` para ubicarlo en el pipeline, e implementa
`render(inputs)`. El node tiene acceso al contexto WebGL y la cámara de la view.

### Concepto 2: Sistemas de coordenadas

El SceneView renderiza en un sistema de coordenadas de render; transforma tus coordenadas del mundo
a ese (el node provee info de cámara/transform) para que la geometría custom se alinee con la escena.

### Concepto 3: Ciclo de vida y recursos

Asigna recursos GL una vez; libéralos al remover el node. Solicita redibujados vía `requestRender`
del node en vez de un loop apretado.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Usar patrones de externalRenderers

```typescript
// ❌ Anti-patrón
externalRenderers.add(view, myRenderer); // API vieja
```

```typescript
// ✅ Correcto
// Subclasea RenderNode (el sucesor en 5.0) y adjúntalo.
```

**Impacto:** construir sobre el enfoque superado de externalRenderers.

### Pitfall 2: No transformar a coordenadas de render

```typescript
// ❌ Anti-patrón
drawAt(lon, lat, z); // coords geográficas crudas en WebGL
```

```typescript
// ✅ Correcto
// Convierte al sistema de coordenadas de render de la view antes de dibujar.
```

**Impacto:** la geometría aparece en el lugar equivocado o no aparece.

### Pitfall 3: Fugar recursos GL

```typescript
// ❌ Anti-patrón
// Asignar buffers/texturas en cada frame
```

```typescript
// ✅ Correcto
// Asigna una vez; reusa; libera al remover.
```

**Impacto:** crecimiento de memoria GPU y pérdida de contexto.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de RenderNode | `references/api-detail.md` |
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

- **0.1.0** (2026-05-31): Versión inicial.
