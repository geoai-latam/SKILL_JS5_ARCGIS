// snippet-locator.ts — geocode an address with the locator service. Smoke-tested.
import * as locator from "@arcgis/core/rest/locator.js";

const GEOCODE_URL =
  "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

export async function geocode(singleLine: string) {
  const results = await locator.addressToLocations(GEOCODE_URL, {
    address: { SingleLine: singleLine },
    maxLocations: 5,
  });
  return results.map((r) => ({ label: r.address, location: r.location }));
}
