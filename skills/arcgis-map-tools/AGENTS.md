# Agent Guide: arcgis-map-tools

Quick-reference for interactive tools (SDK 5.1). Read before adding sketch/measure/snap.

## Quick Decision Tree

1. **Draw/edit?** → `arcgis-sketch` (adds its own "Sketch Layer").
2. **Measure?** → 2D: `*-measurement-2d`; 3D: `direct-line`/`area` `*-3d`; code: measurement analyses.
3. **Snap?** → `snappingControls.snappingOptions = sketch.snappingOptions` + `featureSources`.

## Setup Checklist

- [ ] The map has a basemap or a layer (an empty map never gets ready).
- [ ] Share one `SnappingOptions` between sketch and snapping controls.
- [ ] Add `FeatureSnappingLayerSource` for feature snapping.
- [ ] Match the measurement variant to the view; set `unit` explicitly if reports read it.
- [ ] Persist sketch output with `applyEdits` if needed.

## Anti-patterns (one-liner reminders)

- ❌ Assuming snapping controls drive the sketch (separate objects, measured).
- ❌ 3D measurement on a 2D map (`state: "unsupported"`).
- ❌ Assuming sketch saves to the service.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — components, analyses, snapping defaults
- `references/examples.md` — snapping, fixed units, measure in code
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-tools.ts`
