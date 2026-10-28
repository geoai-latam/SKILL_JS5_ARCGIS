# Agent Guide: arcgis-parquet

Quick-reference for `ParquetLayer` (beta). Read before loading a `.parquet` file.

## Quick Decision Tree

1. **GeoParquet metadata or lon/lat-style column names?** Yes →
   `new ParquetLayer({ data: new ParquetFilesData({ urls }) })`.
2. **WKB column without metadata?** → `GeometryEncodingWkb({ field })` + `geometryType` + `spatialReference`.
3. **x/y columns with other names?** → `GeometryEncodingLocation({ xField, yField })` (x = longitude) +
   `geometryType: "point"` + `spatialReference`.
4. **Projected CRS or ZSTD?** Rewrite the file as 4326/3857 with Snappy or GZIP: the layer rejects both.
5. **View?** `MapView` / `<arcgis-map>` only.

## Setup Checklist

- [ ] Use `data` (`ParquetFilesData` / `ParquetPortalItemData`), not the deprecated `urls`.
- [ ] Without GeoParquet metadata, set `geometryEncoding`, `geometryType` **and** `spatialReference`.
- [ ] After `load()`: `isTable` is `false` and one queried feature has a non-null geometry.
- [ ] The host answers `HEAD` and `Range` (206) with CORS.
- [ ] Several files share one schema.
- [ ] Page queries in steps of 8000 or aggregate with `outStatistics`.

## Anti-patterns (one-liner reminders)

- ❌ Encoding without `spatialReference`: every geometry `null`, nothing drawn, no error.
- ❌ Trusting `exceededTransferLimit`: queries stop at 8000 rows and it stays `false`.
- ❌ Re-exporting the file on `Failed to parse file`: 404, CORS, Range and HEAD all give that message.
- ❌ `where: "STATUS = 'constructed'"`: values are case-sensitive (0 instead of 244 149).
- ❌ A plain `{ where }` when the layer has a `definitionExpression`: start from `createQuery()`.
- ❌ Mixed schemas across files: `Unknown field` on query.
- ❌ pandas `timestamp[us]`: becomes `big-integer` in microseconds, not a date.
- ❌ `ParquetLayer` in a `SceneView`, or expecting `applyEdits`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — ParquetLayer, data sources, encodings, field types
- `references/examples.md` — GeoParquet, portal item, WKB, x/y, local file, paging, table
- `references/pitfalls.md` — 12 measured pitfalls and what was not measured
- `scripts/snippet-geoparquet.ts`, `snippet-wkb.ts`, `snippet-query.ts`
