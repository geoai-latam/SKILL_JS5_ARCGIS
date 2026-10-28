---
name: arcgis-parquet
description: >
  Carga archivos Parquet y GeoParquet en un mapa con ParquetLayer en el ArcGIS Maps SDK
  for JavaScript 5.1 (beta): data con ParquetFilesData (varios archivos) o
  ParquetPortalItemData, geometryEncoding para GeoParquet, WKB o columnas x/y, y el
  spatialReference y el geometryType que necesita un archivo sin metadato GeoParquet
  (sin ellos no se dibuja nada y no hay error). Cubre el tope silencioso de 8000 filas
  por consulta, lo que debe cumplir el servidor (HEAD, Range, CORS) y lo que la capa no
  hace (editar, 3D). Usa esta skill cuando el usuario cargue un .parquet o un GeoParquet.
lang: es
version: 0.1.0
status: beta
sdk_version: ">=5.1 <6.0"
created: 2026-10-28
updated: 2026-10-28
category: layers
tags:
  - parquet
  - geoparquet
  - parquetlayer
  - wkb
  - big-data
requires:
  - arcgis-core-maps
  - arcgis-layers
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Capas Parquet

> **Cuándo usar:** Activa esta skill cuando el usuario ponga un `.parquet` o un GeoParquet en un mapa, lo
> consulte, o pregunte por qué una capa Parquet carga pero no muestra nada.

## Resumen

`ParquetLayer` lee archivos Apache Parquet en el navegador (con un lector en WebAssembly) y dibuja sus filas como
features en una vista 2D. Es **beta** desde 4.33; 4.34 agregó `geometryEncoding`, `isTable`, `queryFeatures` y
`queryObjectIds`, y 5.1 cambió `urls` por `data` y agregó los portal items, `definitionExpression` y
`createQuery()`.

- **Problema que resuelve:** mostrar cientos de miles de filas de un archivo columnar sin un feature service.
- **A quién sirve:** desarrolladores con datos columnares exportados desde DuckDB, GeoPandas, BigQuery o ArcGIS.
- **Patrón que enseña:** elegir la codificación según lo que trae el archivo, declarar lo que no trae y revisar
  el servidor.
- **Qué NO cubre:** las consultas en general (ver `arcgis-layers`) ni los renderers (ver `arcgis-visualization`).

## Inicio Rápido

```typescript
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";

// GeoParquet (con metadato "geo") o columnas llamadas lon/lat, lng/lat, x/y…: se detectan al cargar.
const layer = new ParquetLayer({
  data: new ParquetFilesData({
    urls: ["https://jsapi.maps.arcgis.com/sharing/rest/content/items/6ab6f959c1684eb5a54db91644a89747/data"],
  }),
  title: "Pozos de agua de Kansas",
});
map.add(layer);
await layer.load();
console.log(layer.isTable, layer.geometryType, layer.geometryEncoding?.type); // false "point" "location"
```

Medido con 5.1.27 sobre el archivo del sample de Esri (310 702 filas, 56 MB): carga sin iniciar sesión, detecta sus
columnas `lng`/`lat` y dibuja los 310 702 puntos en un `MapView`.

## Árbol de Decisión

1. **¿Qué trae el archivo?**
   - Metadato GeoParquet `geo` → no hay que declarar nada: lee la codificación, el `geometryType`, la SR y el
     `fullExtent`.
   - Columnas de coordenadas llamadas `lon/lat`, `lng/lat`, `long/lat`, `longitude/latitude`, `x/y`,
     `xcenter/ycenter`, `point-x/point-y`… (sin importar mayúsculas) → se detectan.
   - Columnas de coordenadas con otro nombre (`coord_x`, `este`…) → `GeometryEncodingLocation` **más**
     `geometryType: "point"` **más** `spatialReference`.
   - Una columna WKB sin metadato `geo` → `GeometryEncodingWkb({ field })` **más** `geometryType` **más**
     `spatialReference`.
   - Sin geometría → carga como tabla (`isTable: true`); úsala en `map.tables` o en una tabla de features.

2. **¿Dónde está el archivo?**
   - URLs que controlas → `ParquetFilesData({ urls })`; varios archivos con el **mismo esquema** se suman.
   - Un ítem de ArcGIS Online de tipo Apache Parquet → `ParquetPortalItemData({ portalItem: { id } })`.
   - Un archivo que elige el usuario → `URL.createObjectURL(file)` como URL (medido: funciona).

