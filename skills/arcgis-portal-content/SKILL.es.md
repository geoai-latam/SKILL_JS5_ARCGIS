---
name: arcgis-portal-content
description: >
  Trabaja con contenido de ArcGIS Online / Enterprise usando las clases de portal
  del ArcGIS Maps SDK for JavaScript 5.1: Portal, PortalItem, PortalQueryParams y
  PortalGroup. Cubre buscar items y paginar bien (nextQueryParams.start es -1 al
  final; num se topa en 100; start + num en 10000), el orden, cargar items por id
  y qué cargador sirve para cada tipo de item. Usa esta skill cuando el usuario
  busque contenido del portal, cargue un item guardado o liste grupos.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: services
tags:
  - portal
  - portalitem
  - webmap
  - groups
  - content
requires:
  - arcgis-authentication
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Contenido de Portal

> **Cuándo usar:** Activa esta skill cuando el usuario busque contenido de ArcGIS, cargue un item por
> id, o trabaje con grupos/items del portal.

## Resumen

Las clases de portal leen y consultan contenido de ArcGIS Online o Enterprise.

- **Problema que resuelve:** descubrir y cargar mapas, capas e items guardados.
- **A quién sirve:** desarrolladores que integran contenido de su organización.
- **Patrón que enseña:** `Portal` + `PortalQueryParams` para buscar y paginar; `PortalItem` para cargar por id.
- **Qué NO cubre:** pintar un webmap (ver `arcgis-core-maps`) ni la autenticación (ver `arcgis-authentication`).

## Inicio Rápido

```typescript
import Portal from "@arcgis/core/portal/Portal.js";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams.js";
import type PortalItem from "@arcgis/core/portal/PortalItem.js";

const portal = new Portal(); // ArcGIS Online; el contenido público no pide sesión
const items: PortalItem[] = [];
let page = await portal.queryItems(new PortalQueryParams({
  query: 'type:"Web Map" AND owner:esri', num: 100, sortField: "modified", sortOrder: "desc",
}));
items.push(...page.results);
while (page.nextQueryParams && page.nextQueryParams.start !== -1) { // -1 significa "no hay más páginas"
  page = await portal.queryItems(page.nextQueryParams);
  items.push(...page.results);
}
```

Medido con 5.1.27 contra ArcGIS Online: 223 web maps públicos de Esri en 3 páginas.

## Árbol de Decisión

1. **¿Ya tienes el id del item?**
   - Web map → `<arcgis-map item-id="...">` o `new WebMap({ portalItem: { id } })`.
   - Item de capa (Feature Service, Map Service, …) → `Layer.fromPortalItem({ portalItem: { id } })`.
   - Solo los metadatos → `new PortalItem({ id })` y `await item.load()`.

2. **¿Hay que buscar contenido?**
   - Sí → `portal.queryItems(new PortalQueryParams({ query, num, sortField, sortOrder }))`, paginando hasta que
     `nextQueryParams.start === -1`.

3. **¿Grupos?**
   - Sí → `portal.queryGroups(params)` y luego `group.queryItems(params)`.

