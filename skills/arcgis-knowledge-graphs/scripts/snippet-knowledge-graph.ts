// snippet-knowledge-graph.ts — connect and stream a bound query (SDK 5.1). Smoke-tested.
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
import GraphQueryStreaming from "@arcgis/core/rest/knowledgeGraph/GraphQueryStreaming.js";

// Configure auth before calling this on a secured graph: without it the fetch waits on a sign-in dialog.
export async function firstRows(url: string, typeName: string, limit = 10) {
  const graph = await knowledgeGraphService.fetchKnowledgeGraph(url);
  // Labels cannot be bind parameters: only accept a type name that exists in the data model.
  if (!graph.dataModel.entityTypes.some((t) => t.name === typeName)) throw new Error(`unknown type ${typeName}`);
  const result = await knowledgeGraphService.executeQueryStreaming(graph, new GraphQueryStreaming({
    openCypherQuery: `MATCH (n:${typeName}) RETURN n LIMIT $limit`,
    bindParameters: { limit },
  }));
  const rows: unknown[][] = [];
  const reader = result.resultRowsStream.getReader();
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) rows.push(...chunk.value);
  return rows;
}
