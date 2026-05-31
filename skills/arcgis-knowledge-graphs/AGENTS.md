# Agent Guide: arcgis-knowledge-graphs

Quick-reference for knowledge graphs. Read before querying a graph.

## Quick Decision Tree

1. **Connect?** → `knowledgeGraphService.fetchKnowledgeGraph(url)`.
2. **Query?** → openCypher query against the fetched graph.
3. **Visualize?** → map graphics (geometry) + link chart (relationships).

## Setup Checklist

- [ ] Fetch the graph before querying (need the data model).
- [ ] Authenticate (graphs are usually secured).
- [ ] Filter + LIMIT queries.
- [ ] Guard entities without geometry before plotting.

## Anti-patterns (one-liner reminders)

- ❌ Querying before fetching the graph.
- ❌ Plotting entities assuming geometry exists.
- ❌ Unbounded MATCH queries.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — knowledgeGraphService
- `references/examples.md` — query + visualization
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-knowledge-graph.ts`
