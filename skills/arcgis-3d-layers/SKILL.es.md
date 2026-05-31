---
name: arcgis-3d-layers
description: >
  Agrega capas 3D en un SceneView con el ArcGIS Maps SDK for JavaScript 5.0:
  SceneLayer (objetos/edificios 3D), IntegratedMeshLayer (mallas de captura de
  realidad), PointCloudLayer, y la nueva GaussianSplatLayer para capturas
  fotorrealistas. Usa esta skill cuando el usuario trabaje en 3D, cargue scene
  services i3s, mallas, nubes de puntos o gaussian splats.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: layers
tags:
  - scenelayer
  - integratedmesh
  - pointcloud
  - gaussiansplat
  - 3d
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Capas 3D

> **Cuándo usar:** Activa esta skill cuando el usuario cargue contenido 3D en un SceneView —
> scene layers, integrated meshes, nubes de puntos, o gaussian splats.

## Resumen

Las capas 3D renderizan solo en un `SceneView`. Cada una mapea a un tipo de fuente de datos 3D.

- **Problema que resuelve:** elegir y cargar la capa 3D correcta para los datos.
- **A quién sirve:** desarrolladores que construyen gemelos digitales, escenas urbanas y vistas de captura.
- **Patrón que enseña:** capas solo-SceneView, scene services i3s, y los nuevos gaussian splats.
- **Qué NO cubre:** capas 2D (ver `arcgis-layers`) ni iluminación de escena (ver `arcgis-scene-environment`).

## Inicio Rápido

```typescript
import SceneLayer from "@arcgis/core/layers/SceneLayer.js";
const layer = new SceneLayer({ url: "https://.../Buildings/SceneServer" });
scene.add(layer); // un Map usado por un SceneView
```

## Árbol de Decisión

1. **¿Qué son los datos 3D?**
   - Objetos/edificios 3D (i3s) → `SceneLayer`.
   - Malla de fotogrametría a escala urbana → `IntegratedMeshLayer`.
   - Puntos LiDAR → `PointCloudLayer`.
   - Captura gaussian splat → `GaussianSplatLayer` (nueva en 5.0).

2. **¿Renderizando en 2D?**
   - Sí → no se mostrarán; usa un `SceneView`.

**Default:** `SceneLayer` para datos BIM/objeto; `IntegratedMeshLayer` para realidad capturada.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import SceneLayer from "@arcgis/core/layers/SceneLayer.js";
```

### Imports Dinámicos (CDN)

```javascript
const SceneLayer = await $arcgis.import("@arcgis/core/layers/SceneLayer.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Usa <arcgis-scene> y agrega la capa 3D a su map.
import "@arcgis/map-components/dist/components/arcgis-scene";
```

## Conceptos Clave

### Concepto 1: Solo SceneView

Las capas 3D requieren un `SceneView` (`<arcgis-scene>`). Agregarlas a un `MapView` 2D no muestra
nada. Define `map.ground = "world-elevation"` para que las capas se asienten sobre el terreno.

### Concepto 2: Scene services i3s

`SceneLayer`, `IntegratedMeshLayer` y `PointCloudLayer` consumen servicios i3s `SceneServer`.
Transmiten nodos por nivel de detalle, así que la carga inicial es progresiva.

### Concepto 3: GaussianSplatLayer (nueva en 5.0)

`GaussianSplatLayer` renderiza capturas fotorrealistas de gaussian splat. Es pesada para la GPU —
presupuesta calidad y cárgala solo cuando el usuario lo pida.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Agregar una capa 3D a un MapView

```typescript
// ❌ Anti-patrón
const view = new MapView({ map }); // 2D
map.add(new SceneLayer({ url }));   // nunca renderiza
```

```typescript
// ✅ Correcto
import SceneView from "@arcgis/core/views/SceneView.js";
const view = new SceneView({ map });
map.add(new SceneLayer({ url }));
```

**Impacto:** la capa carga pero no aparece nada en una vista 2D.

### Pitfall 2: Esperar splats/malla sin margen de GPU

```typescript
// ❌ Anti-patrón
map.addMany([gaussianSplat, integratedMesh, pointCloud]); // todo a la vez, alta calidad
```

```typescript
// ✅ Correcto
view.qualityProfile = "medium";
map.add(integratedMesh); // carga las capas pesadas deliberadamente
```

**Impacto:** stutter o pérdida de contexto en GPUs de gama baja.

### Pitfall 3: Sin elevación para capas alineadas al suelo

```typescript
// ❌ Anti-patrón
const map = new Map({ basemap: "arcgis/imagery" }); // sin ground
```

```typescript
// ✅ Correcto
const map = new Map({ basemap: "arcgis/imagery", ground: "world-elevation" });
```

**Impacto:** las mallas/objetos flotan o se hunden respecto al terreno.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de capas 3D | `references/api-detail.md` |
| Ejemplos de SceneLayer / mesh / splat | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-core-maps` — crea el SceneView
- `arcgis-scene-environment` — iluminación, atmósfera, clima
- `arcgis-layers` — capas de datos 2D

## Samples de Referencia

- [SceneLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-scenelayer/)
- [IntegratedMeshLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-integratedmesh/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
