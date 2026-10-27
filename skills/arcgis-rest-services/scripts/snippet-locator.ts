// snippet-locator.ts — geocode an address with the locator service. Smoke-tested (SDK 5.1).
// Needs esriConfig.apiKey: without it the SDK opens a sign-in dialog and this promise waits.
import * as locator from "@arcgis/core/rest/locator.js";

const GEOCODE_URL =
  "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

export async function geocode(singleLine: string) {
  const results = await locator.addressToLocations(GEOCODE_URL, {
    address: { SingleLine: singleLine },
    maxLocations: 5,
    outFields: ["Addr_type", "City"], // attributes are empty without it
  });
  return results.map((r) => ({ label: r.address, location: r.location }));
}
