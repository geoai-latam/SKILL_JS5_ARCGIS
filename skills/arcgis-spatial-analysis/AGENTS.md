# Agent Guide: arcgis-spatial-analysis

Quick-reference for server-side analysis (SDK 5.1). Read before running GP/statistics.

## Quick Decision Tree

1. **Read `<task url>?f=json`**: execution type, parameter names, data types.
2. **Synchronous?** → `geoprocessor.execute(url, params)`.
3. **Asynchronous?** → `geoprocessor.submitJob` + `waitForJobCompletion` (in `try`) + `fetchResultData`.
4. **Aggregates?** → `query.outStatistics` on the layer.

## Setup Checklist

- [ ] `FeatureSet` for feature inputs, `LinearUnit` for distances.
- [ ] Exact parameter spelling (the error does not say which one is wrong).
- [ ] `try/catch` around `waitForJobCompletion()`: failures reject with the JobInfo.
- [ ] Find outputs by `paramName`.
- [ ] Statistics queries, never client-side sums.

## Anti-patterns (one-liner reminders)

- ❌ Summing downloaded features (capped at 1000 rows: a wrong total).
- ❌ A number for a `GPLinearUnit`, a `Graphic` for a feature set.
- ❌ Checking `jobStatus` after `await waitForJobCompletion()` instead of catching.
- ❌ `execute` on an async GP service.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — geoprocessor / input types / statistics
- `references/examples.md` — GP + statistics
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-geoprocessor.ts`