**Por defecto:** carga por id cuando lo sabes; consulta y pagina cuando estás descubriendo.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import Portal from "@arcgis/core/portal/Portal.js";
```

### Imports dinámicos (CDN)

```javascript
const PortalItem = await $arcgis.import("@arcgis/core/portal/PortalItem.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Pasa el id del item directamente al componente de mapa para pintar un webmap guardado.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Portal y autenticación

`new Portal()` apunta a `https://www.arcgis.com`; pon `url` para Enterprise. Sin sesión, `portal.user` es `null` y
las búsquedas devuelven solo items públicos. Cargar un id que no existe, o que no puedes ver, falla rápido con
`Item does not exist or is inaccessible.` (medido: `loadStatus` `"failed"`, sin diálogo de inicio de sesión).

### Concepto 2: PortalQueryParams y sus límites

`query` usa la sintaxis de búsqueda de ArcGIS (`type:"Web Map" AND owner:esri`). Límites medidos en ArcGIS Online:

- La página por defecto trae 10 resultados; un `num` mayor que 100 se topa en silencio (pidió 250, llegaron 100).
- `start` empieza en 1 (el primer `nextQueryParams.start` es 11), y `start + num` por encima de 10000 lanza
  `Result window is too large`.
- `total` también se detiene en 10000: una búsqueda suelta de `"water"` reportó exactamente `10000`.

### Concepto 3: PortalItem.load()

`PortalItem` es perezoso: medido, `title` y `type` son `null` hasta `await item.load()`. `fetchData()` devuelve el
JSON del item (para un web map: `operationalLayers`, `baseMap`, `spatialReference`, …).

## Pitfalls Comunes (Top 3)

### Pitfall 1: Paginar con `while (nextQueryParams)`

```typescript
// ❌ Anti-patrón
let page = await portal.queryItems(params);
while (page.nextQueryParams) page = await portal.queryItems(page.nextQueryParams); // no termina
```

```typescript
// ✅ Correcto
let page = await portal.queryItems(params);
while (page.nextQueryParams && page.nextQueryParams.start !== -1) page = await portal.queryItems(page.nextQueryParams);
```

**Impacto:** medido: `nextQueryParams` siempre es un objeto; tras la última página su `start` es `-1`, y consultarlo
vuelve a la primera página. El bucle ingenuo llevaba 446 resultados tras 6 páginas de una búsqueda de 223, y seguía.

### Pitfall 2: Ordenar por `modified` y recibir lo más viejo

```typescript
// ❌ Anti-patrón
new PortalQueryParams({ query, sortField: "modified" }); // "los mapas más recientes"
```

```typescript
// ✅ Correcto
new PortalQueryParams({ query, sortField: "modified", sortOrder: "desc" });
```

**Impacto:** medido: sin `sortOrder` los primeros resultados eran de 2020; con `"desc"`, de 2026.

### Pitfall 3: `Layer.fromPortalItem` sobre un web map

```typescript
// ❌ Anti-patrón
const layer = await Layer.fromPortalItem({ portalItem: webMapItem });
```

```typescript
// ✅ Correcto
const map = new WebMap({ portalItem: webMapItem }); // o <arcgis-map item-id="...">
```

**Impacto:** medido: `Unknown item type 'Web Map'`. Un item de web map tampoco tiene `url`; `Layer.fromPortalItem`
es para items de capa (con un Feature Service devolvió una capa `feature`).

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de Portal / PortalItem / query | `references/api-detail.md` |
| Ejemplos de search / load / grupos | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-authentication` — inicia sesión para acceder a contenido privado
- `arcgis-core-maps` — renderiza un webmap/webscene cargado
- `arcgis-layers` — capas desde items del portal

## Samples de Referencia

- [Portal query](https://developers.arcgis.com/javascript/latest/sample-code/)
- [Load webmap by id](https://developers.arcgis.com/javascript/latest/sample-code/webmap-basic/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Medido contra ArcGIS Online en `tests/runtime/casos/arcgis-portal-content.ts`.
  El "arreglo" de paginación anterior (`if (first.nextQueryParams)`) volvía a pedir la primera página:
  `nextQueryParams` siempre existe y termina con `start` `-1`. Nuevos pitfalls principales, medidos: ese bucle,
  `sortField` sin `sortOrder` que devuelve lo más viejo, y `Layer.fromPortalItem` sobre un web map. Se documentaron
  los topes (num 100, start + num 10000, total 10000). Se cambiaron dos pitfalls extendidos que eran solo un
  comentario (expiración del token, membresía de grupos) por otros medidos; el snippet ahora pagina bien y ordena
  descendente.
- **0.1.0** (2026-05-31): Versión inicial.
