# Agent Guide: arcgis-knowledge-graphs

Quick-reference for knowledge graphs (SDK 5.1). Read before querying a graph.

## Quick Decision Tree

1. **Connect?** → auth first, then `knowledgeGraphService.fetchKnowledgeGraph(url)`.
2. **Query?** → `executeQueryStreaming(graph, new GraphQueryStreaming({ openCypherQuery, bindParameters }))`.
3. **Map?** → `KnowledgeGraphLayer`; **relationships?** → `LinkChartLayer` + `arcgis-link-chart`.

## Setup Checklist

- [ ] Configure auth (secured graphs wait on a sign-in dialog, they do not 403).
- [ ] Take type and property names from `graph.dataModel`.
- [ ] Use `bindParameters`, never string concatenation.
- [ ] Read `resultRowsStream`; rows are arrays in `RETURN` order.
- [ ] Find geometry in `entity.properties[<geometry property>]`.

## Anti-patterns (one-liner reminders)

- ❌ `entity.geometry` (does not exist).
- ❌ Plain `{ openCypherQuery }` object (does not compile in 5.1).
- ❌ `executeQuery` for large sets (capped at `maxRecordCount`).
- ❌ `graph.id` (no such member).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — service functions, query classes, results, layers
- `references/examples.md` — data model, streaming query, plotting
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-knowledge-graph.ts`
