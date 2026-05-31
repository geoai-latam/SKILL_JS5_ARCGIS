# Agent Guide: arcgis-rest-services

Quick-reference for location services. Read before calling REST endpoints.

## Quick Decision Tree

1. **Geocode?** → `locator.addressToLocations` / `locationToAddress`.
2. **Route?** → `route.solve` + `RouteParameters`.
3. **Places/POI?** → `places` module.
4. **Standalone query?** → `query.executeQueryJSON`.

## Setup Checklist

- [ ] Set `esriConfig.apiKey` (or sign in) for world services.
- [ ] Use parameter classes (`RouteParameters`) for complex inputs.
- [ ] Prefer typed `rest/*` helpers over hand-built `esriRequest`.

## Anti-patterns (one-liner reminders)

- ❌ World service without an API key.
- ❌ Raw arrays where a parameter class is expected.
- ❌ Hand-built service URLs via esriRequest.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — route / locator / places / query
- `references/examples.md` — geocode / route / query
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-route.ts`, `snippet-locator.ts`
