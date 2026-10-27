---
name: arcgis-portal-content
description: >
  Trabaja con contenido de ArcGIS Online / Enterprise usando las clases portal del
  ArcGIS Maps SDK for JavaScript 5.0: Portal, PortalItem, PortalQueryParams y
  PortalGroup. Cubre consultar items, cargar un webmap/webscene por item id, y leer
  metadata de items. Usa esta skill cuando el usuario busque contenido del portal,
  cargue un item guardado, o gestione grupos/items.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Contenido de Portal

> **Cuándo usar:** Activa esta skill cuando el usuario busque contenido de ArcGIS, cargue un item por
> id, o trabaje con grupos/items del portal.

## Resumen

Las clases portal leen y consultan contenido de ArcGIS Online o Enterprise.

- **Problema que resuelve:** descubrir y cargar mapas, capas e items guardados.
- **A quién sirve:** desarrolladores que integran contenido organizacional.
- **Patrón que enseña:** `Portal` + `PortalQueryParams` para buscar; `PortalItem` para cargar por id.
- **Qué NO cubre:** renderizar un webmap (ver `arcgis-core-maps`) ni auth (ver `arcgis-authentication`).

## Inicio Rápido

```typescript
import PortalItem from "@arcgis/core/portal/PortalItem.js";
const item = new PortalItem({ id: "<item-id>" });
await item.load();
```

## Árbol de Decisión

1. **¿Ya tienes un item id?**
   - Sí → `new PortalItem({ id })` y `load()`, o pasa `item-id` a `<arcgis-map>`.

2. **¿Necesitas buscar contenido?**
   - Sí → `portal.queryItems(new PortalQueryParams({ query }))`.

3. **¿Trabajas con grupos/usuarios?**
   - Sí → `portal.queryGroups` / `PortalGroup.queryItems`.

**Default:** cargar por id cuando se conoce; consultar al descubrir.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import Portal from "@arcgis/core/portal/Portal.js";
```

### Imports Dinámicos (CDN)

```javascript
const PortalItem = await $arcgis.import("@arcgis/core/portal/PortalItem.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Pasa un item id directo al componente de mapa para renderizar un webmap guardado.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Portal y autenticación

`new Portal()` usa ArcGIS Online por defecto; define `portal.url` para Enterprise. Consultar
contenido privado requiere sign-in; el contenido público funciona sin auth.

### Concepto 2: PortalQueryParams

Construye una query con `query` (sintaxis tipo Lucene: `type:"Web Map" AND owner:esri`), `num`,
`start` y `sortField`. `portal.queryItems` retorna resultados paginados.

### Concepto 3: PortalItem.load()

`PortalItem` es lazy — llama `await item.load()` antes de leer `title`, `type`, o datos del item.
Puedes construir un item solo con un `id`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Leer propiedades del item antes de load

```typescript
// ❌ Anti-patrón
const item = new PortalItem({ id });
console.log(item.title); // undefined
```

```typescript
// ✅ Correcto
const item = new PortalItem({ id });
await item.load();
console.log(item.title);
```

**Impacto:** la metadata está vacía hasta que el item carga.

### Pitfall 2: Consultar contenido privado sin sign-in

```typescript
// ❌ Anti-patrón
await portal.queryItems(params); // items privados ausentes
```

```typescript
// ✅ Correcto
// Inicia sesión (OAuth/IdentityManager) para que el portal retorne los items de tu org.
```

**Impacto:** items privados silenciosamente ausentes de los resultados.

### Pitfall 3: Olvidar la paginación

```typescript
// ❌ Anti-patrón
const { results } = await portal.queryItems(new PortalQueryParams({ query }));
// solo la primera página
```

```typescript
// ✅ Correcto
const first = await portal.queryItems(new PortalQueryParams({ query, num: 100 }));
if (first.nextQueryParams) await portal.queryItems(first.nextQueryParams);
```

**Impacto:** te pierdes resultados más allá de la primera página.

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

- **0.1.0** (2026-05-31): Versión inicial.
