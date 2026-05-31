# Agent Guide: arcgis-layers

Quick-reference for adding and querying layers. Read before generating data code.

## Quick Decision Tree

1. **Source?** Feature service → `FeatureLayer`; `.geojson` → `GeoJSONLayer`; `.csv` →
   `CSVLayer`; client graphics → `GraphicsLayer`; tiles → `TileLayer`.
2. **Need attributes?** Set `outFields` (specific fields, not `*`).
3. **Need geometry from a query?** Set `query.returnGeometry = true`.
4. **Large dataset?** Filter with `definitionExpression` server-side.

## Setup Checklist

- [ ] Create the layer with the Core API, then `map.add(layer)`.
- [ ] Set `outFields` to the fields you actually use.
- [ ] Use `layer.createQuery()` + `queryFeatures` for reads.
- [ ] Page with `query.start` / `query.num` for big result sets.

## Anti-patterns (one-liner reminders)

- ❌ `outFields: ["*"]` by default.
- ❌ Client-side filtering of a full download.
- ❌ Forgetting `returnGeometry = true` when you need geometry.
- ❌ Index-assigning into `map.layers` (use `add`/`removeAt`).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — Layer + Query signatures
- `references/examples.md` — GeoJSON / CSV / query
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-featurelayer-query.ts`, `snippet-geojson.ts`, `snippet-graphics.ts`
