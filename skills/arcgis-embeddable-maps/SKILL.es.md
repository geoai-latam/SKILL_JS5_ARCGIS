---
name: arcgis-embeddable-maps
description: >
  Embebe un WebMap guardado de ArcGIS en cualquier sitio con el Embeddable Map del
  ArcGIS Maps SDK for JavaScript 5.0 — un custom element solo-CDN (sin paquete
  npm). Agrega el script unificado 5.0 y un elemento arcgis-embedded-map con un
  item id; trae herramientas por defecto (zoom, leyenda, bookmarks). Usa esta
  skill cuando el usuario quiera embeber o compartir un mapa con mínimo código.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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

El Embeddable Map renderiza un WebMap guardado desde un script tag y un custom element.

- **Problema que resuelve:** poner un mapa configurado en cualquier página sin pipeline de build.
- **A quién sirve:** autores de contenido y desarrolladores que embeben mapas rápido.
- **Patrón que enseña:** script CDN + `arcgis-embedded-map` con un `item-id`.
- **Qué NO cubre:** lógica de app custom (ver `arcgis-core-maps`) ni descubrimiento de contenido (`arcgis-portal-content`).

## Inicio Rápido

```html
<script type="module" src="https://js.arcgis.com/5.0/"></script>
<arcgis-embedded-map item-id="<webmap-item-id>"></arcgis-embedded-map>
```

## Árbol de Decisión

1. **¿Solo necesitas un mapa guardado en una página?**
   - Sí → Embeddable Map (script CDN + elemento).

2. **¿Necesitas capas/lógica/interacciones custom?**
   - Sí → construye con Map Components / Core API (ver `arcgis-core-maps`).

3. **¿Sin tooling de build disponible?**
   - Sí → el Embeddable Map es ideal (HTML/CDN puro).

**Default:** Embeddable Map para compartir/embeber; el SDK completo para apps custom.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```text
No aplica — los Embeddable Maps son solo-CDN; no hay paquete npm que importar.
```

### Imports Dinámicos (CDN)

```html
<script type="module" src="https://js.arcgis.com/5.0/"></script>
```

### Map Components (recomendado para proyectos nuevos)

```text
Para apps completas usa @arcgis/map-components (arcgis-map). Los Embeddable Maps son para embeds rápidos.
```

## Conceptos Clave

### Concepto 1: Entrega solo-CDN

No existe `@arcgis/embeddable-components` en npm. Cargas el script unificado 5.0 y usas el custom
element directamente — sin bundler.

### Concepto 2: El item-id lo maneja todo

El `item-id` apunta a un WebMap guardado; el elemento renderiza su basemap, capas y popups, más
herramientas por defecto (zoom, leyenda, bookmarks).

### Concepto 3: Atributos para herramientas/tema

Los atributos alternan UI (ej. leyenda, bookmarks) y tema. Configura el embed declarativamente en
vez de en código.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Intentar instalarlo por npm

```bash
# ❌ Anti-patrón
pnpm add @arcgis/embeddable-components   # 404 — no está en npm
```

```html
<!-- ✅ Correcto -->
<script type="module" src="https://js.arcgis.com/5.0/"></script>
```

**Impacto:** la instalación falla; los Embeddable Maps llegan solo vía CDN.

### Pitfall 2: WebMap privado sin acceso

```html
<!-- ❌ Anti-patrón -->
<arcgis-embedded-map item-id="<private-item>"></arcgis-embedded-map>
```

```html
<!-- ✅ Correcto -->
<!-- Comparte el item públicamente, o embébelo donde el visitante esté autenticado. -->
```

**Impacto:** el mapa no carga para visitantes anónimos.

### Pitfall 3: Esperar personalización profunda

```html
<!-- ❌ Anti-patrón -->
<!-- Intentar agregar capas/handlers custom al mapa embebido -->
```

```html
<!-- ✅ Correcto -->
<!-- Usa @arcgis/map-components para apps custom; mantén los embeds simples. -->
```

**Impacto:** chocas con los límites intencionales del embed; cambia al SDK completo.

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

- **0.1.0** (2026-05-31): Versión inicial.
