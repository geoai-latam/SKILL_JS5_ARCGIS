---
name: arcgis-map-tools
description: >
  Agrega herramientas interactivas al mapa con los Map Components del ArcGIS Maps
  SDK for JavaScript 5.1: arcgis-sketch para dibujar, arcgis-measurement y sus
  variantes 2D/3D para medir (o los análisis de medición por código), y
  arcgis-snapping-controls, que debe compartir el snappingOptions del sketch para
  tener efecto. Usa esta skill cuando el usuario agregue herramientas de dibujo,
  medición o snapping a un mapa o escena.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: specialized
tags:
  - sketch
  - measurement
  - snapping
  - tools
  - components
requires:
  - arcgis-interaction
packages:
  - "@arcgis/map-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Herramientas de Mapa

> **Cuándo usar:** Activa esta skill cuando el usuario agregue herramientas de dibujo, medición o
> snapping a un mapa o escena.

## Resumen

Estos componentes le dan al usuario dibujo, medición y snapping ya hechos.

- **Problema que resuelve:** la UX estándar de dibujo y medición sin escribir la interacción a mano.
- **A quién sirve:** desarrolladores que agregan herramientas interactivas a una app de mapas.
- **Patrón que enseña:** anidar el componente en el mapa, conectar lo que no se conecta solo, leer resultados.
- **Qué NO cubre:** dibujo por código y hit tests (ver `arcgis-interaction`) ni persistencia (`arcgis-editing`).

## Inicio Rápido

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="12">
  <arcgis-sketch slot="top-right"></arcgis-sketch>
  <arcgis-snapping-controls slot="bottom-right"></arcgis-snapping-controls>
  <arcgis-distance-measurement-2d slot="top-left"></arcgis-distance-measurement-2d>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-sketch";
import "@arcgis/map-components/components/arcgis-snapping-controls";
import "@arcgis/map-components/components/arcgis-distance-measurement-2d";

const sketch = document.querySelector("arcgis-sketch")!;
const snapping = document.querySelector("arcgis-snapping-controls")!;
await sketch.componentOnReady();
snapping.snappingOptions = sketch.snappingOptions; // NO lo comparten solos
```

## Árbol de Decisión

1. **¿Dibujar/editar geometría de forma interactiva?**
   - Sí → `arcgis-sketch` (crea una `GraphicsLayer` "Sketch Layer" y la agrega al mapa).

2. **¿Medir?**
   - Mapa 2D → `arcgis-distance-measurement-2d` / `arcgis-area-measurement-2d`, o `arcgis-measurement` con
     `activeTool` `"distance"` | `"area"`.
   - Escena 3D → `arcgis-direct-line-measurement-3d` / `arcgis-area-measurement-3d`, o `arcgis-measurement` con
     `"direct-line"` | `"area"`.
   - Un valor en código, sin UI → `DistanceMeasurementAnalysis` / `AreaMeasurementAnalysis` en `view.analyses`.

3. **¿Snapping al dibujar?**
   - Sí → comparte un solo `SnappingOptions` entre el sketch y `arcgis-snapping-controls`, y agrega
     `featureSources`.

**Por defecto:** `arcgis-sketch` para dibujar, y el componente de medición 2D/3D que corresponda a la vista.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import DistanceMeasurementAnalysis from "@arcgis/core/analysis/DistanceMeasurementAnalysis.js";
import FeatureSnappingLayerSource from "@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource.js";
```

### Imports dinámicos (CDN)

```javascript
const DistanceMeasurementAnalysis = await $arcgis.import("@arcgis/core/analysis/DistanceMeasurementAnalysis.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-measurement";
import "@arcgis/map-components/components/arcgis-snapping-controls";
```

## Conceptos Clave

### Concepto 1: el componente de sketch

`arcgis-sketch` da una barra para dibujar y editar. Medido con 5.1.27: agrega al mapa su propia `GraphicsLayer` con
título "Sketch Layer" (`listMode: "show"`, así que aparece en una lista de capas). Las formas viven solo en esa capa;
léelas desde `arcgisCreate` / `arcgisUpdate` y guárdalas tú.

### Concepto 2: componentes de medición y análisis

