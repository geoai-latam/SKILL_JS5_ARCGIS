---
name: arcgis-widgets-advanced
description: >
  Agrega UI avanzada a un mapa con el ArcGIS Maps SDK for JavaScript 5.1 usando
  Map Components: arcgis-print, arcgis-bookmarks, arcgis-compass, arcgis-daylight y
  arcgis-elevation-profile, ubicados con slot="top-right" (un atributo position
  se ignora). Cubre los resultados del perfil de elevación en la analysis view (las
  estadísticas por línea de 4.x ya no existen) y que necesita un ground, y los
  widgets equivalentes del Core, deprecados entre 4.32 y 5.0. Usa esta skill cuando
  el usuario agregue impresión, marcadores, brújula, controles de luz solar o un
  perfil de elevación.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: widgets
tags:
  - print
  - bookmarks
  - daylight
  - elevation-profile
  - components
requires:
  - arcgis-widgets-ui
packages:
  - "@arcgis/map-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Widgets Avanzados

> **Cuándo usar:** Activa esta skill cuando el usuario agregue UI de print, bookmarks, brújula,
> daylight, o elevation-profile. Prefiere Map Components — los widgets están deprecados en 5.0.

## Resumen

La UI avanzada completa una app de mapas: exportar, vistas guardadas, orientación, luz en 3D y perfiles de terreno.

- **Problema que resuelve:** herramientas de mapa más ricas que lo básico.
- **A quién sirve:** desarrolladores que construyen apps de mapas completas y escenas 3D.
- **Patrón que enseña:** anidar el componente `<arcgis-*>` correspondiente en el mapa con un `slot`, y leer los
  resultados de análisis donde los pone 5.x.
- **Qué NO cubre:** la UI básica (ver `arcgis-widgets-ui`) ni la edición (ver `arcgis-editing`).

> ⚠️ Los widgets del Core están deprecados (Compass desde 4.32, Print desde 4.33, Bookmarks y Daylight desde 4.34,
> ElevationProfile desde 5.0). Usa los componentes de abajo.

## Inicio Rápido

```html
<arcgis-map basemap="osm" ground="world-elevation" center="-74.1,4.65" zoom="9">
  <arcgis-bookmarks slot="top-right" show-add-bookmark-button></arcgis-bookmarks>
  <arcgis-compass slot="top-left"></arcgis-compass>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-bookmarks";
import "@arcgis/map-components/components/arcgis-compass";
```

Un componente anidado en el mapa va a una esquina con `slot`. Medido en 5.1.27: con `position="top-right"` en su
lugar, la brújula cayó en el slot por defecto como una franja de 600×32 a lo ancho del mapa; con `slot="top-right"`
quedó en la esquina, de 32×32.

## Árbol de Decisión

1. **¿Qué capacidad?**
   - Exportar un layout → `arcgis-print` (por defecto, el servicio de impresión de ArcGIS Online).
   - Vistas guardadas → `arcgis-bookmarks` (desde un web map, o agregadas por el usuario con
     `show-add-bookmark-button`).
   - Orientación y reiniciar la rotación → `arcgis-compass` (también sirve en 2D).
   - Sol y sombras → `arcgis-daylight` en `arcgis-scene`.
   - Perfil del terreno a lo largo de una línea → `arcgis-elevation-profile`, con un `ground` en el mapa o la escena.

2. **¿Dentro del mapa o en otra parte de la página?**
   - Dentro → `slot="top-right"` (u otra esquina); no hace falta `reference-element`.
   - Fuera → `reference-element="#map"`.

