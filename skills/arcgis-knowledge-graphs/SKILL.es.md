---
name: arcgis-knowledge-graphs
description: >
  Consulta grafos de conocimiento de ArcGIS con el ArcGIS Maps SDK for JavaScript
  5.1: fetchKnowledgeGraph para el modelo de datos, executeQueryStreaming con
  instancias de GraphQuery y bindParameters (openCypher), leer las filas del
  stream, la geometría dentro de las propiedades de la entidad, y mostrar
  resultados con KnowledgeGraphLayer, LinkChartLayer y arcgis-link-chart. Usa esta
  skill cuando el usuario se conecte a un grafo de conocimiento, corra una consulta
  de grafo, o explore entidades y sus relaciones.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: specialized
tags:
  - knowledge-graph
  - cypher
  - entities
  - relationships
  - link-chart
requires:
  - arcgis-authentication
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Knowledge Graphs

> **Cuándo usar:** Activa esta skill cuando el usuario se conecte a un knowledge graph, corra una
> query de grafo, o explore entidades y relaciones.

## Resumen

Un grafo de conocimiento guarda entidades y relaciones; se consulta con el openCypher de Esri.

- **Problema que resuelve:** consultar datos conectados, no tabulares, y ponerlos en un mapa o en un link chart.
- **A quién sirve:** desarrolladores de apps de investigación y análisis de vínculos sobre ArcGIS Enterprise u
  Online.
- **Patrón que enseña:** iniciar sesión, traer el grafo, hacer una consulta streaming con parámetros, leer filas,
  pintar.
- **Qué NO cubre:** feature layers (ver `arcgis-layers`) ni la configuración de auth (ver `arcgis-authentication`).

> Nota de validación: todos los grafos públicos de ejemplo piden token, y la validación nunca inicia sesión, así que
> las consultas **no** se corrieron contra un grafo vivo. Lo medido está marcado como medido; lo demás sale de los
> tipos y la documentación de 5.1.

## Inicio Rápido

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
import GraphQueryStreaming from "@arcgis/core/rest/knowledgeGraph/GraphQueryStreaming.js";

const graph = await knowledgeGraphService.fetchKnowledgeGraph(url); // inicia sesión antes si está protegido
const result = await knowledgeGraphService.executeQueryStreaming(graph, new GraphQueryStreaming({
  openCypherQuery: "MATCH (s:Supplier) WHERE s.Name = $name RETURN s LIMIT 100",
  bindParameters: { name: "Supplier 5" },
}));
const reader = result.resultRowsStream.getReader();
for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
  for (const row of chunk.value) console.log(row[0]); // una fila es un array, un ítem por valor del RETURN
}
```

## Árbol de Decisión

1. **¿Conectarse?**
   - Grafo protegido (casi siempre) → configura la auth primero (`arcgis-authentication`), luego
     `fetchKnowledgeGraph(url)`.

2. **¿Consultar?**
   - Por defecto → `executeQueryStreaming` con `new GraphQueryStreaming({ openCypherQuery, bindParameters })`.
   - Búsqueda de texto completo → `executeSearchStreaming`.
   - Consulta pequeña y fija, aceptando el tope de `maxRecordCount` → `executeQuery` con `new GraphQuery(...)`.

3. **¿Mostrar resultados?**
   - Entidades con geometría en un mapa → `KnowledgeGraphLayer` (acótala con `inclusionModeDefinition`).
   - Relaciones → `LinkChartLayer` en un `WebLinkChart`, pintado por `arcgis-link-chart`.

**Por defecto:** traer el grafo y luego consulta streaming con parámetros.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
import GraphQueryStreaming from "@arcgis/core/rest/knowledgeGraph/GraphQueryStreaming.js";
import KnowledgeGraphLayer from "@arcgis/core/layers/KnowledgeGraphLayer.js";
```

### Imports dinámicos (CDN)

```javascript
const kg = await $arcgis.import("@arcgis/core/rest/knowledgeGraphService.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-link-chart"; // registrado en 5.1 (medido)
```

## Conceptos Clave

### Concepto 1: traer el grafo (y su modelo de datos)

`fetchKnowledgeGraph(url)` devuelve un `KnowledgeGraph` con `url`, `dataModel` (tipos de entidad y de relación, sus
propiedades, la referencia espacial) y `serviceDefinition` (con `maxRecordCount`). Los nombres de tipos y
propiedades del openCypher tienen que coincidir exactamente con el modelo de datos. No tiene `id`: el ejemplo viejo
que imprimía `graph.id` no compila en 5.1.

### Concepto 2: consultas streaming con parámetros

