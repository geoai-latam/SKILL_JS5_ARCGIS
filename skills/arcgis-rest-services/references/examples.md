# Examples: REST Services

## Example 1: Geocode an address

**Use case:** turn a text address into coordinates.

```typescript
import * as locator from "@arcgis/core/rest/locator.js";

const GEOCODE_URL = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
const candidates = await locator.addressToLocations(GEOCODE_URL, {
  address: { SingleLine: "Calle 26, Bogotá" },
  maxLocations: 5,
});
```

**Notes:**

- Requires `esriConfig.apiKey`; without it a sign-in dialog opens and the call waits.
- Results include `address`, `location` (WGS84) and `score`; `attributes` needs `outFields`.

---

## Example 2: Solve a route

**Use case:** directions between two stops.

```typescript
import * as route from "@arcgis/core/rest/route.js";
import RouteParameters from "@arcgis/core/rest/support/RouteParameters.js";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";

const params = new RouteParameters({ stops: new FeatureSet({ features: stopGraphics }), returnRoutes: true });
const solve = await route.solve(ROUTE_URL, params);
```

**Notes:**

- `stops` is a FeatureSet of point graphics (or a `Collection<Stop>`).
- Set `returnDirections` for turn-by-turn text.

---

## Example 3: Standalone query

**Use case:** query a service without adding a layer.

```typescript
import * as query from "@arcgis/core/rest/query.js";

const fs = await query.executeQueryJSON(`${SERVICE_URL}/0`, {
  where: "POP > 100000",
  outFields: ["NAME", "POP"],
  returnGeometry: false,
});
```

**Notes:**

- `executeQueryJSON` returns a FeatureSet directly; the URL needs the layer index (`/0`).
- Use `executeForCount` when you only need a number.
