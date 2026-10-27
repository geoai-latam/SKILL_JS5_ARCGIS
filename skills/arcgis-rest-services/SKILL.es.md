---
name: arcgis-rest-services
description: >
  Llama los location services de ArcGIS con los módulos rest del ArcGIS Maps SDK
  for JavaScript 5.1: route (direcciones), locator (geocodificación), places
  (búsqueda de lugares) y queries sueltas contra feature services. Cubre qué pasa
  sin API key (un diálogo de inicio de sesión y una promesa que nunca se resuelve,
  no un 401), las paradas de una ruta como FeatureSet o Collection<Stop> y los
  resultados silenciosos de una query (0 features en la raíz del servicio, tope de
  1000 filas, sin geometría por defecto). Usa esta skill cuando el usuario
  geocodifique una dirección, calcule una ruta, busque lugares o haga una query
  suelta contra un endpoint REST.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Servicios REST

> **Cuándo usar:** Activa esta skill cuando el usuario geocodifique, rutee, busque lugares, o corra
> una query REST standalone.

## Resumen

Los módulos `rest/*` son envoltorios de funciones sobre los location services y los feature services de ArcGIS.

- **Problema que resuelve:** routing, geocoding, búsqueda de lugares y queries ad-hoc.
- **A quién sirve:** desarrolladores que integran location services.
- **Patrón que enseña:** `import * as <service>`; llama su función con una URL + un objeto de parámetros tipado.
- **Qué NO cubre:** geoprocessing (ver `arcgis-spatial-analysis`) ni setup de auth (ver `arcgis-authentication`).

## Inicio Rápido

```typescript
import esriConfig from "@arcgis/core/config.js";
import * as locator from "@arcgis/core/rest/locator.js";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string; // antes de la primera llamada
const GEOCODE_URL = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
const candidates = await locator.addressToLocations(GEOCODE_URL, {
  address: { SingleLine: "Plaza de Bolívar, Bogotá" },
  maxLocations: 3,
  outFields: ["Addr_type", "City", "Country"], // sin esto, attributes llega vacío
});
const best = candidates[0]; // undefined si nada coincide
```

## Árbol de Decisión

1. **¿Qué tarea?**
   - Dirección → coordenadas → `locator.addressToLocations`.
   - Coordenadas → dirección → `locator.locationToAddress`.
   - Direcciones de ruta → `route.solve(url, new RouteParameters({ stops }))`, con `stops` un `FeatureSet` o una
     `Collection<Stop>`.
   - Búsqueda de lugares → `places.queryPlacesNearPoint(new PlacesQueryParameters({ point, searchText }))` (sin
     argumento de URL).
   - Query suelta → `query.executeQueryJSON(layerUrl, query)`, con el índice de la capa en la URL.

2. **¿Servicio mundial de Esri (geocode-api, route-api, places-api)?**
   - Sí → pon `esriConfig.apiKey` primero (o inicia sesión, ver `arcgis-authentication`).

**Por defecto:** el módulo `rest/*` que corresponde a la tarea.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import * as route from "@arcgis/core/rest/route.js";
```

### Imports dinámicos (CDN)

```javascript
const locator = await $arcgis.import("@arcgis/core/rest/locator.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// El componente arcgis-search envuelve locator/places con una UI lista.
import "@arcgis/map-components/components/arcgis-search";
```

## Conceptos Clave

### Concepto 1: módulos de funciones

Cada servicio es un namespace de funciones (`route.solve`, `locator.addressToLocations`). Importa el namespace y
llama la función con la URL del servicio más un objeto de parámetros. `places` es la excepción: sus funciones solo
reciben los parámetros y usan el servicio de lugares de Esri.

### Concepto 2: clases de parámetros

`route.solve` necesita un `RouteParameters` de verdad, y sus `stops` un `FeatureSet` de graphics de punto o una
`Collection<Stop>`. Medido en un servicio de rutas público: los dos resolvieron (una polilínea, `Total_TravelTime`
14.79 min). Con `returnDirections: true` y `directionsLanguage: "es"` devolvió 12 maniobras, empezando por
`Salga desde Location 1`; por defecto no trae ninguna.

### Concepto 3: los resultados llegan en WGS84, y está bien

Los resultados del geocoder llegaron con `wkid` 4326. Agregado a una vista Web Mercator, el punto cayó en (200, 157)
de una vista de 400×300 centrada en él: la vista reproyecta WGS84 al vuelo. Pide `outSpatialReference` solo cuando
vayas a hacer cuentas en las coordenadas de la vista.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Llamar un servicio mundial sin API key

```typescript
// ❌ Anti-patrón
await route.solve(WORLD_ROUTE_URL, params); // sin esriConfig.apiKey
```

```typescript
// ✅ Correcto
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
await route.solve(WORLD_ROUTE_URL, params);
```

**Impacto:** medido en `geocode-api`, `route-api` y `places`: ni 401 ni rechazo. El IdentityManager disparó
`dialog-create`, se abrió un `calcite-dialog` de inicio de sesión y la promesa se quedó pendiente; el `catch` nunca
corre.

### Pitfall 2: Paradas crudas o un objeto plano de parámetros

```typescript
// ❌ Anti-patrón
route.solve(url, { stops: [[-74.08, 4.6], [-74.05, 4.65]] } as never);
```

```typescript
// ✅ Correcto
const params = new RouteParameters({ stops: new FeatureSet({ features: stopGraphics }) });
route.solve(url, params);
```

**Impacto:** medido: tanto un array de coordenadas en `stops` como un objeto plano en vez de `RouteParameters`
fallaron antes de cualquier pedido con `TypeError: t.toJSON is not a function`, un error que no dice qué está mal.

### Pitfall 3: Consultar la raíz del servicio en vez de una capa

```typescript
// ❌ Anti-patrón
await query.executeQueryJSON(MAPSERVER_URL, { where: "1=1" });
```

```typescript
// ✅ Correcto
await query.executeQueryJSON(`${MAPSERVER_URL}/0`, { where: "pop2000 > 1000000", outFields: ["areaname"] });
```

**Impacto:** medido: la raíz devolvió **0 features y ningún error**; `/0` devolvió 9. En la capa, `where: "1=1"`
trajo 1000 de 3557 filas (`exceededTransferLimit: true`), y los features no traían geometría sin
`returnGeometry: true`.

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

- **0.2.0** (2026-10-27): SDK 5.1. Medido en `tests/runtime/casos/arcgis-rest-services.ts` (servicios públicos, sin
  API key). El "401 sin key" de antes era falso: el SDK abre un diálogo de inicio de sesión y la promesa nunca se
  resuelve. Una query a la raíz del servicio devuelve 0 features en vez de fallar. Las paradas crudas fallan con un
  TypeError opaco de `toJSON`. Se quitó el pitfall falso de "los resultados WGS84 caen corridos" y tres que eran
  solo comentarios (cuotas, CORS, esriRequest); se agregaron otros medidos de direcciones, outFields, búsquedas sin
  coincidencias, returnGeometry y el tope de 1000 filas. `places` no recibe URL.
- **0.1.0** (2026-05-31): Versión inicial.
