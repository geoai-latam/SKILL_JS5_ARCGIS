---
name: arcgis-scene-environment
description: >
  Controla el entorno 3D de un SceneView en el ArcGIS Maps SDK for JavaScript 5.0:
  iluminación de sol/virtual y sombras, atmósfera y estrellas, y efectos de clima
  (sunny, cloudy, rainy, snowy, foggy). Usa esta skill cuando el usuario ajuste
  iluminación, sombras, hora del día, atmósfera, o clima en una escena 3D.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: specialized
tags:
  - sceneview
  - lighting
  - shadows
  - weather
  - atmosphere
requires:
  - arcgis-3d-layers
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Entorno de Escena

> **Cuándo usar:** Activa esta skill cuando el usuario ajuste iluminación 3D, sombras, hora del día,
> atmósfera, o clima en un SceneView.

## Resumen

El `environment` de un SceneView controla iluminación, atmósfera y clima para un 3D realista.

- **Problema que resuelve:** render 3D realista y analítico (sombras, hora del día, clima).
- **A quién sirve:** desarrolladores que construyen gemelos digitales y escenas inmersivas.
- **Patrón que enseña:** define `environment` (lighting/atmosphere/weather); usa el componente daylight para UI.
- **Qué NO cubre:** capas 3D (ver `arcgis-3d-layers`) ni el widget de UI daylight (ver `arcgis-widgets-advanced`).

## Inicio Rápido

```typescript
import SceneView from "@arcgis/core/views/SceneView.js";
const view = new SceneView({ map, environment: { lighting: { type: "sun", directShadowsEnabled: true } } });
```

## Árbol de Decisión

1. **¿Sol realista/hora del día + sombras?**
   - Sí → `environment.lighting = { type: "sun", date, directShadowsEnabled: true }`.

2. **¿Luz consistente, no direccional?**
   - Sí → `lighting: { type: "virtual" }`.

3. **¿Ambiente de clima (lluvia/nieve/niebla/nubes)?**
   - Sí → `environment.weather = { type: "rainy", cloudCover, precipitation }`.

**Default:** iluminación de sol con sombras para realismo; clima para ambiente/análisis.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import SceneView from "@arcgis/core/views/SceneView.js";
```

### Imports Dinámicos (CDN)

```javascript
const SceneView = await $arcgis.import("@arcgis/core/views/SceneView.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Define environment en <arcgis-scene>, o agrega arcgis-daylight para un control de UI.
import "@arcgis/map-components/dist/components/arcgis-scene";
```

## Conceptos Clave

### Concepto 1: Iluminación

`environment.lighting` es `sun` (manejado por fecha, proyecta sombras reales) o `virtual` (luz
uniforme). `directShadowsEnabled` alterna las sombras proyectadas; `date` fija la posición del sol.

### Concepto 2: Atmósfera y estrellas

`atmosphereEnabled` y `starsEnabled` agregan realismo al cielo. La atmósfera afecta la bruma y el
horizonte; las estrellas aparecen de noche cuando se usa iluminación de sol.

### Concepto 3: Clima

`environment.weather` simula `sunny` / `cloudy` / `rainy` / `snowy` / `foggy` con parámetros como
`cloudCover` y `precipitation`, afectando el ambiente y (visualmente) las condiciones.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Esperar sombras sin habilitarlas

```typescript
// ❌ Anti-patrón
environment: { lighting: { type: "sun" } }; // sin sombras
```

```typescript
// ✅ Correcto
environment: { lighting: { type: "sun", directShadowsEnabled: true } };
```

**Impacto:** sin sombras proyectadas aun con iluminación de sol.

### Pitfall 2: Definir environment en un MapView

```typescript
// ❌ Anti-patrón
new MapView({ environment: { ... } }); // 2D no tiene environment
```

```typescript
// ✅ Correcto
new SceneView({ environment: { ... } });
```

**Impacto:** el environment se ignora en 2D.

### Pitfall 3: Clima/sombras pesados en GPUs débiles

```typescript
// ❌ Anti-patrón
environment: { weather: { type: "rainy" }, lighting: { type: "sun", directShadowsEnabled: true } };
// más qualityProfile alto en un dispositivo de gama baja
```

```typescript
// ✅ Correcto
view.qualityProfile = "medium"; // balancea realismo vs rendimiento
```

**Impacto:** caída de frames por render costoso de sombras + clima.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de environment / lighting / weather | `references/api-detail.md` |
| Ejemplos de iluminación / sombras / clima | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-3d-layers` — el contenido 3D que se ilumina
- `arcgis-widgets-advanced` — el componente de UI daylight
- `arcgis-core-maps` — crea el SceneView

## Samples de Referencia

- [Scene lighting](https://developers.arcgis.com/javascript/latest/sample-code/)
- [Weather](https://developers.arcgis.com/javascript/latest/sample-code/scene-weather/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
