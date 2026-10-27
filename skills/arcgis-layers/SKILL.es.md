---
name: arcgis-layers
description: >
  Agrega y consulta capas de datos con el ArcGIS Maps SDK for JavaScript 5.1:
  FeatureLayer, GeoJSONLayer, CSVLayer, GraphicsLayer y TileLayer. Cubre
  queryFeatures con createQuery (que trae el definitionExpression; un where suelto
  lo pierde), el tope silencioso de maxRecordCount y exceededTransferLimit,
  paginación (start/num), outFields y los errores de carga. Usa esta skill cuando
  el usuario agregue datos a un mapa, consulte features, o filtre/cargue una capa.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: layers
tags:
  - featurelayer
  - geojson
  - query
  - graphicslayer
  - tilelayer
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Capas

> **Cuándo usar:** Activa esta skill cuando el usuario agregue datos a un mapa, ejecute una query
> de features, filtre con una definition expression, o cargue GeoJSON/CSV/graphics/tiles.

## Resumen

Las capas son los datos que pones en un mapa. Elige el tipo de capa según la fuente, y consulta y filtra en el
servidor.

- **Problema que resuelve:** cargar el tipo de capa correcto y leer sus features bien y con eficiencia.
- **A quién sirve:** desarrolladores que agregan datos operativos a un mapa o escena.
- **Patrón que enseña:** elegir la capa por la fuente, `createQuery()` para toda lectura, filtros en el servidor,
  paginación.
- **Qué NO cubre:** simbología (ver `arcgis-visualization`) ni capas 3D (ver `arcgis-3d-layers`).

## Inicio Rápido

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0", outFields: ["NAME", "POP"] });
map.add(layer);

const query = layer.createQuery(); // parte del definitionExpression de la capa
query.where = `(${query.where}) AND POP > 1000000`; // súmale condiciones, no lo reemplaces
query.outFields = ["NAME", "POP"];
const { features, exceededTransferLimit } = await layer.queryFeatures(query);
```

Medido con 5.1.27 en un servicio público de 3557 filas: `queryFeatures()` sin paginar devuelve **1000 filas** (el
`maxRecordCount` del servicio) y `exceededTransferLimit: true`, sin error.

## Árbol de Decisión

1. **¿Cuál es la fuente de datos?**
   - Feature service de ArcGIS → `FeatureLayer`.
   - Archivo/URL `.geojson` → `GeoJSONLayer` (WGS84; infiere el tipo de geometría y los campos).
   - `.csv` con coordenadas → `CSVLayer` (detecta nombres tipo `lat`/`lon`; otros nombres necesitan
     `latitudeField`/`longitudeField`).
   - Gráficos de cliente que dibujas → `GraphicsLayer`.
   - Teselas prerenderizadas → `TileLayer`.

2. **¿Leer features?**
   - Parte siempre de `layer.createQuery()` y súmale condiciones a su `where`.
   - Más filas que `maxRecordCount` → pagina con `start`/`num` + `orderByFields`, o cuenta primero con
     `queryFeatureCount`.

**Por defecto:** `FeatureLayer` + `createQuery()` para datos de servicio; `GraphicsLayer` para gráficos de cliente.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Query from "@arcgis/core/rest/support/Query.js";
```

### Imports dinámicos (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Las capas se siguen creando con la Core API y se agregan al mapa del componente.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: el definitionExpression vive en createQuery, no en queryFeatures

`definitionExpression` filtra lo que la capa **pinta**. En las consultas solo se aplica porque `createQuery()` lo
copia en `query.where`. Medido con `definitionExpression: "st = 'TX'"`: reemplazar `query.where` por
`"pop2000 > 500000"` contó 29 ciudades (todo el país); un objeto plano `{ where }` o `new Query()` dio los mismos 29;
`(${query.where}) AND pop2000 > 500000` dio las 6 correctas.

### Concepto 2: createQuery() vs new Query()

