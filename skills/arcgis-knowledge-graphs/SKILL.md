---
name: arcgis-knowledge-graphs
description: >
  Query ArcGIS Knowledge graphs with the ArcGIS Maps SDK for JavaScript 5.0:
  connect via knowledgeGraphService.fetchKnowledgeGraph, run openCypher-style
  queries for entities and relationships, and visualize with a link chart. Use
  this skill whenever the user connects to a knowledge graph, runs a graph query,
  or explores entities and their relationships.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Knowledge Graphs

> **When to use:** Activate this skill whenever the user connects to a knowledge graph, runs a graph
> query, or explores entities and relationships.

## Overview

A knowledge graph stores entities and relationships; you query it with an openCypher-style language.

- **Problem it solves:** modeling and querying connected, non-tabular data.
- **Who it serves:** developers building investigative/link-analysis apps.
- **Pattern it teaches:** fetch the graph, run a query, render results (map + link chart).
- **What it does NOT cover:** feature layers (see `arcgis-layers`) or auth setup (see `arcgis-authentication`).

## Quick Start

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
const graph = await knowledgeGraphService.fetchKnowledgeGraph("https://.../KnowledgeGraphServer");
```

## Decision Tree

1. **Connecting to a graph service?**
   - Yes → `fetchKnowledgeGraph(url)` to get the graph object.

2. **Running a query?**
   - Yes → execute an openCypher query for entities/relationships.

3. **Visualizing relationships?**
   - Yes → use a link-chart view alongside the map.

**Default:** fetch then query; render entities with geometry on the map.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
```

### Dynamic Imports (CDN)

```javascript
const kg = await $arcgis.import("@arcgis/core/rest/knowledgeGraphService.js");
```

### Map Components (recommended for new projects)

```typescript
// Plot entities with geometry on the map; pair with a link chart for relationships.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Fetch the graph

`fetchKnowledgeGraph(url)` returns a `KnowledgeGraph` object carrying the data model (entity/
relationship types) needed to build and interpret queries.

### Concept 2: openCypher queries

Queries use an openCypher-style syntax to match entities and relationships, returning records you
map to UI — graph nodes/edges and/or map graphics.

### Concept 3: Entities, relationships, geometry

Entities may have geometry (plot them on the map); relationships connect entities (show them in a
link chart). The data model defines which types exist.

## Common Pitfalls (Top 3)

### Pitfall 1: Querying before fetching the graph

```typescript
// ❌ Anti-pattern
runQuery(url, cypher); // no graph object / data model
```

```typescript
// ✅ Correct
const graph = await knowledgeGraphService.fetchKnowledgeGraph(url);
// then query against `graph`
```

**Impact:** queries can't be built/interpreted without the data model.

### Pitfall 2: Assuming all entities have geometry

```typescript
// ❌ Anti-pattern
entities.forEach((e) => map.add(graphicFrom(e.geometry))); // some have none
```

```typescript
// ✅ Correct
entities.filter((e) => e.geometry).forEach((e) => map.add(graphicFrom(e.geometry)));
```

**Impact:** errors plotting entities without geometry.

### Pitfall 3: Unbounded graph queries

```typescript
// ❌ Anti-pattern
// MATCH everything with no limit
```

```typescript
// ✅ Correct
// Constrain with filters and a LIMIT to avoid huge result sets.
```

**Impact:** slow queries and heavy payloads.

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

- [Knowledge graph](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-knowledgeGraphService.html)
- [knowledgeGraphService](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-knowledgeGraphService.html)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
