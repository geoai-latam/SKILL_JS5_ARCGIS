---
name: arcgis-widgets-ui
description: >
  Agrega la UI básica a un mapa con el ArcGIS Maps SDK for JavaScript 5.1 usando
  Map Components: arcgis-legend, arcgis-layer-list, arcgis-search,
  arcgis-basemap-gallery y arcgis-expand, anidados en el mapa con slot="top-right"
  (un atributo position se ignora) o enlazados desde fuera con reference-element
  (uno sin enlazar o mal escrito queda vacío, en silencio). Los widgets
  equivalentes del Core están deprecados (de 4.32 a 5.0). Usa esta skill cuando el
  usuario agregue una leyenda, una lista de capas, un buscador o un selector de
  basemaps a un mapa.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: widgets
tags:
  - legend
  - layerlist
  - search
  - basemap-gallery
  - components
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/map-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Widgets y UI

> **Cuándo usar:** Activa esta skill cuando el usuario agregue una leyenda, lista de capas, buscador
> o galería de basemaps. Prefiere Map Components — los widgets están deprecados en 5.0.

## Resumen

Las leyendas, las listas de capas y el buscador son Map Components ubicados en los slots del mapa.

- **Problema que resuelve:** UI estándar de mapa sin paneles hechos a mano.
- **A quién sirve:** desarrolladores que arman el cascarón de una app de mapas.
- **Patrón que enseña:** anidar componentes `<arcgis-*>` en el mapa con un `slot`, o enlazarlos desde otra parte con
  `reference-element`.
- **Qué NO cubre:** widgets avanzados (ver `arcgis-widgets-advanced`) ni la UI de edición (`arcgis-editing`).

> ⚠️ Los widgets del Core están deprecados: BasemapGallery desde 4.32, Search desde 4.33, Legend y Expand desde 4.34,
> LayerList desde 5.0. Usa los componentes de abajo.

## Inicio Rápido

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="11">
  <arcgis-search slot="top-right"></arcgis-search>
  <arcgis-legend slot="bottom-left"></arcgis-legend>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-legend";
```

Medido en 5.1.27 sin API key: `arcgis-search` usa por defecto el World Geocoding Service, devolvió 6 resultados para
"Villa de Leyva" y llevó el mapa hasta allá; `arcgis-basemap-gallery` listó 31 basemaps.

## Árbol de Decisión

1. **¿Proyecto nuevo?**
   - Sí → Map Components (`<arcgis-legend>`, `<arcgis-search>`, ...).

2. **¿Manteniendo una app 4.x a mitad de migración?**
   - Sí → conserva el widget temporalmente; planea el cambio antes de 6.0.

3. **¿Qué UI?**
   - Clave de simbología → `arcgis-legend`; prender y apagar capas → `arcgis-layer-list`; buscar lugares →
     `arcgis-search`; cambiar basemap → `arcgis-basemap-gallery`; plegar cualquiera → `arcgis-expand`.

4. **¿Dónde va?**
   - Dentro del mapa → `slot="top-right"` (u otra esquina); se enlaza solo.
   - En otra parte de la página → `reference-element="#mapId"` con el id exacto del mapa.

**Por defecto:** componentes anidados en el mapa con un `slot`.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/components/arcgis-layer-list";
```

### Imports dinámicos (CDN)

```javascript
await $arcgis.import("@arcgis/map-components/components/arcgis-layer-list");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-search";
```

## Conceptos Clave

### Concepto 1: El enlace

Un componente anidado en `<arcgis-map>` encuentra la vista solo, incluso dentro de un `arcgis-expand` (medido: la lista
de capas tenía la vista 2D antes de abrir el expand). Fuera del mapa necesita `reference-element`. Sin vista, el
componente se pinta pero no muestra nada, y no sale ningún error.

### Concepto 2: La ubicación es un slot

Las esquinas son slots: `top-left`, `top-right`, `bottom-left`, `bottom-right` y las variantes `-start`/`-end`. Dos
componentes en el mismo slot se apilan: medido, un buscador y una leyenda en `top-right` quedaron uno sobre otro sin
solaparse. No existe una propiedad `position`.

### Concepto 3: Enlace a los datos

Un `<arcgis-legend>` enlazado sigue las capas y renderers del mapa: medido, agregar una FeatureLayer le dio una entrada
en `activeLayerInfos` sin cablear nada.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Usar el widget deprecado en una app nueva

```typescript
// ❌ Anti-patrón
import Legend from "@arcgis/core/widgets/Legend.js"; // deprecado desde 4.34
```

```typescript
// ✅ Correcto
import "@arcgis/map-components/components/arcgis-legend";
```

**Impacto:** construir sobre una API que se retira en 6.0.

### Pitfall 2: Un componente sin mapa, o con el selector equivocado

```html
<!-- ❌ Anti-patrón: fuera del mapa sin enlace, o un selector que no coincide -->
<arcgis-map id="myMap" basemap="osm"></arcgis-map>
<arcgis-legend reference-element="#map"></arcgis-legend>
```

```html
<!-- ✅ Correcto -->
<arcgis-map id="myMap" basemap="osm"></arcgis-map>
<arcgis-legend reference-element="#myMap"></arcgis-legend>
```

**Impacto:** medido: las leyendas sin enlace y con el selector mal escrito tenían `view: null` y 0 capas, mientras la
anidada tenía la vista 2D y 1 capa. Ninguna registró un error.

### Pitfall 3: Ubicar componentes con position

```html
<!-- ❌ Anti-patrón -->
<arcgis-map basemap="osm"><arcgis-legend position="bottom-left"></arcgis-legend></arcgis-map>
```

```html
<!-- ✅ Correcto -->
<arcgis-map basemap="osm"><arcgis-legend slot="bottom-left"></arcgis-legend></arcgis-map>
```

**Impacto:** medido en `arcgis-widgets-advanced`: con `position`, el componente cae en el slot por defecto, una franja a
lo ancho de la parte de arriba del mapa, en vez de la esquina. Sin error.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Atributos/eventos de componentes | `references/api-detail.md` |
| Ejemplos de placement + binding | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-core-maps` — el mapa al que se enlazan los componentes
- `arcgis-widgets-advanced` — print, bookmarks, daylight, etc.
- `arcgis-layers` — las capas que muestra un legend/layer-list

## Samples de Referencia

- [Components overview](https://developers.arcgis.com/javascript/latest/components/)
- [Widget-to-component transition](https://developers.arcgis.com/javascript/latest/components-transition-plan/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Pruebas en tiempo de ejecución en `tests/runtime/casos/arcgis-widgets-ui.ts`. Todos
  los ejemplos ubicaban los componentes con `position`, que no tienen (caen en el slot por defecto); ahora `slot`. El
  pitfall del enlace ahora está medido (leyendas sin enlace y con selector mal escrito: `view: null`, 0 capas, sin
  error). Se quitaron el pitfall falso de «posiciones que se solapan» (dos componentes en un slot se apilan, medido),
  los que eran solo comentarios (APIs solo del widget, estilos) y el genérico de «importar todos los componentes». Se
  midió que el buscador y la galería de basemaps funcionan sin API key y que un componente dentro de `arcgis-expand` se
  enlaza solo. Se corrigieron las versiones de deprecación (de 4.32 a 5.0), las rutas de import `dist/components`, el
  import por CDN que apuntaba al widget deprecado y un basemap `arcgis/topographic` de un ejemplo que pide key.
- **0.1.0** (2026-05-31): Versión inicial.