3. **¿Qué vista?** Solo `MapView` / `<arcgis-map>`. En un `SceneView` la vista de la capa se rechaza.

**Por defecto:** `ParquetFilesData` con GeoParquet en EPSG:4326, Snappy o GZIP.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";
import ParquetPortalItemData from "@arcgis/core/layers/support/ParquetPortalItemData.js";
import GeometryEncodingWkb from "@arcgis/core/layers/support/GeometryEncodingWkb.js";
import GeometryEncodingLocation from "@arcgis/core/layers/support/GeometryEncodingLocation.js";
import { getParquetLayerInfo } from "@arcgis/core/layers/support/parquetUtils.js";
```

La clase que la documentación llama `ParquetGeometryEncodingWkb` no existe como módulo: es `GeometryEncodingWkb`.

### Imports dinámicos (CDN)

```javascript
const [ParquetLayer, ParquetFilesData] = await $arcgis.import([
  "@arcgis/core/layers/ParquetLayer.js",
  "@arcgis/core/layers/support/ParquetFilesData.js",
]);
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// La capa es de la Core API; agrégala al mapa del componente. Solo 2D: <arcgis-map>, no <arcgis-scene>.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: `data` reemplazó a `urls` en 5.1

`data` recibe un `ParquetFilesData` (una o varias URLs) o un `ParquetPortalItemData`. El viejo `urls` sigue
funcionando, pero está `@deprecated` desde 5.1 y deja un aviso en la consola. Varios archivos se leen como una sola
capa; los campos salen del **primer** archivo, así que tienen que compartir esquema (ver pitfalls).
`getParquetLayerInfo(data)` devuelve los campos, la codificación, el tipo de geometría y la SR que infiere del
primer archivo, listos para pasarlos a `new ParquetLayer(info)`.

### Concepto 2: `geometryEncoding` y las dos propiedades que lo acompañan

Con metadato GeoParquet todo se detecta. Sin él, `geometryEncoding` solo no alcanza:

| Lo declarado | Resultado medido (5.1.27) |
|---|---|
| nada (WKB o x/y con otro nombre) | carga como tabla, `isTable: true`, sin error |
| solo la codificación, polígonos | `geometryType` queda en `"point"`, geometría `null` |
| codificación + `geometryType`, sin `spatialReference` | geometría `null`, la vista no dibuja nada, sin error |
| codificación + `geometryType` + `spatialReference` | correcto |

`layer.spatialReference` dice `4326` por defecto aunque no la hayas puesto, así que revisarla no prueba nada:
ponla. Solo se admiten WGS84 y Web Mercator; un archivo proyectado (EPSG:9377, UTM) se rechaza en `load()`.

### Concepto 3: las consultas corren en el cliente, con un tope

`queryFeatures`, `queryFeatureCount`, `queryObjectIds`, `queryExtent`, `orderByFields` y `outStatistics`
funcionan (medido). Dos cosas cambian frente a un feature service: una consulta devuelve como máximo **8000**
filas (`capabilities.query.maxRecordCount`) con `exceededTransferLimit: false`, y los valores del `where`
**distinguen mayúsculas** (`'constructed'` dio 0 de 244 149; `UPPER(STATUS) = 'CONSTRUCTED'` funciona).

### Concepto 4: el servidor tiene que responder HEAD y Range, con CORS

El lector pide `HEAD` para saber el tamaño y después lee pedazos de 64 KB con `Range` (`206`). Un servidor sin
CORS, uno que ignora `Range` (responde `200` con el archivo entero), uno que rechaza `HEAD` y un 404 hacen que
`load()` se rechace con el mismo mensaje: `Failed to parse file`. La URL `/data` de un ítem de ArcGIS Online y el
servidor de desarrollo de Vite cumplen (medido); revisa cualquier otro servidor antes de culpar al archivo. La
compresión tiene que ser ninguna, Snappy o GZIP (ZSTD se rechaza).

### Concepto 5: lo que la capa no hace

- **No edita:** no tiene `applyEdits` y `capabilities.operations.supportsEditing` es `false`.
- **No va en 3D:** `SceneView.whenLayerView()` se rechaza con "layerview creation failed".
- **Es beta:** `ParquetLayer`, `ParquetFilesData`, `ParquetPortalItemData` y `GeometryEncodingWkb` son `@beta`;
  fija la versión del SDK y vuelve a probar al actualizar.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Declarar la codificación pero no la referencia espacial

