# API Reference: REST Services

## Table of Contents

- [route](#route)
- [locator](#locator)
- [places & query](#places--query)

---

## route

`@arcgis/core/rest/route.js`

| Function | Returns | Notes |
|---|---|---|
| `solve(url, RouteParameters)` | `Promise<RouteSolveResult>` | Directions & route geometry |

`RouteParameters` (`rest/support/RouteParameters.js`): `stops` (FeatureSet), `returnRoutes`,
`returnDirections`, `directionsLanguage`.

---

## locator

`@arcgis/core/rest/locator.js`

| Function | Returns | Use |
|---|---|---|
| `addressToLocations(url, params)` | `Promise<AddressCandidate[]>` | Geocode (address → coords) |
| `locationToAddress(url, params)` | `Promise<AddressCandidate>` | Reverse geocode |
| `suggestLocations(url, params)` | `Promise<SuggestionResult[]>` | Typeahead suggestions |

---

## places & query

| Module | Function | Use |
|---|---|---|
| `rest/places.js` | `queryPlacesNearPoint` / `queryPlacesWithinExtent` | POI search |
| `rest/query.js` | `executeQueryJSON(url, query)` | Standalone feature query |
| `rest/query.js` | `executeForCount(url, query)` | Count only |

World route/geocode/places services require `esriConfig.apiKey`.
