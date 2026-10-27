---
name: arcgis-time-animation
description: >
  Visualiza datos temporales con el ArcGIS Maps SDK for JavaScript 5.0: el
  componente arcgis-time-slider, view.timeExtent para filtrar capas time-aware, y
  TimeExtent/TimeInterval para animación. Usa esta skill cuando el usuario anime
  datos en el tiempo, filtre una capa habilitada por tiempo, o construya una
  experiencia de reproducción temporal.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: specialized
tags:
  - time
  - timeslider
  - timeextent
  - animation
  - temporal
requires:
  - arcgis-layers
packages:
  - "@arcgis/map-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Tiempo y Animación

> **Cuándo usar:** Activa esta skill cuando el usuario anime datos en el tiempo, filtre una capa
> time-aware, o construya reproducción temporal.

## Resumen

Las capas time-aware se filtran por un `timeExtent`; el time-slider lo maneja para la reproducción.

- **Problema que resuelve:** mostrar cómo cambian los datos en el tiempo.
- **A quién sirve:** desarrolladores que construyen dashboards temporales y playback.
- **Patrón que enseña:** `arcgis-time-slider` ↔ `view.timeExtent` ↔ capas time-aware.
- **Qué NO cubre:** las capas en sí (ver `arcgis-layers`) ni el clima 3D (ver `arcgis-scene-environment`).

## Inicio Rápido

```typescript
import "@arcgis/map-components/components/arcgis-time-slider";
// <arcgis-map><arcgis-time-slider position="bottom"></arcgis-time-slider></arcgis-map>
```

## Árbol de Decisión

1. **¿La capa tiene info de tiempo (campos start/end)?**
   - Sí → es time-aware; el slider/timeExtent la filtra.
   - No → define `layer.timeInfo` o filtra por atributo.

2. **¿Necesitas UI de reproducción?**
   - Sí → `arcgis-time-slider` enlazado al mapa.

3. **¿Animación programática?**
   - Sí → avanza `view.timeExtent` con un timer/`TimeInterval`.

**Default:** el componente time-slider maneja `view.timeExtent`.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import TimeExtent from "@arcgis/core/time/TimeExtent.js";
```

### Imports Dinámicos (CDN)

```javascript
const TimeExtent = await $arcgis.import("@arcgis/core/time/TimeExtent.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-time-slider";
```

## Conceptos Clave

### Concepto 1: Capas time-aware

Una capa con `timeInfo` (campos start/end) se filtra automáticamente al `view.timeExtent` actual.
Sin `timeInfo`, el filtrado por tiempo no hace nada.

### Concepto 2: TimeExtent

`new TimeExtent({ start, end })` define una ventana. Definir `view.timeExtent` filtra todas las
capas time-aware a esa ventana.

### Concepto 3: El time-slider

`arcgis-time-slider` expone `fullTimeExtent`, `stops` y controles de reproducción; moverlo actualiza
`view.timeExtent`, que re-filtra las capas.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Esperar filtrado por tiempo sin timeInfo

```typescript
// ❌ Anti-patrón
view.timeExtent = extent; // la capa no tiene timeInfo → sin efecto
```

```typescript
// ✅ Correcto
layer.timeInfo = { startField: "START", endField: "END" };
view.timeExtent = extent;
```

**Impacto:** nada se filtra porque la capa no es time-aware.

### Pitfall 2: Zonas horarias / unidades desalineadas

```typescript
// ❌ Anti-patrón
new TimeExtent({ start: new Date("2020-01-01") }); // ambigüedad local vs UTC
```

```typescript
// ✅ Correcto
new TimeExtent({ start: new Date(Date.UTC(2020, 0, 1)) });
```

**Impacto:** filtrado desfasado por horas entre zonas horarias.

### Pitfall 3: Animar re-consultando en cada tick

```typescript
// ❌ Anti-patrón
setInterval(() => layer.queryFeatures(timeQuery), 200); // re-fetch cada frame
```

```typescript
// ✅ Correcto
setInterval(() => { view.timeExtent = nextWindow(); }, 200); // filtro del lado cliente
```

**Impacto:** thrash de red en vez de filtrado suave del lado cliente.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de TimeExtent / time-slider | `references/api-detail.md` |
| Ejemplos de playback / filtro | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-layers` — las capas time-aware
- `arcgis-core-maps` — la view que tiene `timeExtent`
- `arcgis-widgets-ui` — otros componentes de UI

## Samples de Referencia

- [TimeSlider](https://developers.arcgis.com/javascript/latest/sample-code/widgets-timeslider/)
- [Time visualization](https://developers.arcgis.com/javascript/latest/sample-code/visualization-update-data/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
