---
name: arcgis-embeddable-maps
description: >
  Embebe un WebMap guardado de ArcGIS en cualquier sitio con el Embeddable Map del
  ArcGIS Maps SDK for JavaScript 5.1: un custom element solo-CDN (sin paquete npm)
  que se carga desde su propio script, js.arcgis.com/5.1/embeddable-components/
  (el script unificado del SDK no lo registra), más un elemento
  arcgis-embedded-map con un item id. Las herramientas se encienden por atributo
  (legend-enabled, bookmarks-enabled, ...). Usa esta skill cuando el usuario
  quiera embeber o compartir un mapa con mínimo código.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: new-in-5.0
tags:
  - embeddable
  - embed
  - webmap
  - share
  - cdn
requires:
  - arcgis-portal-content
packages: []
maintainer: "GeoAI LATAM"
license: MIT
---

# Mapas Embebibles

> **Cuándo usar:** Activa esta skill cuando el usuario quiera embeber o compartir un WebMap guardado
> con mínimo código. Los Embeddable Maps son **solo-CDN** — no hay paquete npm.

## Resumen

El Embeddable Map pinta un WebMap guardado con un tag de script y un custom element.

- **Problema que resuelve:** poner un mapa configurado en cualquier página sin pipeline de build.
- **A quién sirve:** autores de contenido y desarrolladores que embeben mapas rápido.
- **Patrón que enseña:** el script de embeddable-components + `arcgis-embedded-map` con un `item-id`.
- **Lo que NO cubre:** lógica de app custom (ver `arcgis-core-maps`) ni descubrir contenido (`arcgis-portal-content`).

## Inicio Rápido

```html
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
<arcgis-embedded-map item-id="10f5128431d44f9180d9936834100ac5" legend-enabled></arcgis-embedded-map>
```

Medido con Chromium (2026-10-27): esto registra el elemento y carga el WebMap público
("Educational Attainment and Household Size", 2 capas); `el.webMap.loadStatus === "loaded"`.

## Árbol de Decisión

1. **¿Solo necesitas un mapa guardado en una página?**
   - Sí → Embeddable Map (su propio script + el elemento).

2. **¿Necesitas capas/lógica/interacciones custom?**
   - Sí → construye con Map Components / Core API (ver `arcgis-core-maps`).

3. **¿No hay herramientas de build?**
   - Sí → Embeddable Map (HTML puro/CDN). El SDK completo también funciona desde el CDN
     (`https://js.arcgis.com/5.1/`), pero ese script **no** incluye `arcgis-embedded-map`.

**Default:** Embeddable Map para compartir/embeber; el SDK completo para apps custom.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```text
No aplica: @arcgis/embeddable-components no está en npm (404, revisado el 2026-10-27).
```

### Imports Dinámicos (CDN)

```html
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
```

### Map Components (recomendado para proyectos nuevos)

```text
Para apps completas usa @arcgis/map-components (arcgis-map); los Embeddable Maps son para embeds.
```

## Conceptos Clave

### Concepto 1: Su propio script de CDN

Los embeddable components se publican aparte del SDK:
`https://js.arcgis.com/5.1/embeddable-components/` (5.1). Medido: el script unificado
`https://js.arcgis.com/5.1/` registra `arcgis-map`, charts y Calcite, pero
`customElements.get("arcgis-embedded-map")` sigue en `undefined`: el tag queda como un elemento
vacío, sin ningún error. No hay paquete npm.

### Concepto 2: El item-id lo maneja todo

El `item-id` apunta a un WebMap guardado; el elemento pinta su basemap, capas y popups. El
`WebMap` cargado se lee en `el.webMap`. `portal-url` apunta a ArcGIS Enterprise, y `api-key` lleva
una key para items o servicios que la necesiten.

### Concepto 3: Las herramientas se encienden

Cada atributo de herramienta es un booleano que por defecto está en `false`: `legend-enabled`,
`bookmarks-enabled`, `basemap-gallery-enabled`, `heading-enabled`, `information-enabled`,
`share-enabled`, `locate-enabled`, `track-enabled`, `floor-filter-enabled`,
`time-zone-label-enabled`, `scroll-enabled` (zoom con la rueda). El único negativo es
`fullscreen-disabled`. `theme` es `light` o `dark`; `center`, `scale` y `extent` fijan la vista
inicial.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Cargar el script del SDK en vez del de embeddable

```html
<!-- ❌ Anti-patrón -->
<script type="module" src="https://js.arcgis.com/5.1/"></script>
<arcgis-embedded-map item-id="..."></arcgis-embedded-map>
```

```html
<!-- ✅ Correcto -->
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
<arcgis-embedded-map item-id="..."></arcgis-embedded-map>
```

**Impacto:** medido: el elemento nunca se define, la página muestra una caja vacía y la consola no
tiene ningún error. Pasa lo mismo con `/5.0/`. Tampoco lo instales con `npm`: el paquete no existe.

### Pitfall 2: Atributos `hide-*`

```html
<!-- ❌ Anti-patrón -->
<arcgis-embedded-map item-id="..." hide-bookmarks></arcgis-embedded-map>
```

```html
<!-- ✅ Correcto -->
<arcgis-embedded-map item-id="..." legend-enabled></arcgis-embedded-map>
```

**Impacto:** `hide-legend`, `hide-bookmarks` y `hide-zoom` no son atributos del elemento (no están en
sus `observedAttributes`) y no hacen nada. La leyenda y los bookmarks ya vienen apagados: medido,
`legendEnabled` y `bookmarksEnabled` son `false` salvo que agregues el atributo `*-enabled`.

### Pitfall 3: Webmap privado sin acceso

```html
<!-- ❌ Anti-patrón -->
<arcgis-embedded-map item-id="<item-privado>"></arcgis-embedded-map>
```

```html
<!-- ✅ Correcto -->
<!-- Comparte el item públicamente, o pasa un api-key cuyos privilegios lo cubran. -->
```

**Impacto:** el mapa no carga para visitantes anónimos (no medido aquí: no se usó un item privado).

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Atributos del elemento | `references/api-detail.md` |
| Ejemplos de embed / share | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-portal-content` — encuentra el item id del webmap
- `arcgis-core-maps` — construye una app custom en su lugar
- `arcgis-widgets-ui` — componentes para apps completas

## Samples de Referencia

- [Embeddable components](https://developers.arcgis.com/javascript/latest/references/embeddable-components/)
- [Components overview](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. La skill no funcionaba: el script unificado `js.arcgis.com/5.0/` no registra
  `arcgis-embedded-map` (medido con 5.0 y 5.1: elemento vacío, sin error); los embeddable components tienen su propio
  script, `js.arcgis.com/5.1/embeddable-components/`. Los atributos `hide-*` no existen: las herramientas se
  encienden con booleanos `*-enabled`, todos en `false` por defecto (decía que leyenda y bookmarks venían
  encendidos). Los pitfalls de alto cero y de script duplicado no se reprodujeron. En `tests/runtime/embebido.mjs`.
- **0.1.0** (2026-05-31): Versión inicial.