`createQuery()` arranca con `where` = el filtro de la capa (o `1=1`), `returnGeometry: true` y `outFields: ["*"]`,
aunque la capa tenga sus propios `outFields` (medido: volvieron los 6 campos). `new Query()` arranca con
`returnGeometry: false` y `outFields: null`: medido, geometría `null` y solo el campo de visualización. Los
`outFields` de la capa controlan lo que carga la **vista** para pintar, hit tests y popups, no lo que devuelve
`queryFeatures`.

### Concepto 3: el tope silencioso y la paginación

Una consulta devuelve como máximo `maxRecordCount` filas del servicio y marca `exceededTransferLimit: true`; nada
lanza error. Pagina con `start`/`num` y un `orderByFields` estable (medido: página 1 New York, Los Angeles, Chicago;
página 2 Houston, Philadelphia, Phoenix), o cuenta primero con `queryFeatureCount`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Reemplazar el where que trae el filtro de la capa

```typescript
// ❌ Anti-patrón
const layer = new FeatureLayer({ url, definitionExpression: "st = 'TX'" });
const q = layer.createQuery();
q.where = "pop2000 > 500000"; // el filtro de TX desaparece
```

```typescript
// ✅ Correcto
const q = layer.createQuery();
q.where = `(${q.where}) AND pop2000 > 500000`;
```

**Impacto:** medido: 29 resultados en vez de 6. El mapa muestra solo Texas, mientras la lista, el conteo y la
exportación cubren todo el país.

### Pitfall 2: Filtrar en el cliente lo que el servidor cortó

```typescript
// ❌ Anti-patrón
const all = await layer.queryFeatures();
const capitals = all.features.filter((f) => f.attributes.capital === "Y");
```

```typescript
// ✅ Correcto
const q = layer.createQuery();
q.where = "capital = 'Y'";
const { features } = await layer.queryFeatures(q);
```

**Impacto:** medido: la consulta sin filtro se detuvo en 1000 de 3557 filas (`exceededTransferLimit: true`), así que
el filtro en el cliente encontró **11** capitales; el `where` en el servidor encontró las **51**. No es solo lento:
da un resultado equivocado.

### Pitfall 3: Armar un `new Query()` y esperar geometría

```typescript
// ❌ Anti-patrón
const q = new Query({ where: "1=1", num: 10 }); // returnGeometry false, outFields null
const { features } = await layer.queryFeatures(q);
view.goTo(features); // la geometría es null
```

```typescript
// ✅ Correcto
const q = layer.createQuery(); // returnGeometry true; o pon q.returnGeometry = true y q.outFields
q.num = 10;
```

**Impacto:** medido: `geometry === null` y los atributos solo traían el campo de visualización.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de Layer + Query | `references/api-detail.md` |
| Ejemplos de GeoJSON, CSV, query | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-core-maps` — el mapa/vista donde van las capas
- `arcgis-visualization` — simboliza las capas
- `arcgis-3d-layers` — tipos de capa 3D

## Samples de Referencia

- [intro-feature-layer](https://developers.arcgis.com/javascript/latest/sample-code/layers-featurelayer/)
- [GeoJSONLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-geojson/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Medido en `tests/runtime/casos/arcgis-layers.ts` sobre un servicio público de
  3557 filas. Nuevo pitfall principal: reemplazar `createQuery().where` pierde el `definitionExpression` de la capa
  (29 resultados en vez de 6). El inicio rápido usaba `outFields: ["*"]` contra su propio consejo. El viejo pitfall 3
  ("returnGeometry varía") ahora es preciso: `createQuery()` es `true`, `new Query()` es `false`. Filtrar en el cliente
  queda demostrado como incorrecto, no solo lento (tope de 1000 filas: 11 capitales en vez de 51). Los `outFields`
  de la capa no limitan `queryFeatures`.
- **0.1.0** (2026-05-31): Versión inicial.
