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

`RouteParameters` (`rest/support/RouteParameters.js`): `stops` (`FeatureSet` or `Collection<Stop>`; a raw array
fails), `returnRoutes`, `returnDirections` (off by default), `directionsLanguage`.

Result: `routeResults[0].route` (polyline graphic with `Total_*` attributes) and `routeResults[0].directions`.

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
| `rest/places.js` | `queryPlacesNearPoint(params)` / `queryPlacesWithinExtent(params)` | POI search; no URL argument |
| `rest/query.js` | `executeQueryJSON(layerUrl, query)` | Standalone query; a service root gives 0 features |
| `rest/query.js` | `executeForCount(url, query)` | Count only |

World route/geocode/places services require `esriConfig.apiKey`; without it the SDK opens a sign-in dialog and the
promise stays pending (measured).