```typescript
// ❌ Anti-patrón
const layer = new ParquetLayer({
  data: new ParquetFilesData({ urls: ["https://example.com/estaciones.parquet"] }),
  geometryEncoding: new GeometryEncodingLocation({ xField: "coord_x", yField: "coord_y" }),
  geometryType: "point", // sin spatialReference: "por defecto es WGS84"
});
```

```typescript
// ✅ Correcto
const layer = new ParquetLayer({
  data: new ParquetFilesData({ urls: ["https://example.com/estaciones.parquet"] }),
  geometryEncoding: new GeometryEncodingLocation({ xField: "coord_x", yField: "coord_y" }), // x = longitud
  geometryType: "point",
  spatialReference: { wkid: 4326 },
});
```

**Impacto:** medido: `load()` resuelve, la vista de la capa se crea, todas las geometrías son `null` y no se dibuja
nada; ningún error en ninguna parte. Con una columna WKB pasa lo mismo. Poner `spatialReference` arregla los dos.

### Pitfall 2: Confiar en `exceededTransferLimit`

```typescript
// ❌ Anti-patrón
const { features, exceededTransferLimit } = await layer.queryFeatures({ where: "1=1", outFields: ["DEPTH"] });
if (!exceededTransferLimit) exportAll(features); // 8000 de 310 702 filas
```

```typescript
// ✅ Correcto
const total = await layer.queryFeatureCount();
const size = layer.capabilities?.query?.maxRecordCount ?? 8000;
for (let start = 0; start < total; start += size) {
  const q = layer.createQuery();
  q.start = start;
  q.num = size;
  const { features } = await layer.queryFeatures(q);
  exportAll(features);
}
```

**Impacto:** medido sobre 310 702 filas: 8000 features y `exceededTransferLimit: false`, también con `num: 20000`.
La paginación funciona (`start: 310000` devolvió las últimas 702). Para totales, mejor `outStatistics` que bajar
filas.

### Pitfall 3: Depurar el archivo cuando el problema es el servidor

```typescript
// ❌ Anti-patrón
await layer.load(); // "Failed to parse file" → reexportar el parquet, probar otra compresión…
```

```typescript
// ✅ Correcto
const url = "https://example.com/data.parquet";
const head = await fetch(url, { method: "HEAD" });
const piece = await fetch(url, { headers: { Range: "bytes=0-3" } });
console.log(head.ok, head.headers.get("content-length"), piece.status); // true, tamaño, 206
```

**Impacto:** medido: un 404, la falta de CORS, de `Range` o de `HEAD` dan todos `Failed to parse file`. Un problema
real del formato lo dice (`Compression codec zstd is unsupported…`, `Only WGS84 and Web Mercator are supported`).

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de ParquetLayer, data y codificaciones | `references/api-detail.md` |
| GeoParquet, WKB, x/y, portal item, archivo local, paginación | `references/examples.md` |
| Más pitfalls (12, medidos) y lo que no se midió | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-layers` — consultas, `createQuery` y paginación en cualquier capa de features
- `arcgis-visualization` — renderers para la capa
- `arcgis-tables-forms` — mostrar un Parquet sin geometría (`isTable`) en una tabla
- `arcgis-core-maps` — el `MapView` que la capa necesita

## Samples de Referencia

- [Intro to ParquetLayer](https://developers.arcgis.com/javascript/latest/sample-code/layers-parquetlayer/)
- [Referencia de la API de ParquetLayer](https://developers.arcgis.com/javascript/latest/references/core/layers/ParquetLayer/)

## Changelog

- **0.1.0** (2026-10-28): Primera versión, SDK 5.1.27. Cada afirmación se ejecutó en
  `tests/runtime/casos/arcgis-parquet.ts` (32 comprobaciones) contra el archivo público del sample de Esri y
  archivos GeoParquet/WKB/x-y generados: el `spatialReference` faltante que no dibuja nada, el tope de 8000 filas
  sin `exceededTransferLimit`, los valores que distinguen mayúsculas, los esquemas mezclados, las fechas en µs y lo
  que debe cumplir el servidor.