**Por defecto:** el componente de la capacidad, anidado en el mapa con un `slot`.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/components/arcgis-print";
```

### Imports dinámicos (CDN)

```javascript
await $arcgis.import("@arcgis/map-components/components/arcgis-print");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-daylight";
```

## Conceptos Clave

### Concepto 1: La ubicación es un slot

Los map components anidados en `arcgis-map` o `arcgis-scene` se ubican con `slot` (`top-left`, `top-right`,
`bottom-left`, `bottom-right` y las variantes `-start`/`-end`). Ninguno de los cinco componentes tiene una propiedad
`position`; el atributo se ignora y el componente cae en el slot por defecto.

### Concepto 2: Print funciona sin configurar

`arcgis-print` usa el servicio de impresión de ArcGIS Online cuando no hay `printServiceUrl`. Medido: sin URL y sin API
key llegó a `state: "ready"` en unos 5 s, con todos los layouts permitidos y sin diálogo de inicio de sesión. La
exportación en sí no se midió.

### Concepto 3: Los resultados del perfil viven en la analysis view

En 5.x los `profiles` del componente son solo configuración. Los números están en la analysis view:
`await mapEl.whenAnalysisView(profile.analysis)` da `progress`, `results` (uno por línea de perfil, con `available` y
`statistics`) y las `statistics` combinadas. Medido: `line.statistics` (la forma de 4.x) es `undefined`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Ubicar componentes con position

```html
<!-- ❌ Anti-patrón: no es una propiedad de estos componentes -->
<arcgis-map basemap="osm"><arcgis-compass position="top-right"></arcgis-compass></arcgis-map>
```

```html
<!-- ✅ Correcto -->
<arcgis-map basemap="osm"><arcgis-compass slot="top-right"></arcgis-compass></arcgis-map>
```

**Impacto:** medido: el componente fue al slot por defecto, una franja a lo ancho de la parte de arriba del mapa, en vez
de la esquina. Sin error.

### Pitfall 2: Un perfil de elevación en un mapa sin ground

```html
<!-- ❌ Anti-patrón -->
<arcgis-map basemap="osm"><arcgis-elevation-profile slot="bottom-right"></arcgis-elevation-profile></arcgis-map>
```

```html
<!-- ✅ Correcto -->
<arcgis-map basemap="osm" ground="world-elevation">
  <arcgis-elevation-profile slot="bottom-right"></arcgis-elevation-profile>
</arcgis-map>
```

**Impacto:** medido sobre una línea que cruza la Cordillera Oriental junto a Bogotá: sin `ground`, `progress` se quedó
en 0 y el perfil del terreno quedó `available: false`, sin error. Con `ground="world-elevation"` terminó con un máximo
de 3565 m.

### Pitfall 3: Leer las estadísticas del perfil en la línea (4.x)

```typescript
// ❌ Anti-patrón: undefined en 5.x
const max = profileEl.profiles.at(0)?.statistics?.maxElevation;
```

```typescript
// ✅ Correcto
const analysisView = await mapEl.whenAnalysisView(profileEl.analysis!);
// whenAnalysisView devuelve una unión de analysis views: acótala
const max = analysisView.type === "elevation-profile-view-2d" ? analysisView.statistics?.maxElevation : undefined;
```

**Impacto:** medido: `statistics` en la línea del perfil es `undefined`; el código no lee nada y muestra `NaN`.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Atributos de componentes avanzados | `references/api-detail.md` |
| Ejemplos de print / bookmarks / daylight | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-widgets-ui` — componentes de UI principal
- `arcgis-scene-environment` — iluminación/atmósfera 3D más profunda
- `arcgis-core-maps` — el mapa/escena a enlazar

## Samples de Referencia

- [Print component](https://developers.arcgis.com/javascript/latest/sample-code/widgets-print/)
- [Elevation Profile component](https://developers.arcgis.com/javascript/latest/references/map-components/components/arcgis-elevation-profile/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Pruebas en tiempo de ejecución en `tests/runtime/casos/arcgis-widgets-advanced.ts`.
  Todos los ejemplos ubicaban los componentes con `position="top-right"`, que estos componentes no tienen: medido,
  caen en el slot por defecto como una franja a lo ancho del mapa; ahora `slot`. El perfil de elevación lee sus
  resultados en la analysis view (el `line.statistics` de 4.x es `undefined`, medido) y necesita un `ground` (sin él,
  `progress` se queda en 0 y nada falla, medido). Se quitaron pitfalls falsos o vacíos: print sí funciona sin URL
  (ArcGIS Online por defecto, `state: "ready"` sin key), la brújula sí funciona en 2D (siguió una rotación de 45°) y los
  que eran solo comentarios. Se corrigieron las versiones de deprecación (de 4.32 a 5.0, no todas en 5.0), las rutas
  de import `dist/components` y el import por CDN, que apuntaba al widget deprecado.
- **0.1.0** (2026-05-31): Versión inicial.
