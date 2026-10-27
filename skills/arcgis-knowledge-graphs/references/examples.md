# Examples: Knowledge Graphs

## Example 1: Connect and inspect the data model

**Use case:** list entity types and find each type's geometry property.

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";

const graph = await knowledgeGraphService.fetchKnowledgeGraph("https://.../KnowledgeGraphServer");
for (const t of graph.dataModel.entityTypes) {
  const shape = t.properties.find((p) => p.fieldType === "esriFieldTypeGeometry");
  console.log(t.name, shape ? `geometry in "${shape.name}"` : "no geometry");
}
console.log("max records per executeQuery:", graph.serviceDefinition.maxRecordCount);
```

**Notes:**

- Secured services need auth set up first; otherwise the call waits on the sign-in dialog.

---

## Example 2: Streaming query with bind parameters

**Use case:** suppliers inside an area, read as they arrive.

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
import GraphQueryStreaming from "@arcgis/core/rest/knowledgeGraph/GraphQueryStreaming.js";
import Entity from "@arcgis/core/rest/knowledgeGraph/Entity.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";

const zone = new Polygon({ rings: [[[-75, 4], [-73, 4], [-73, 5], [-75, 5], [-75, 4]]], spatialReference: { wkid: 4326 } });
const result = await knowledgeGraphService.executeQueryStreaming(graph, new GraphQueryStreaming({
  openCypherQuery: "MATCH (s:Supplier) WHERE esri.graph.ST_Intersects($zone, s.shape) RETURN s",
  bindParameters: { zone },
}));
const suppliers: Entity[] = [];
const reader = result.resultRowsStream.getReader();
for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
  for (const row of chunk.value) suppliers.push(row[0] as Entity);
}
```

**Notes:**

- No `LIMIT` needed to get past `maxRecordCount`, but keep one while exploring.
- Pass `{ signal }` as the third argument to cancel.

---

## Example 3: Plot entities with geometry

**Use case:** show the suppliers from Example 2 on the map.

```typescript
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";

const layer = new GraphicsLayer();
for (const e of suppliers) {
  const geometry = e.properties.shape; // the name comes from the data model (Example 1)
  if (geometry) layer.add(new Graphic({ geometry, attributes: { id: e.id, name: e.properties.Name } }));
}
view.map?.add(layer);
```

**Notes:**

- For the whole graph with per-type symbology, prefer `KnowledgeGraphLayer` scoped with `inclusionModeDefinition`.
