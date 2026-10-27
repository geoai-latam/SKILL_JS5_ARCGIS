---
name: arcgis-scene-environment
description: >
  Controla el entorno 3D de una SceneView en el ArcGIS Maps SDK for JavaScript
  5.1: luz de sol o virtual y sombras (apagadas por defecto), la fecha del sol y
  cameraTrackingEnabled (que mueve la fecha cuando se mueve la cámara), atmósfera
  y estrellas, y clima (solo disponible en escenas globales a baja altura). Usa
  esta skill cuando el usuario ajuste la luz, las sombras, un estudio de sombras
  a una hora fija, la atmósfera o el clima de una escena 3D.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Entorno de Escena

> **Cuándo usar:** Activa esta skill cuando el usuario ajuste iluminación 3D, sombras, hora del día,
> atmósfera, o clima en un SceneView.

## Resumen

El `environment` de una SceneView controla la luz, la atmósfera y el clima.

- **Problema que resuelve:** render 3D realista y analítico (sombras, hora del día, clima).
- **A quién sirve:** desarrolladores de gemelos digitales, estudios de sombras y escenas inmersivas.
- **Patrón que enseña:** configura `environment` (luz/atmósfera/clima); `arcgis-daylight` / `arcgis-weather` para la UI.
- **Qué NO cubre:** capas 3D (ver `arcgis-3d-layers`) ni otros widgets (ver `arcgis-widgets-advanced`).

## Inicio Rápido

```typescript
import SceneView from "@arcgis/core/views/SceneView.js";

const view = new SceneView({
  map,
  environment: {
    lighting: {
      type: "sun",
      date: new Date("2026-06-21T12:00:00-05:00"), // con offset explícito: mediodía en Bogotá
      directShadowsEnabled: true,                  // false por defecto
      cameraTrackingEnabled: false,                // conserva ese instante cuando el usuario navega
    },
  },
});
```

## Árbol de Decisión

1. **¿Sol en un instante fijo (estudio de sombras, "¿cómo se ve el 21 de junio a las 15:00?")?**
   - Sí → `type: "sun"`, una `date` con offset explícito, `directShadowsEnabled: true`,
     `cameraTrackingEnabled: false`.

2. **¿"La misma hora local mire donde mire el usuario"?**
   - Sí → deja `cameraTrackingEnabled: true` (el valor por defecto).

3. **¿Luz pareja, sin dirección?**
   - Sí → `lighting: { type: "virtual" }` (también puede proyectar sombras).

4. **¿Clima (lluvia/nieve/niebla/nubes)?**
   - Sí → `environment.weather = { type: "rainy", … }`, en una escena global, y revisa
     `environment.weatherAvailable`.

**Por defecto:** luz de sol; enciende las sombras explícitamente; fija la fecha para cualquier análisis.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import SceneView from "@arcgis/core/views/SceneView.js";
```

### Imports dinámicos (CDN)

```javascript
const SceneView = await $arcgis.import("@arcgis/core/views/SceneView.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Configura environment en <arcgis-scene>; arcgis-daylight y arcgis-weather dan la UI.
import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-daylight";
```

## Conceptos Clave

### Concepto 1: la luz y sus valores por defecto

`environment.lighting` es `sun` (según la fecha) o `virtual` (luz pareja). Valores por defecto medidos en 5.1.27:
`type` `"sun"`, `directShadowsEnabled` `false`, `cameraTrackingEnabled` `true`, y una `date` del **15 de marzo al
mediodía solar local bajo la cámara** (16:56 UTC con la cámara sobre Bogotá), no la fecha actual. La luz se puede
cambiar en caliente: `view.environment.lighting = { type: "virtual", directShadowsEnabled: true }` hace autocast.

### Concepto 2: atmósfera y estrellas

`atmosphereEnabled` y `starsEnabled` están en `true` por defecto (medido).

### Concepto 3: clima

`environment.weather` es `sunny` (por defecto) / `cloudy` / `rainy` / `snowy` / `foggy`. Los parámetros van de 0 a
1 y se recortan (medido: `precipitation: 3` quedó en `1`). Solo se pinta donde `environment.weatherAvailable` es
`true`: escenas globales cerca del suelo.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Esperar sombras solo con la luz de sol

```typescript
// ❌ Anti-patrón
const sinSombras = { lighting: { type: "sun" } } as const;
```

```typescript
// ✅ Correcto
const conSombras = { lighting: { type: "sun", directShadowsEnabled: true } } as const;
```

**Impacto:** medido: `directShadowsEnabled` es `false` por defecto, tanto con luz de sol como virtual.

### Pitfall 2: Un estudio de sombras cuya hora cambia cuando el usuario navega

```typescript
// ❌ Anti-patrón
view.environment.lighting = { type: "sun", date: new Date(Date.UTC(2026, 5, 21, 17)), directShadowsEnabled: true };
```

```typescript
// ✅ Correcto
view.environment.lighting = {
  type: "sun", date: new Date(Date.UTC(2026, 5, 21, 17)), directShadowsEnabled: true, cameraTrackingEnabled: false,
};
```

**Impacto:** medido: con el `cameraTrackingEnabled: true` por defecto, mover la cámara de Bogotá a Tokio cambió
`date` de `2026-06-21T17:00Z` a `2026-06-21T02:44Z` (conserva la hora local del día, no el instante). Con `false` se
quedó en 17:00Z.

### Pitfall 3: Clima que no aparece y no avisa

```typescript
// ❌ Anti-patrón
new SceneView({ map, viewingMode: "local", environment: { weather: { type: "rainy" } } });
```

```typescript
// ✅ Correcto
const scene = new SceneView({ map, environment: { weather: { type: "rainy", precipitation: 0.6 } } }); // global
await scene.when();
if (!scene.environment.weatherAvailable) showHint("Acércate para ver el clima");
```

**Impacto:** medido: `weather.type` era `"rainy"` en los tres casos, pero `weatherAvailable` fue `true` solo en una
escena global a 3 km; `false` a 3000 km y `false` en una escena local. No hay ningún error.

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

- **0.2.0** (2026-10-27): SDK 5.1. Medido en `tests/runtime/casos/arcgis-scene-environment.ts`. Nuevos pitfalls
  principales: `cameraTrackingEnabled` (por defecto `true`) mueve la fecha del sol cuando se mueve la cámara, y el
  clima solo se ve donde `weatherAvailable` es true (ni en escenas locales ni en lo alto). Se documentaron los
  valores por defecto reales (15 de marzo al mediodía local, no "ahora"; sombras apagadas; atmósfera y estrellas
  encendidas). Se corrigió el pitfall de fechas (un string de solo fecha es medianoche UTC, no medianoche local).
  El pitfall de GPU pasó a la lista extendida (no medido) y se cambiaron tres extendidos que eran solo un
  comentario.
- **0.1.0** (2026-05-31): Versión inicial.
