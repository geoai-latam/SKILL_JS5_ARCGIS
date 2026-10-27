---
name: arcgis-knowledge-graphs
description: >
  Query ArcGIS Knowledge graphs with the ArcGIS Maps SDK for JavaScript 5.1:
  fetchKnowledgeGraph for the data model, executeQueryStreaming with GraphQuery
  instances and bindParameters (openCypher), reading rows from the stream,
  geometry inside entity properties, and showing results with KnowledgeGraphLayer,
  LinkChartLayer and arcgis-link-chart. Use this skill whenever the user connects
  to a knowledge graph, runs a graph query, or explores entities and their
  relationships.
lang: en
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

> **When to use:** Activate this skill whenever the user connects to a knowledge graph, runs a graph
> query, or explores entities and relationships.

## Overview

A knowledge graph stores entities and relationships; you query it with Esri's openCypher.

- **Problem it solves:** querying connected, non-tabular data and putting it on a map or a link chart.
- **Who it serves:** developers building investigative and link-analysis apps on ArcGIS Enterprise or Online.
- **Pattern it teaches:** sign in, fetch the graph, stream a bound query, read rows, render.
- **What it does NOT cover:** feature layers (see `arcgis-layers`) or auth setup (see `arcgis-authentication`).

> Validation note: every public sample graph asks for a token, and the validation never signs in, so queries were
> **not** run against a live graph. What is measured is marked as measured; the rest comes from the 5.1 typings and
> docs.

## Quick Start

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
import GraphQueryStreaming from "@arcgis/core/rest/knowledgeGraph/GraphQueryStreaming.js";

const graph = await knowledgeGraphService.fetchKnowledgeGraph(url); // sign in first if it is secured
const result = await knowledgeGraphService.executeQueryStreaming(graph, new GraphQueryStreaming({
  openCypherQuery: "MATCH (s:Supplier) WHERE s.Name = $name RETURN s LIMIT 100",
  bindParameters: { name: "Supplier 5" },
}));
const reader = result.resultRowsStream.getReader();
for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
  for (const row of chunk.value) console.log(row[0]); // a row is an array, one item per RETURN value
}
```

## Decision Tree

1. **Connecting?**
   - Secured graph (almost always) → set up auth first (`arcgis-authentication`), then `fetchKnowledgeGraph(url)`.

2. **Querying?**
   - Default → `executeQueryStreaming` with `new GraphQueryStreaming({ openCypherQuery, bindParameters })`.
   - Full-text search → `executeSearchStreaming`.
   - Small fixed query and you accept the `maxRecordCount` cap → `executeQuery` with `new GraphQuery(...)`.

3. **Showing results?**
   - Entities with geometry on a map → `KnowledgeGraphLayer` (scope it with `inclusionModeDefinition`).
   - Relationships → `LinkChartLayer` in a `WebLinkChart`, rendered by `arcgis-link-chart`.

**Default:** fetch, then streaming query with bind parameters.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
import GraphQueryStreaming from "@arcgis/core/rest/knowledgeGraph/GraphQueryStreaming.js";
import KnowledgeGraphLayer from "@arcgis/core/layers/KnowledgeGraphLayer.js";
```

### Dynamic Imports (CDN)

```javascript
const kg = await $arcgis.import("@arcgis/core/rest/knowledgeGraphService.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-link-chart"; // registered in 5.1 (measured)
```

## Key Concepts

### Concept 1: Fetch the graph (and its data model)

`fetchKnowledgeGraph(url)` returns a `KnowledgeGraph` with `url`, `dataModel` (entity and relationship types, their
properties, the spatial reference) and `serviceDefinition` (including `maxRecordCount`). Type and property names in
your openCypher must match the data model exactly. It has no `id`; the old example that logged `graph.id` does not
compile in 5.1.

### Concept 2: Streaming queries with bind parameters

`executeQueryStreaming` returns `resultRowsStream`, a `ReadableStream` whose chunks are arrays of rows. Per the 5.1
docs it returns **all** matches, past `maxRecordCount`, while `executeQuery` stops at that cap. Values go in
`bindParameters` (`$name` in the query): strings, lists of ids, and geometries (measured: a `Polygon` is kept as a
geometry for `esri.graph.ST_Intersects($zona, s.shape)`), never concatenated into the query string. Pass a class
instance: the 5.1 typings reject a plain `{ openCypherQuery }` object for `executeQuery`.

