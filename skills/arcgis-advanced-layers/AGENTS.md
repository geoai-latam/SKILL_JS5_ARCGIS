# Agent Guide: arcgis-advanced-layers

Quick-reference for OGC, dynamic, and catalog layers. Read before integrating external services.

## Quick Decision Tree

1. **Protocol?** WMS → `WMSLayer`; WMTS → `WMTSLayer`; WFS 2.0.0 + GeoJSON → `WFSLayer`;
   OGC API Features → `OGCFeatureLayer`; KML → `KMLLayer`; ArcGIS MapServer → `MapImageLayer`;
   catalog layer in a **FeatureServer** → `CatalogLayer` (a MapServer is rejected).
2. **Toggle a MapServer sublayer?** Mutate `sublayer.visible`, don't re-create.
3. **Need to query?** WFS yes; WMS no (images).

## Setup Checklist

- [ ] Use HTTPS endpoints; configure CORS or a proxy for third-party hosts.
- [ ] For `MapImageLayer`, set `sublayers` with `{ id, visible }`.
- [ ] `await layer.load()` before inspecting `CatalogLayer` contents (`footprintLayer`, `dynamicGroupLayer`).
- [ ] WMS names: load once without `sublayers` and read `allSublayers` (a wrong name fails silently).
- [ ] Declared `MapImageLayer.sublayers` replace the service list: list all you keep.

## Anti-patterns (one-liner reminders)

- ❌ Querying features from a WMS layer, or `OGCFeatureLayer.queryFeatures()` (query its layer view).
- ❌ `WFSLayer` on a WFS 1.x-only server.
- ❌ Re-creating a MapImageLayer to toggle a sublayer.
- ❌ Mixed-content (http on https page) OGC URLs.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — WMS/WFS/MapImage/Catalog signatures
- `references/examples.md` — sublayer + OGC examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-wms.ts`, `snippet-mapimage.ts`, `snippet-catalog.ts`
