# Examples: Knowledge Graphs

## Example 1: Connect to a graph

**Use case:** load the graph and its data model.

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";

const graph = await knowledgeGraphService.fetchKnowledgeGraph("https://.../KnowledgeGraphServer");
console.log("loaded graph", graph.id);
```

**Notes:**

- The data model comes with the fetched graph.
- Usually requires authentication.

---

## Example 2: Run a query

**Use case:** find people who work at a company.

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";

const query = "MATCH (p:Person)-[:WORKS_AT]->(c:Company) WHERE c.name = 'Esri' RETURN p LIMIT 50";
const result = await knowledgeGraphService.executeQuery(graph, { openCypherQuery: query });
```

**Notes:**

- Constrain with `WHERE` + `LIMIT`.
- Map records to nodes/edges or map graphics.

---

## Example 3: Plot entities with geometry

**Use case:** show spatially-located entities on the map.

```typescript
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";

const layer = new GraphicsLayer();
entitiesWithGeometry.forEach((e) => layer.add(new Graphic({ geometry: e.geometry })));
```

**Notes:**

- Filter to entities that actually have geometry.
- Pair the map with a link chart for relationships.
