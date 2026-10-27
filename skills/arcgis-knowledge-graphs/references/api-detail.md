# API Reference: Knowledge Graphs

## Table of Contents

- [knowledgeGraphService](#knowledgegraphservice)
- [Query classes](#query-classes)
- [Results](#results)
- [Layers and link charts](#layers-and-link-charts)

---

## knowledgeGraphService

`@arcgis/core/rest/knowledgeGraphService.js` (5.1)

| Function | Returns | Use |
|---|---|---|
| `fetchKnowledgeGraph(url)` | `Promise<KnowledgeGraph>` | Load `dataModel` + `serviceDefinition`; no `signal` |
| `executeQueryStreaming(graph, GraphQueryStreaming, options?)` | `Promise<GraphQueryStreamingResult>` | Default query path |
| `executeQuery(graph, GraphQuery, options?)` | `Promise<GraphQueryResult>` | Capped at `maxRecordCount` |
| `executeSearchStreaming(graph, GraphSearchStreaming, options?)` | `Promise<GraphQueryStreamingResult>` | Full-text (Lucene) |
| `executeApplyEdits(graph, GraphApplyEdits, options?)` | `Promise<GraphApplyEditsResult>` | Add/update/delete entities and relationships |
| `refreshDataModel(graph)` | `Promise<void>` | Reload the data model after schema edits |
| `executeFindPaths(settings, options?)` | `Promise<...>` | Path finding between entities |

Also: `executeAddNamedTypes`, `executeAddGraphProperties`, field and search index edits, domains and replicas.

---

## Query classes

`@arcgis/core/rest/knowledgeGraph/GraphQueryStreaming.js`

| Property | Notes |
|---|---|
| `openCypherQuery` | Esri openCypher; `$name` placeholders |
| `bindParameters` | Strings, numbers, arrays, geometries |
| `outputSpatialReference` | Read-only; `null` until the server answers (measured) |
| `provenanceBehavior` | `"include"` / `"exclude"` provenance records |

`GraphQuery` (`.../GraphQuery.js`) only has `openCypherQuery`. Pass instances: the 5.1 type of `executeQuery`
rejects a plain object.

```text
MATCH (s:Supplier)-[:buys_part]-(p:Part)
WHERE s.Name = $name OR esri.graph.ST_Intersects($zone, s.shape)
RETURN s, p
LIMIT 100
```

---

## Results

| Object | Members |
|---|---|
| `GraphQueryStreamingResult` | `resultHeader`, `resultRowsStream` (`ReadableStream` of row arrays) |
| `GraphQueryResult` | `resultRows: GraphAnyValue[][]` |
| `Entity` | `typeName`, `id`, `properties` (geometry is one of them) |
| `Relationship` | `typeName`, `id`, `originId`, `destinationId`, `properties` |
| `Path` | Alternating entities and relationships |

`KnowledgeGraph.dataModel.entityTypes[i].properties` lists the `GraphProperty` items; the geometry one has
`fieldType: "esriFieldTypeGeometry"` and a `geometryType`.

---

## Layers and link charts

| Class / component | Use |
|---|---|
| `KnowledgeGraphLayer` (`layers/KnowledgeGraphLayer.js`) | Graph on a map; sublayers per type; `inclusionModeDefinition` to scope |
| `LinkChartLayer` (`layers/LinkChartLayer.js`) | Graph in a link chart (`type: "link-chart"`) |
| `WebLinkChart` (`WebLinkChart.js`) | The document a link chart view displays |
| `arcgis-link-chart` | Component that renders a `WebLinkChart`; plus `arcgis-link-chart-layout-switcher` |
