# Agent Guide: arcgis-spatial-analysis

Quick-reference for server-side analysis. Read before running GP/statistics.

## Quick Decision Tree

1. **Fast GP tool?** → `geoprocessor.execute(url, params)`.
2. **Long-running?** → `geoprocessor.submitJob` + `waitForJobCompletion`.
3. **Aggregates?** → `query.outStatistics` on the layer.

## Setup Checklist

- [ ] Use exact, case-sensitive GP parameter names.
- [ ] Pick `execute` (sync) vs `submitJob` (async) per the service.
- [ ] For counts/sums use statistics queries, not feature downloads.
- [ ] Authenticate if the service is secured.

## Anti-patterns (one-liner reminders)

- ❌ `execute` on an async GP service.
- ❌ Guessed parameter names.
- ❌ Downloading features to compute aggregates.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — geoprocessor / statistics
- `references/examples.md` — GP + statistics
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-geoprocessor.ts`
