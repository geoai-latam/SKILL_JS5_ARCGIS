---
name: arcgis-widgets-advanced
description: >
  Agrega UI avanzada a un mapa con el ArcGIS Maps SDK for JavaScript 5.0 usando
  Map Components: arcgis-print, arcgis-bookmarks, arcgis-compass, arcgis-daylight y
  arcgis-elevation-profile. Los componentes son lo recomendado; los widgets
  equivalentes de la Core API están deprecados en 5.0. Usa esta skill cuando el
  usuario agregue impresión, bookmarks, brújula, controles de luz, o perfil de elevación.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/map-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Widgets Avanzados

> **Cuándo usar:** Activa esta skill cuando el usuario agregue UI de print, bookmarks, brújula,
> daylight, o elevation-profile. Prefiere Map Components — los widgets están deprecados en 5.0.

## Resumen

La UI avanzada completa una app de mapa: exportar, vistas guardadas, orientación, luz 3D y perfiles de terreno.

- **Problema que resuelve:** herramientas de mapa más ricas más allá de lo básico.
- **A quién sirve:** desarrolladores que construyen apps completas y escenas 3D.
- **Patrón que enseña:** agregar el componente `<arcgis-*>` correspondiente enlazado al mapa/escena.
- **Qué NO cubre:** UI principal (ver `arcgis-widgets-ui`) ni edición (ver `arcgis-editing`).

> ⚠️ Deprecado en 5.0, se removerá en 6.0 (Q1 2027): los widgets de la Core API
> (`@arcgis/core/widgets/Print.js`, etc.). Usa los componentes de abajo en su lugar.

## Inicio Rápido

```typescript
import "@arcgis/map-components/dist/components/arcgis-bookmarks";
// <arcgis-map ...><arcgis-bookmarks position="top-right"></arcgis-bookmarks></arcgis-map>
```

## Árbol de Decisión

1. **¿Qué capacidad?**
   - Exportar un layout → `arcgis-print`.
   - Viewpoints guardados → `arcgis-bookmarks`.
   - Orientación/reset de rotación → `arcgis-compass`.
   - Sol/sombras 3D → `arcgis-daylight` (SceneView).
   - Perfil de terreno/línea → `arcgis-elevation-profile`.

2. **¿2D o 3D?**
   - `arcgis-daylight` y la mayoría del trabajo de elevación necesitan un SceneView.

**Default:** el componente que corresponda a la capacidad, enlazado al mapa/escena.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/map-components/dist/components/arcgis-print";
```

### Imports Dinámicos (CDN)

```javascript
const Print = await $arcgis.import("@arcgis/core/widgets/Print.js"); // fallback deprecado
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/dist/components/arcgis-daylight";
```

## Conceptos Clave

### Concepto 1: Print y exportación

`arcgis-print` habla con un print service para exportar layouts (PDF/PNG). Configura formatos y
layouts permitidos; necesita una URL de print service (ArcGIS Online provee una).

### Concepto 2: Bookmarks

`arcgis-bookmarks` lista viewpoints guardados. Con un webmap puede leer bookmarks guardados;
también puedes dejar que los usuarios agreguen nuevos en runtime.

### Concepto 3: Componentes solo-3D

`arcgis-daylight` (posición del sol/sombras) y perfiles de elevación ricos apuntan a un SceneView.
En 2D no hacen nada útil.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Print sin print service

```typescript
// ❌ Anti-patrón
// <arcgis-print> sin print service configurado
```

```typescript
// ✅ Correcto
// Provee una URL de print service (default de ArcGIS Online o propia).
```

**Impacto:** la exportación falla porque no hay servicio que renderice el layout.

### Pitfall 2: Daylight en un MapView 2D

```typescript
// ❌ Anti-patrón
// <arcgis-daylight reference-element="#map2d">
```

```typescript
// ✅ Correcto
// <arcgis-daylight reference-element="#scene3d">
```

**Impacto:** los controles de daylight no tienen efecto sin un SceneView.

### Pitfall 3: Usar el widget deprecado

```typescript
// ❌ Anti-patrón
import Bookmarks from "@arcgis/core/widgets/Bookmarks.js"; // deprecado en 5.0
```

```typescript
// ✅ Correcto
import "@arcgis/map-components/dist/components/arcgis-bookmarks";
```

**Impacto:** construir sobre una API destinada a removerse en 6.0.

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
- [ElevationProfile](https://developers.arcgis.com/javascript/latest/sample-code/widgets-elevationprofile/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