`executeQueryStreaming` devuelve `resultRowsStream`, un `ReadableStream` cuyos bloques son arrays de filas. Según la
documentación de 5.1 devuelve **todas** las coincidencias, más allá de `maxRecordCount`, mientras que
`executeQuery` se detiene en ese tope. Los valores van en `bindParameters` (`$name` en la consulta): textos, listas
de ids y geometrías (medido: un `Polygon` se conserva como geometría para
`esri.graph.ST_Intersects($zona, s.shape)`), nunca concatenados en el texto de la consulta. Pasa una instancia de la
clase: los tipos de 5.1 rechazan un objeto plano `{ openCypherQuery }` en `executeQuery`.

### Concepto 3: entidades, relaciones, geometría

Cada ítem de una fila es un `Entity`, `Relationship`, `Path` o un valor simple. Una entidad tiene `typeName`, `id` y
`properties`; **la geometría es una de las propiedades** (medido: `"geometry" in entity === false`; el punto estaba
en `entity.properties.shape`). El nombre de la propiedad sale del modelo de datos: la que tiene
`fieldType` `"esriFieldTypeGeometry"`.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Leer `entity.geometry`

```typescript
// ❌ Anti-patrón
entities.forEach((e) => graphicsLayer.add(new Graphic({ geometry: e.geometry }))); // Entity no tiene campo geometry
```

```typescript
// ✅ Correcto
const type = graph.dataModel.entityTypes.find((t) => t.name === "Supplier");
const shape = type?.properties.find((p) => p.fieldType === "esriFieldTypeGeometry")?.name;
entities.forEach((e) => { if (shape && e.properties[shape]) graphicsLayer.add(new Graphic({ geometry: e.properties[shape] })); });
```

**Impacto:** medido sobre un `Entity` armado como lo devuelve el servicio: `geometry` no es un miembro y todos los
graphics salen vacíos, sin error.

### Pitfall 2: Traer un grafo protegido sin iniciar sesión

```typescript
// ❌ Anti-patrón
const graph = await knowledgeGraphService.fetchKnowledgeGraph(securedUrl); // sin auth configurada
```

```typescript
// ✅ Correcto
// Registra OAuthInfo o un token en IdentityManager primero (ver arcgis-authentication),
// o carga con un KnowledgeGraphLayer y pásale un AbortSignal para que la UI pueda rendirse.
```

**Impacto:** medido sobre el grafo público de ejemplo de Esri (499 "Token Required"): la promesa **no** se rechazó.
A los 15 s seguía pendiente, con el diálogo de inicio de sesión del SDK en el DOM. `fetchKnowledgeGraph(url)` no
recibe `signal`; `KnowledgeGraphLayer.load({ signal })` sí abortó limpio (`AbortError`).

### Pitfall 3: Armar consultas concatenando texto, o usar `executeQuery` para conjuntos grandes

```typescript
// ❌ Anti-patrón
await knowledgeGraphService.executeQuery(graph, new GraphQuery({
  openCypherQuery: `MATCH (s:Supplier) WHERE s.Name = '${userInput}' RETURN s`,
})); // inyectable, y con tope en maxRecordCount
```

```typescript
// ✅ Correcto
await knowledgeGraphService.executeQueryStreaming(graph, new GraphQueryStreaming({
  openCypherQuery: "MATCH (s:Supplier) WHERE s.Name = $name RETURN s",
  bindParameters: { name: userInput },
}));
```

**Impacto:** el texto del usuario puede reescribir la consulta; según la documentación, `executeQuery` devuelve en
silencio como máximo `serviceDefinition.maxRecordCount` filas (no medido: no hubo grafo accesible).

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de knowledgeGraphService | `references/api-detail.md` |
| Ejemplos de query + visualización | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-authentication` — los grafos suelen estar protegidos
- `arcgis-layers` — grafica entidades con geometría
- `arcgis-interaction` — selecciona nodos/aristas

## Samples de Referencia

- [Query a knowledge graph](https://developers.arcgis.com/javascript/latest/sample-code/knowledgegraph-query/)
- [knowledgeGraphService](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-knowledgeGraphService.html)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1, validación parcial: los grafos públicos piden token y la validación nunca inicia
  sesión. Medido en `tests/runtime/casos/arcgis-knowledge-graphs.ts`: la geometría de una entidad vive en
  `properties`, no en `entity.geometry` (el código del viejo pitfall 2 no devolvía nada); un grafo protegido deja
  `fetchKnowledgeGraph` pendiente detrás del diálogo de inicio de sesión en vez de un 403. Se arreglaron los ejemplos
  que no compilaban (`graph.id`, `{ openCypherQuery }` plano), el streaming con `bindParameters` quedó por defecto, y
  tres pitfalls vacíos (solo comentarios: "haz streaming", "no mezcles ids") se cambiaron por KnowledgeGraphLayer,
  LinkChartLayer y `arcgis-link-chart`.
- **0.1.0** (2026-05-31): Versión inicial.
