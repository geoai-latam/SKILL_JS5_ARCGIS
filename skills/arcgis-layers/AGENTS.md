# Agent Guide: arcgis-layers

Quick-reference for adding and querying layers. Read before generating data code.

## Quick Decision Tree

1. **Source?** Feature service → `FeatureLayer`; `.geojson` → `GeoJSONLayer`; `.csv` →
   `CSVLayer`; client graphics → `GraphicsLayer`; tiles → `TileLayer`.
2. **Querying?** `layer.createQuery()`, then ``q.where = `(${q.where}) AND ...` `` (keeps the definitionExpression).
3. **Need fields from a query?** Set `query.outFields` (the layer's `outFields` do not limit queries).
4. **Large dataset?** Server-side `where`; results stop at `maxRecordCount` (`exceededTransferLimit`).

## Setup Checklist

- [ ] Create the layer with the Core API, then `map.add(layer)`.
- [ ] Set `outFields` to the fields you actually use.
- [ ] Use `layer.createQuery()` + `queryFeatures` for reads; never overwrite its `where`.
- [ ] Check `exceededTransferLimit` before treating a result as complete.
- [ ] Page with `query.start` / `query.num` for big result sets.

## Anti-patterns (one-liner reminders)

- ❌ `outFields: ["*"]` by default.
- ❌ Client-side filtering of a full download.
- ❌ `q.where = "..."` on a layer with `definitionExpression` (drops the filter).
- ❌ `new Query()` expecting geometry (`returnGeometry` is false).
- ❌ Index-assigning into `map.layers` (use `add`/`removeAt`).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — Layer + Query signatures
- `references/examples.md` — GeoJSON / CSV / query
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-featurelayer-query.ts`, `snippet-geojson.ts`, `snippet-graphics.ts`
