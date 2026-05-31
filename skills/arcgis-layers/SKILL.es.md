---
name: arcgis-layers
description: >
  Agrega y consulta capas de datos con el ArcGIS Maps SDK for JavaScript 5.0:
  FeatureLayer, GeoJSONLayer, CSVLayer, GraphicsLayer y TileLayer. Cubre
  queryFeatures con QueryParameters, paginación (start/num), outFields,
  definitionExpression y carga diferida. Usa esta skill cuando el usuario agregue
  datos a un mapa, consulte features, o filtre/cargue una capa.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Capas

> **Cuándo usar:** Activa esta skill cuando el usuario agregue datos a un mapa, ejecute una query
> de features, filtre con una definition expression, o cargue GeoJSON/CSV/graphics/tiles.

## Resumen

Las capas son los datos que pones en un mapa. Elige el tipo de capa por su fuente, luego consúltala/filtra.

- **Problema que resuelve:** cargar el tipo de capa correcto y leer sus features eficientemente.
- **A quién sirve:** desarrolladores que agregan datos operativos a un mapa o escena.
- **Patrón que enseña:** elección de capa por fuente, query del lado servidor, filtrar antes de dibujar.
- **Qué NO cubre:** simbología (ver `arcgis-visualization`) ni capas 3D (ver `arcgis-3d-layers`).

## Inicio Rápido

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
const layer = new FeatureLayer({ url: "https://.../FeatureServer/0", outFields: ["*"] });
map.add(layer);
```

## Árbol de Decisión

1. **¿Cuál es la fuente de datos?**
   - Servicio de features hosted/ArcGIS → `FeatureLayer`.
   - Archivo/URL `.geojson` → `GeoJSONLayer`.
   - `.csv` con lat/lon → `CSVLayer`.
   - Gráficos del lado cliente que dibujas → `GraphicsLayer`.
   - Tiles pre-renderizados → `TileLayer`.

2. **¿Necesitas atributos de vuelta de una query?**
   - Sí → define `outFields` y usa `queryFeatures`.

**Default:** `FeatureLayer` para datos de servicio; `GraphicsLayer` para gráficos ad-hoc.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
```

### Imports Dinámicos (CDN)

```javascript
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Las capas se crean con la Core API y luego se agregan al map del componente.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: outFields y definitionExpression

`outFields` controla qué atributos se traen (usa `["*"]` con moderación). `definitionExpression`
es un filtro SQL del lado servidor para que solo se pidan las features que cumplen.

### Concepto 2: Consultar con paginación

`layer.createQuery()` retorna un `Query`. Define `where`, `orderByFields`, `returnGeometry`, y
pagina con `start`/`num`. `await layer.queryFeatures(query)` resuelve a un `FeatureSet`.

### Concepto 3: Carga diferida y visibilidad

Las capas cargan al agregarse a un map/view ya cargado. Usa `visible: false` (o límites de escala)
para diferir el dibujo. `await layer.load()` fuerza la metadata sin renderizar.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Pedir todos los campos por defecto

```typescript
// ❌ Anti-patrón
const layer = new FeatureLayer({ url, outFields: ["*"] }); // trae todos los atributos
```

```typescript
// ✅ Correcto
const layer = new FeatureLayer({ url, outFields: ["OBJECTID", "NAME", "POP"] });
```

**Impacto:** payloads más grandes y dibujos más lentos en tablas anchas.

### Pitfall 2: Filtrar en cliente en vez del servidor

```typescript
// ❌ Anti-patrón
const all = await layer.queryFeatures();
const open = all.features.filter((f) => f.attributes.STATUS === "open");
```

```typescript
// ✅ Correcto
const q = layer.createQuery();
q.where = "STATUS = 'open'";
const { features } = await layer.queryFeatures(q);
```

**Impacto:** el cliente descarga todo y luego desecha la mayoría.

### Pitfall 3: Leer geometría sin pedirla

```typescript
// ❌ Anti-patrón
const q = layer.createQuery(); // returnGeometry varía por defecto
const { features } = await layer.queryFeatures(q);
features[0].geometry; // puede ser null
```

```typescript
// ✅ Correcto
const q = layer.createQuery();
q.returnGeometry = true;
const { features } = await layer.queryFeatures(q);
```

**Impacto:** `geometry` es `null`, así que resaltar/zoom-to en el mapa falla.

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

- **0.1.0** (2026-05-31): Versión inicial.
