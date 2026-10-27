---
name: arcgis-time-animation
description: >
  Visualiza datos temporales con el ArcGIS Maps SDK for JavaScript 5.1: el
  componente arcgis-time-slider (que no toma solo el rango de una capa: hay que
  ponerle fullTimeExtent desde layer.timeInfo), view.timeExtent para filtrar en el
  cliente las capas con tiempo, timeInfo (un campo mal escrito no filtra nada, en
  silencio), useViewTime y las fechas construidas en UTC. Usa esta skill cuando el
  usuario anime datos en el tiempo, filtre una capa con tiempo o arme una
  reproducción temporal.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/map-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Tiempo y Animación

> **Cuándo usar:** Activa esta skill cuando el usuario anime datos en el tiempo, filtre una capa
> time-aware, o construya reproducción temporal.

## Resumen

Las capas con tiempo se filtran al `timeExtent` de la vista; el time slider mueve esa ventana para la reproducción.

- **Problema que resuelve:** mostrar cómo cambian los datos en el tiempo.
- **A quién sirve:** desarrolladores que construyen dashboards temporales y reproducción.
- **Patrón que enseña:** `arcgis-time-slider` → `view.timeExtent` → capas con tiempo, con el rango puesto a mano.
- **Qué NO cubre:** las capas en sí (ver `arcgis-layers`) ni el clima 3D (ver `arcgis-scene-environment`).

## Inicio Rápido

```html
<arcgis-map basemap="osm" center="-60,25" zoom="3">
  <arcgis-time-slider slot="bottom-left"></arcgis-time-slider>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-time-slider";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import TimeInterval from "@arcgis/core/time/TimeInterval.js";

const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
const hurricanes = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer/0" }); // con tiempo, ago–oct de 2000
mapEl.map?.add(hurricanes);
await hurricanes.load();

const slider = document.querySelector("arcgis-time-slider")!;
slider.fullTimeExtent = hurricanes.timeInfo!.fullTimeExtent; // el slider no lo encuentra solo
slider.stops = { interval: new TimeInterval({ value: 1, unit: "days" }) };
```

Medido en 5.1.27: antes de poner `fullTimeExtent`, el `fullTimeExtent` del slider, su `timeExtent` y el
`view.timeExtent` son `null`. Una vez puesto, el slider mueve `view.timeExtent` una parada por cada `next()`. Un
`{ value, unit }` suelto en `stops.interval` corre (autocast) pero falla en TypeScript strict con TS2740: usa
`TimeInterval`.

## Árbol de Decisión

1. **¿La capa tiene `timeInfo`?**
   - Sí (el servicio tiene el tiempo habilitado) → se filtra a `view.timeExtent`.
   - No → pon `layer.timeInfo = { startField }` con un nombre de campo que exista.

2. **¿Necesitas UI de reproducción?**
   - Sí → `arcgis-time-slider` dentro del mapa, con `fullTimeExtent` y `stops`.

3. **¿Animación por código o una ventana fija?**
   - Sí → asigna `view.timeExtent`; filtra en el cliente, sin una petición por paso.

4. **¿Una capa debe ignorar la ventana?**
   - Sí → `layer.useViewTime = false`.

**Por defecto:** el slider maneja `view.timeExtent`, con el rango tomado de `layer.timeInfo.fullTimeExtent`.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import TimeExtent from "@arcgis/core/time/TimeExtent.js";
```

### Imports dinámicos (CDN)

```javascript
const TimeExtent = await $arcgis.import("@arcgis/core/time/TimeExtent.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-time-slider";
```

## Conceptos Clave

### Concepto 1: Capas con tiempo

Una capa con `timeInfo` se filtra al `view.timeExtent` actual. Sin `timeInfo` la ventana no hace nada: en una capa
medida de 12 puntos mensuales, una ventana de enero dejó los 12 visibles, y con `timeInfo` dejó 1.

### Concepto 2: La ventana se aplica en el cliente

Cambiar `view.timeExtent` vuelve a filtrar lo que la capa ya tiene. Medido en la capa de huracanes: 10 pasos
semanales hicieron 0 peticiones a `/query`.

### Concepto 3: Dos ventanas se intersecan

`layer.timeExtent` recorta más esa capa, y la capa muestra la intersección con la ventana de la vista.
`layer.useViewTime = false` hace que una capa ignore por completo la ventana de la vista.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Esperar que el slider lea el rango de la capa

```typescript
// ❌ Anti-patrón: una capa con tiempo en el mapa y nada más
mapEl.map?.add(hurricanes);
```

```typescript
// ✅ Correcto
await hurricanes.load();
slider.fullTimeExtent = hurricanes.timeInfo!.fullTimeExtent;
```

**Impacto:** medido: con solo la capa en el mapa, el `fullTimeExtent` del slider seguía en `null` a los 3 s, y no se
filtraba nada.

### Pitfall 2: Construir las fechas en hora local

```typescript
// ❌ Anti-patrón: medianoche en la zona del navegador, no en UTC
new TimeExtent({ start: new Date(2020, 0, 1), end: new Date(2020, 0, 31) });
```

```typescript
// ✅ Correcto (un ISO de solo fecha también es UTC)
new TimeExtent({ start: new Date(Date.UTC(2020, 0, 1)), end: new Date(Date.UTC(2020, 0, 31)) });
```

**Impacto:** medido en America/Bogota con datos sellados a las 00:00 UTC: la ventana local arranca 5 h tarde y mostró
0 de 1 registros de enero; `Date.UTC` y `new Date("2020-01-01")` mostraron 1 de 1.

### Pitfall 3: Un campo de timeInfo que no existe

```typescript
// ❌ Anti-patrón
layer.timeInfo = { startField: "FECHA" }; // el campo es "fecha"
```

```typescript
// ✅ Correcto
await layer.load();
const field = layer.getField("fecha"); // null si no existe
if (field?.type === "date") layer.timeInfo = { startField: field.name };
```

**Impacto:** medido: sin error, sin `fullTimeExtent`, y los 12 registros siguieron visibles en una ventana de un mes.

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

- **0.2.0** (2026-10-27): SDK 5.1. Pruebas en tiempo de ejecución en `tests/runtime/casos/arcgis-time-animation.ts`.
  El pitfall de zona horaria usaba un anti-patrón falso: `new Date("2020-01-01")` ya es UTC; la trampa local es
  `new Date(2020, 0, 1)` (medido: 0 de 1 registros en Bogotá). Nuevo pitfall principal: el slider no toma el rango de
  la capa (`fullTimeExtent` queda en null). Se midió un campo de `timeInfo` mal escrito (silencioso, no filtra). Se
  midió que `view.timeExtent` filtra en el cliente (0 peticiones en 10 pasos), además de `useViewTime` y la
  intersección con `layer.timeExtent`. Se reemplazaron los pitfalls que eran solo comentarios y el web map de
  relleno por una capa pública con tiempo. `stops.interval` ahora es un `TimeInterval` (un objeto suelto falla en TS
  strict).
- **0.1.0** (2026-05-31): Versión inicial.
