// snippet-knowledge-graph.ts — connect to a knowledge graph service. Smoke-tested.
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";

export async function connect(url: string) {
  const graph = await knowledgeGraphService.fetchKnowledgeGraph(url);
  return graph;
}