### Concept 3: Entities, relationships, geometry

Each row item is an `Entity`, `Relationship`, `Path` or a plain value. An entity has `typeName`, `id` and
`properties`; **the geometry is one of the properties** (measured: `"geometry" in entity === false`; the point was in
`entity.properties.shape`). The property name comes from the data model: the one whose `fieldType` is
`"esriFieldTypeGeometry"`.

## Common Pitfalls (Top 3)

### Pitfall 1: Reading `entity.geometry`

```typescript
// ❌ Anti-pattern
entities.forEach((e) => graphicsLayer.add(new Graphic({ geometry: e.geometry }))); // Entity has no geometry field
```

```typescript
// ✅ Correct
const type = graph.dataModel.entityTypes.find((t) => t.name === "Supplier");
const shape = type?.properties.find((p) => p.fieldType === "esriFieldTypeGeometry")?.name;
entities.forEach((e) => { if (shape && e.properties[shape]) graphicsLayer.add(new Graphic({ geometry: e.properties[shape] })); });
```

**Impact:** measured on an `Entity` built like the service returns it: `geometry` is not a member and every
graphic comes out empty, without an error.

### Pitfall 2: Fetching a secured graph without signing in

```typescript
// ❌ Anti-pattern
const graph = await knowledgeGraphService.fetchKnowledgeGraph(securedUrl); // no auth configured
```

```typescript
// ✅ Correct
// Register OAuthInfo or a token with IdentityManager first (see arcgis-authentication),
// or load through a KnowledgeGraphLayer and pass an AbortSignal so the UI can give up.
```

**Impact:** measured on Esri's public sample graph (499 "Token Required"): the promise did **not** reject. After
15 s it was still pending with the SDK's sign-in dialog in the DOM. `fetchKnowledgeGraph(url)` takes no
`signal`; `KnowledgeGraphLayer.load({ signal })` did abort cleanly (`AbortError`).

### Pitfall 3: Building queries by string concatenation, or using `executeQuery` for big sets

```typescript
// ❌ Anti-pattern
await knowledgeGraphService.executeQuery(graph, new GraphQuery({
  openCypherQuery: `MATCH (s:Supplier) WHERE s.Name = '${userInput}' RETURN s`,
})); // injectable, and capped at maxRecordCount
```

```typescript
// ✅ Correct
await knowledgeGraphService.executeQueryStreaming(graph, new GraphQueryStreaming({
  openCypherQuery: "MATCH (s:Supplier) WHERE s.Name = $name RETURN s",
  bindParameters: { name: userInput },
}));
```

**Impact:** user text can rewrite the query; per the docs, `executeQuery` silently returns at most
`serviceDefinition.maxRecordCount` rows (not measured: no reachable graph).

## When to Read references/

| If you need... | Read |
|---|---|
| knowledgeGraphService signatures | `references/api-detail.md` |
| Query + visualization examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-authentication` — graphs are usually secured
- `arcgis-layers` — plot entities with geometry
- `arcgis-interaction` — select nodes/edges

## Reference Samples

- [Query a knowledge graph](https://developers.arcgis.com/javascript/latest/sample-code/knowledgegraph-query/)
- [knowledgeGraphService](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-knowledgeGraphService.html)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1, partial validation: public graphs need a token and the validation never signs
  in. Measured in `tests/runtime/casos/arcgis-knowledge-graphs.ts`: entity geometry lives in `properties`, not
  `entity.geometry` (the old pitfall 2 code returned nothing); a secured graph leaves `fetchKnowledgeGraph` pending
  behind the sign-in dialog instead of a 403. Fixed the examples that did not compile (`graph.id`, plain
  `{ openCypherQuery }`), made streaming with `bindParameters` the default, and replaced three empty pitfalls
  (comment-only "do streaming", "keep ids scoped") with KnowledgeGraphLayer, LinkChartLayer and `arcgis-link-chart`.
- **0.1.0** (2026-05-31): Initial release.