Los componentes 2D (`arcgis-distance-measurement-2d`, `arcgis-area-measurement-2d`) arrancan en `state: "ready"` con
`unit: "metric"` (un sistema: cambia entre m y km según el tamaño). `arcgis-measurement` arranca con
`activeTool: null` y `state: "disabled"` hasta que eliges una herramienta; `clear()` lo devuelve ahí. En código, una
medición es un **análisis**: medido, un `DistanceMeasurementAnalysis` con una línea de 0,05° a 4,6°N dio
**5,5 km (geodésica)**, y un cuadrado de 0,01° × 0,01° dio 1 227 040 m² con 4 km de perímetro, leídos de
`(await view.whenAnalysisView(a)).result`.

### Concepto 3: el snapping es configuración, compartida por referencia

Cada componente tiene **su propio** `snappingOptions`. Medido: con `arcgis-sketch` y `arcgis-snapping-controls` en el
mismo mapa, los dos objetos eran distintos, y activar el snapping en los controles dejó el del sketch en
`enabled: false`. Valores por defecto en el sketch: `enabled: false`, `selfEnabled: true`, `featureEnabled: true`,
`distance: 5` px, **0** `featureSources`, `gridEnabled: false`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Esperar que los controles de snapping manejen el sketch

```html
<!-- ❌ Anti-patrón: dos SnappingOptions separados -->
<arcgis-sketch></arcgis-sketch>
<arcgis-snapping-controls></arcgis-snapping-controls>
```

```typescript
// ✅ Correcto
snapping.snappingOptions = sketch.snappingOptions;
sketch.snappingOptions.featureSources.add(new FeatureSnappingLayerSource({ layer: parcels, enabled: true }));
```

**Impacto:** medido: el usuario activa el snapping y el sketch sigue en `enabled: false`. Nada se ajusta, y sin
error.

### Pitfall 2: Un componente de medición 3D en un mapa 2D

```html
<!-- ❌ Anti-patrón -->
<arcgis-map><arcgis-direct-line-measurement-3d></arcgis-direct-line-measurement-3d></arcgis-map>
```

```html
<!-- ✅ Correcto -->
<arcgis-map><arcgis-distance-measurement-2d></arcgis-distance-measurement-2d></arcgis-map>
```

**Impacto:** medido: `start()` resuelve, `state` pasa a `"unsupported"` y la única señal es un aviso en la consola.
Igual, `arcgis-measurement` aceptó `activeTool = "direct-line"` en un mapa 2D y no mostró ninguna herramienta
(`activeWidget: null`).

### Pitfall 3: Esperar que lo dibujado se guarde

```typescript
// ❌ Anti-patrón
// Dibujar con arcgis-sketch y suponer que se guarda en el servicio.
```

```typescript
// ✅ Correcto
sketch.addEventListener("arcgisCreate", (e) => {
  if (e.detail.state === "complete") void parcels.applyEdits({ addFeatures: [e.detail.graphic!] });
});
```

**Impacto:** lo dibujado son gráficos de cliente en la "Sketch Layer"; desaparecen al recargar.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Atributos/eventos de los componentes de herramienta | `references/api-detail.md` |
| Ejemplos de sketch / medir / snap | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-interaction` — SketchViewModel programático
- `arcgis-editing` — persiste la geometría dibujada
- `arcgis-core-maps` — el mapa/escena a enlazar

## Samples de Referencia

- [Sketch component](https://developers.arcgis.com/javascript/latest/sample-code/sketch-geometries/)
- [Measurement](https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Medido en `tests/runtime/casos/arcgis-map-tools.ts`. La skill decía que los
  controles de snapping "se conectan al sketch activo": falso, cada componente tiene su propio `snappingOptions` y hay
  que compartirlo por referencia (ahora es el pitfall principal). El pitfall de 3D en 2D ahora es preciso
  (`state: "unsupported"`, solo un aviso en consola). Se agregaron los análisis de medición en código (5,5 km
  geodésicos para una línea de 0,05° a 4,6°N), los valores por defecto de los componentes y
  `FeatureSnappingLayerSource`. Se cambiaron pitfalls que eran solo comentarios.
- **0.1.0** (2026-05-31): Versión inicial.
