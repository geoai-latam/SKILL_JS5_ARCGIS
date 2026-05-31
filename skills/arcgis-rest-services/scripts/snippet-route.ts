// snippet-route.ts — solve a route between stops. Smoke-tested.
import * as route from "@arcgis/core/rest/route.js";
import RouteParameters from "@arcgis/core/rest/support/RouteParameters.js";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";

const ROUTE_URL =
  "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

export async function solveRoute() {
  const stops = new FeatureSet({
    features: [
      new Graphic({ geometry: new Point({ longitude: -74.08, latitude: 4.6 }) }),
      new Graphic({ geometry: new Point({ longitude: -74.05, latitude: 4.65 }) }),
    ],
  });
  const params = new RouteParameters({ stops, returnRoutes: true });
  return route.solve(ROUTE_URL, params);
}
