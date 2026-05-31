# API Reference: Knowledge Graphs

## Table of Contents

- [knowledgeGraphService](#knowledgegraphservice)
- [Querying](#querying)
- [Entities & relationships](#entities--relationships)

---

## knowledgeGraphService

`@arcgis/core/rest/knowledgeGraphService.js`

| Function | Returns | Use |
|---|---|---|
| `fetchKnowledgeGraph(url)` | `Promise<KnowledgeGraph>` | Connect + load the data model |
| `executeQuery(graph, query)` | `Promise<...>` | Run an openCypher query |
| `executeApplyEdits(graph, edits)` | `Promise<...>` | Edit entities/relationships |

---

## Querying

openCypher-style queries match patterns of entities and relationships:

```text
MATCH (a:Person)-[r:WORKS_AT]->(b:Company)
WHERE b.name = 'Esri'
RETURN a, r, b
LIMIT 100
```

Always constrain with `WHERE` + `LIMIT`.

---

## Entities & relationships

| Concept | Description |
|---|---|
| Entity | A node with a type and properties (may have geometry) |
| Relationship | A typed edge connecting two entities |
| Data model | Declares entity/relationship types (from the fetched graph) |
