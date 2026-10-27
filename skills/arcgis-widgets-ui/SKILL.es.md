---
name: arcgis-widgets-ui
description: >
  Agrega UI principal a un mapa con el ArcGIS Maps SDK for JavaScript 5.0 usando
  Map Components: arcgis-legend, arcgis-layer-list, arcgis-search y
  arcgis-basemap-gallery. Los componentes son el camino recomendado; los widgets
  equivalentes de la Core API están deprecados en 5.0. Usa esta skill cuando el
  usuario agregue una leyenda, lista de capas, buscador o selector de basemap.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/map-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Widgets y UI

> **Cuándo usar:** Activa esta skill cuando el usuario agregue una leyenda, lista de capas, buscador
> o galería de basemaps. Prefiere Map Components — los widgets están deprecados en 5.0.

## Resumen

Elementos de UI como leyendas y búsqueda ahora son Map Components colocados en los slots del mapa.

- **Problema que resuelve:** UI de mapa estándar sin paneles hechos a mano.
- **A quién sirve:** desarrolladores que ensamblan el shell de una app de mapa.
- **Patrón que enseña:** declarar componentes `<arcgis-*>` con `reference-element` y un `position`/slot.
- **Qué NO cubre:** widgets avanzados (ver `arcgis-widgets-advanced`) ni UI de edición (`arcgis-editing`).

> ⚠️ Deprecado en 5.0, se removerá en 6.0 (Q1 2027): los widgets de la Core API
> (`@arcgis/core/widgets/Legend.js`, etc.). Usa los componentes de abajo en su lugar.

## Inicio Rápido

```typescript
import "@arcgis/map-components/components/arcgis-legend";
// <arcgis-map ...><arcgis-legend position="bottom-left"></arcgis-legend></arcgis-map>
```

## Árbol de Decisión

1. **¿Proyecto nuevo?**
   - Sí → Map Components (`<arcgis-legend>`, `<arcgis-search>`, ...).

2. **¿Mantienes una app 4.x a mitad de migración?**
   - Sí → conserva el widget temporalmente; planea migrar antes de 6.0.

3. **¿Qué UI?**
   - Clave de simbología → `arcgis-legend`; alternar capas → `arcgis-layer-list`;
     buscar lugares/features → `arcgis-search`; cambiar basemap → `arcgis-basemap-gallery`.

**Default:** componentes, colocados vía slots/positions en el mapa.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/components/arcgis-layer-list";
```

### Imports Dinámicos (CDN)

```javascript
const Legend = await $arcgis.import("@arcgis/core/widgets/Legend.js"); // fallback deprecado
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-search";
```

## Conceptos Clave

### Concepto 1: reference-element y posicionamiento

Coloca un componente dentro de `<arcgis-map>` (auto-enlazado) o en otro lugar con `reference-element`
apuntando al mapa. Usa `position` (ej. `top-right`) o un slot de Calcite shell.

### Concepto 2: Componente vs widget

Los componentes envuelven (y cada vez más reemplazan) a los widgets viejos. Algunos componentes 5.0
siguen siendo "legacy" (respaldados internamente por un widget) durante la migración, pero la API
de componente es el objetivo.

### Concepto 3: Enlace de datos

Los componentes leen del map/view enlazado, así que un `<arcgis-legend>` refleja las capas y
renderers actuales automáticamente — sin cableado manual.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Usar el widget deprecado en una app nueva

```typescript
// ❌ Anti-patrón
import Legend from "@arcgis/core/widgets/Legend.js"; // deprecado en 5.0
```

```typescript
// ✅ Correcto
import "@arcgis/map-components/components/arcgis-legend";
```

**Impacto:** construir sobre una API destinada a removerse en 6.0.

### Pitfall 2: Componente sin enlace al mapa

```typescript
// ❌ Anti-patrón
// <arcgis-legend></arcgis-legend> fuera del mapa, sin reference-element
```

```typescript
// ✅ Correcto
// <arcgis-legend reference-element="#myMap"></arcgis-legend>
```

**Impacto:** el componente renderiza vacío porque no tiene view.

### Pitfall 3: Importar todos los componentes por adelantado

```typescript
// ❌ Anti-patrón
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-print"; // no se usa aquí
```

```typescript
// ✅ Correcto
import "@arcgis/map-components/components/arcgis-search"; // solo lo que se usa
```

**Impacto:** bundle más grande por componentes no usados.

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

- **0.1.0** (2026-05-31): Versión inicial.
