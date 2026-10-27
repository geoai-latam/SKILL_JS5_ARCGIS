# Agent Guide: arcgis-rest-services

Quick-reference for location services (SDK 5.1). Read before calling REST endpoints.

## Quick Decision Tree

1. **Geocode?** → `locator.addressToLocations` / `locationToAddress`.
2. **Route?** → `route.solve` + `new RouteParameters({ stops })` (FeatureSet or `Collection<Stop>`).
3. **Places/POI?** → `places.queryPlacesNearPoint(params)` (no URL).
4. **Standalone query?** → `query.executeQueryJSON(layerUrl, q)`, with the `/0` layer index in `layerUrl`.

## Setup Checklist

- [ ] `esriConfig.apiKey` before calling geocode-api / route-api / places.
- [ ] `RouteParameters` instance, never a plain object or raw coordinates.
- [ ] Layer index in query URLs; `returnGeometry: true` if you draw; check `exceededTransferLimit`.
- [ ] `outFields` on geocoding if you read `attributes`; guard empty candidate arrays.

## Anti-patterns (one-liner reminders)

- ❌ World service without a key: a sign-in dialog and a promise that never settles (not a 401).
- ❌ Raw stops: `TypeError: t.toJSON is not a function`.
- ❌ Querying the service root: 0 features, no error.
- ❌ Expecting directions without `returnDirections: true`.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — route / locator / places / query
- `references/examples.md` — geocode / route / query
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-route.ts`, `snippet-locator.ts`
