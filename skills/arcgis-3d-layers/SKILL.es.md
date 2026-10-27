---
name: arcgis-3d-layers
description: >
  Agrega capas 3D en un SceneView con el ArcGIS Maps SDK for JavaScript 5.1:
  SceneLayer (objetos/edificios 3D), IntegratedMeshLayer (mallas i3s),
  IntegratedMesh3DTilesLayer (OGC 3D Tiles), PointCloudLayer y GaussianSplatLayer
  (3D Tiles publicados, no archivos .ply). Usa esta skill cuando el usuario trabaje en
  3D, cargue scene services i3s, 3D Tiles, mallas, nubes de puntos o gaussian splats.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
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
   - Malla de fotogrametría a escala urbana desde un `SceneServer` (i3s) → `IntegratedMeshLayer`.
   - Malla en OGC 3D Tiles (`.../3DTilesServer/tileset.json`) → `IntegratedMesh3DTilesLayer`.
     `IntegratedMeshLayer` no la lee (pide `?f=json` y recibe un 404).
   - Puntos LiDAR → `PointCloudLayer`.
   - Captura gaussian splat → `GaussianSplatLayer` (5.0), apuntando a un
     `3DTilesServer/tileset.json` publicado o a un `portalItem`. **No** lee un `.ply`/`.splat`
     suelto: primero se publica (ArcGIS Pro, Reality Studio, Drone2Map, o subiendo un `.3tz`).
   - BIM de Revit → `BuildingSceneLayer`; datos volumétricos → `VoxelLayer`.

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
import "@arcgis/map-components/components/arcgis-scene";
```

## Conceptos Clave

### Concepto 1: Solo SceneView

Las capas 3D requieren un `SceneView` (`<arcgis-scene>`). Agregarlas a un `MapView` 2D no muestra
nada. Define `map.ground = "world-elevation"` para que las capas se asienten sobre el terreno.

### Concepto 2: Scene services i3s

`SceneLayer`, `IntegratedMeshLayer` y `PointCloudLayer` consumen servicios i3s `SceneServer`.
Transmiten nodos por nivel de detalle, así que la carga inicial es progresiva.

### Concepto 3: GaussianSplatLayer (5.0) y lo que cambió en 5.1

`GaussianSplatLayer` renderiza capturas fotorrealistas de gaussian splat publicadas como 3D Tiles:

```typescript
import GaussianSplatLayer from "@arcgis/core/layers/GaussianSplatLayer.js";
const splat = new GaussianSplatLayer({
  url: "https://tiles.arcgis.com/tiles/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Portcoast_industrial/3DTilesServer/tileset.json",
});
```

Una URL equivocada falla **en silencio**: con una fuente inalcanzable o no soportada,
`await layer.load()` igual resuelve, `loadError` queda en `null` y `fullExtent` es el mundo entero
(-180…180). Revisa la consola (CORS/404) y el extent, no solo que `load()` haya resuelto.

Desde 5.1 los splats funcionan con áreas de recorte, slice, línea de visión, perfiles de elevación y
sombras de la escena; shadow cast, viewshed y medición de volumen siguen en desarrollo.

### Concepto 4: `opacity` no hace nada en estas capas dentro de un SceneView

El SDK lo documenta como limitación conocida: cambiar `opacity` no está soportado en un SceneView
para `IntegratedMeshLayer`, `IntegratedMesh3DTilesLayer`, `PointCloudLayer` y `GaussianSplatLayer`
(ni `VoxelLayer`). Para desvanecerlas, alterna `visible` o recórtalas.

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

### Pitfall 2: Fijar `qualityProfile` para "arreglar" capas pesadas

```typescript
// ❌ Anti-patrón
view.qualityProfile = "high"; // o "medium", fijo para todos los equipos
map.addMany([gaussianSplat, integratedMesh, pointCloud]); // todo al arrancar
```

```typescript
// ✅ Correcto
// No toques qualityProfile: el SceneView lo fija según el equipo al cargar.
map.add(integratedMesh);
loadSplatButton.onclick = () => map.add(gaussianSplat); // capas pesadas cuando el usuario las pide
```

**Impacto:** el SDK fija `qualityProfile` automáticamente según el equipo detectado y recomienda no
tocarlo salvo que se conozca el hardware; un valor fijo le queda mal a la GPU de alguien. Si lo
expones, que sea un ajuste del usuario.

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
- [IntegratedMeshLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-integratedmeshlayer/)
- [GaussianSplatLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-gaussiansplatlayer/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. `GaussianSplatLayer` recibe un `3DTilesServer/tileset.json` publicado o un
  `portalItem`, no un `.ply` (comprobado ejecutándolo); chequeo del fallo silencioso;
  `IntegratedMesh3DTilesLayer`, `BuildingSceneLayer` y `VoxelLayer` en el árbol; limitación de `opacity`;
  `qualityProfile` ya no se fija a mano (contradecía la guía del SDK); capacidades de splats en 5.1.
- **0.1.0** (2026-05-31): Versión inicial.
