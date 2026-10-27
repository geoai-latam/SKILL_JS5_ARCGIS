---
name: arcgis-rest-services
description: >
  Llama a location services de ArcGIS con los módulos rest del ArcGIS Maps SDK for
  JavaScript 5.0: route (direcciones), locator (geocoding), places (búsqueda de
  POI), y query contra feature services. Usa esta skill cuando el usuario
  geocodifique una dirección, resuelva una ruta, busque lugares, o corra una query
  standalone contra un endpoint REST.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: services
tags:
  - route
  - locator
  - places
  - query
  - rest
requires:
  - arcgis-authentication
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Servicios REST

> **Cuándo usar:** Activa esta skill cuando el usuario geocodifique, rutee, busque lugares, o corra
> una query REST standalone.

## Resumen

Los módulos `rest/*` son envoltorios de funciones delgados sobre los location services de ArcGIS.

- **Problema que resuelve:** routing, geocoding, búsqueda de lugares y queries ad-hoc.
- **A quién sirve:** desarrolladores que integran location services.
- **Patrón que enseña:** `import * as <service>`; llama su función con una URL + params.
- **Qué NO cubre:** geoprocessing (ver `arcgis-spatial-analysis`) ni setup de auth (ver `arcgis-authentication`).

## Inicio Rápido

```typescript
import * as locator from "@arcgis/core/rest/locator.js";
const results = await locator.addressToLocations(geocodeUrl, { address: { SingleLine: "Bogotá" } });
```

## Árbol de Decisión

1. **¿Qué tarea?**
   - Dirección → coords → `locator.addressToLocations`.
   - Coords → dirección → `locator.locationToAddress`.
   - Direcciones → `route.solve` con `RouteParameters`.
   - Búsqueda de POI → módulo `places`.
   - Query de features standalone → `query.executeQueryJSON`.

2. **¿Servicio seguro/facturado?**
   - Sí → define `esriConfig.apiKey` o inicia sesión (ver `arcgis-authentication`).

**Default:** el módulo `rest/*` que corresponda a la tarea.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import * as route from "@arcgis/core/rest/route.js";
```

### Imports Dinámicos (CDN)

```javascript
const locator = await $arcgis.import("@arcgis/core/rest/locator.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// El componente arcgis-search envuelve locator/places para una UI lista.
import "@arcgis/map-components/components/arcgis-search";
```

## Conceptos Clave

### Concepto 1: Módulos de funciones

Cada servicio es un namespace de funciones (`route.solve`, `locator.addressToLocations`). Importa el
namespace y llama la función con la URL del servicio más un objeto de parámetros tipado.

### Concepto 2: Clases de parámetros

Algunos servicios usan clases de parámetros — ej. `RouteParameters` con un `stops` FeatureSet — para
expresar inputs complejos de forma limpia.

### Concepto 3: URLs de servicios mundiales + API key

Los servicios mundiales de route/geocode de Esri requieren un API key (o token). Define
`esriConfig.apiKey` antes de llamarlos; son facturados.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Llamar servicios mundiales sin API key

```typescript
// ❌ Anti-patrón
await route.solve(WORLD_ROUTE_URL, params); // 401 sin key
```

```typescript
// ✅ Correcto
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
await route.solve(WORLD_ROUTE_URL, params);
```

**Impacto:** la petición retorna 401/Unauthorized.

### Pitfall 2: Pasar arrays crudos donde se espera una clase de parámetros

```typescript
// ❌ Anti-patrón
route.solve(url, { stops: [[-74, 4.6], [-74.1, 4.7]] });
```

```typescript
// ✅ Correcto
const params = new RouteParameters({ stops: new FeatureSet({ features: stopGraphics }) });
route.solve(url, params);
```

**Impacto:** el servicio rechaza el input de stops mal formado.

### Pitfall 3: Usar esriRequest donde existe un helper tipado

```typescript
// ❌ Anti-patrón
await esriRequest(`${url}/solve?stops=...`); // hecho a mano, frágil
```

```typescript
// ✅ Correcto
await route.solve(url, params); // tipado, maneja tokens/formato
```

**Impacto:** URLs frágiles y manejo de token/formato ausente.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de route / locator / places / query | `references/api-detail.md` |
| Ejemplos de geocode / route / query | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-authentication` — API keys / OAuth para servicios
- `arcgis-spatial-analysis` — servicios de geoprocessing
- `arcgis-layers` — consulta capas directamente

## Samples de Referencia

- [Find route](https://developers.arcgis.com/javascript/latest/sample-code/sandbox/?sample=route-simple)
- [Geocoding](https://developers.arcgis.com/javascript/latest/sample-code/widgets-search-3d/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
