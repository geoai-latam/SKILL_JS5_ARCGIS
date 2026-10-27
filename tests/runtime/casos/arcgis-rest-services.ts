import * as locator from "@arcgis/core/rest/locator.js";
import * as route from "@arcgis/core/rest/route.js";
import * as query from "@arcgis/core/rest/query.js";
import * as places from "@arcgis/core/rest/places.js";
import RouteParameters from "@arcgis/core/rest/support/RouteParameters.js";
import PlacesQueryParameters from "@arcgis/core/rest/support/PlacesQueryParameters.js";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";
import Collection from "@arcgis/core/core/Collection.js";
import Stop from "@arcgis/core/rest/support/Stop.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import esriId from "@arcgis/core/identity/IdentityManager.js";
import { intento } from "./_util.ts";

let dialogos = 0;
esriId.on("dialog-create", () => { dialogos++; });

// No API key in this harness: only keyless endpoints are exercised for results;
// the key-only ones are called to record what the failure looks like.
const GEOCODE_API = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
const GEOCODE_CLASICO = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
const ROUTE_WORLD = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
const ROUTE_SD = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/NetworkAnalysis/SanDiego/NAServer/Route";
const USA = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer";
const fallo = (e: unknown) => { const x = e as { name?: string; message?: string; details?: { httpStatus?: number; messageCode?: string } }; return `${x.name}: ${x.message?.slice(0, 90)} · http=${x.details?.httpStatus}`; };
// Settles within ms, or reports what is on screen while still pending (a sign-in dialog never settles).
async function aTiempo(p: Promise<string>, ms = 8000) {
  const r = await Promise.race([p.catch(fallo), new Promise<null>((ok) => setTimeout(() => ok(null), ms))]);
  if (r !== null) return r;
  const txt = document.body.innerText.replace(/\s+/g, " ");
  const dialogo = Array.from(document.querySelectorAll("*")).map((e) => e.tagName.toLowerCase()).filter((t) => /identity|oauth|sign-?in|calcite-dialog|calcite-modal/.test(t));
  const pedidos = performance.getEntriesByType("resource").filter((e) => /-api\.arcgis\.com|places-api/.test(e.name)).map((e) => (e as PerformanceResourceTiming).responseStatus).join(",");
  return `pendiente tras ${ms / 1000} s · dialog-create de IdentityManager=${dialogos} · respuestas http a *-api=${pedidos || "ninguna"} · elementos de sesión=${[...new Set(dialogo)].join(",") || "ninguno"} · ¿texto "Sign in"/"Iniciar sesión"?=${/sign in|iniciar sesi/i.test(txt)}`;
}
const sd = (lon: number, lat: number) => new Graphic({ geometry: new Point({ longitude: lon, latitude: lat }) });

export async function run(container: HTMLElement) {
  return [
    await intento("Pitfall 1: geocode-api sin API key", async () => {
      return aTiempo(locator.addressToLocations(GEOCODE_API, { address: { SingleLine: "Bogotá" } }).then((c) => `${c.length} candidatos`));
    }),
    await intento("geocode.arcgis.com (clásico) sin API key", async () => {
      const c = await locator.addressToLocations(GEOCODE_CLASICO, { address: { SingleLine: "Plaza de Bolívar, Bogotá" }, maxLocations: 3 });
      const b = c[0];
      return `${c.length} candidatos · 1.º "${b?.address}" score=${b?.score} · wkid=${b?.location?.spatialReference?.wkid} · attributes=${Object.keys(b?.attributes ?? {}).length}`;
    }),
    await intento("outFields en addressToLocations", async () => {
      const c = await locator.addressToLocations(GEOCODE_CLASICO, { address: { SingleLine: "Plaza de Bolívar, Bogotá" }, maxLocations: 1, outFields: ["Addr_type", "City", "Country"] });
      return `attributes=${JSON.stringify(c[0]?.attributes)}`;
    }),
    await intento("Pitfall ext. 3: dirección sin coincidencias", async () => {
      const c = await locator.addressToLocations(GEOCODE_CLASICO, { address: { SingleLine: "qqzxw vvkkjj 99999 xqz" } });
      return `${c.length} candidatos · 1.º score=${c[0]?.score} "${c[0]?.address}"`;
    }),
    await intento("locationToAddress (inverso)", async () => {
      const a = await locator.locationToAddress(GEOCODE_CLASICO, { location: new Point({ longitude: -74.0761, latitude: 4.5981 }) });
      return `"${a.address}" · score=${a.score}`;
    }),
    await intento("Pitfall ext. 2: punto WGS84 del geocoder sobre una vista Web Mercator", async () => {
      const c = await locator.addressToLocations(GEOCODE_CLASICO, { address: { SingleLine: "Plaza de Bolívar, Bogotá" }, maxLocations: 1 });
      container.innerHTML = "";
      const d = document.createElement("div"); d.style.cssText = "width:400px;height:300px"; container.appendChild(d);
      const v = new MapView({ container: d, map: new Map({ basemap: "osm" }), center: [-74.0761, 4.5981], zoom: 16 });
      await v.when();
      v.graphics.add(new Graphic({ geometry: c[0].location }));
      const s = v.toScreen(c[0].location!);
      const r = `vista wkid=${v.spatialReference.wkid} · punto wkid=${c[0].location?.spatialReference?.wkid} · en pantalla (${Math.round(s!.x)}, ${Math.round(s!.y)}) de 400×300`;
      v.destroy();
      return r;
    }),
    await intento("route-api sin API key", async () => aTiempo(route.solve(ROUTE_WORLD, new RouteParameters({ stops: new FeatureSet({ features: [sd(-74.08, 4.6), sd(-74.05, 4.65)] }) })).then(() => "resolvió"))),
    await intento("route.solve con FeatureSet (servicio de muestra San Diego)", async () => {
      const r = await route.solve(ROUTE_SD, new RouteParameters({ stops: new FeatureSet({ features: [sd(-117.195, 32.715), sd(-117.15, 32.74)] }), returnRoutes: true }));
      const rr = r.routeResults[0];
      return `routeResults=${r.routeResults.length} · geometría=${rr.route?.geometry?.type} · Total_TravelTime=${(rr.route?.attributes as Record<string, number>)?.Total_TravelTime?.toFixed(2)} · directions=${rr.directions ? "sí" : "no"}`;
    }),
    await intento("route.solve con Collection<Stop>", async () => {
      const stops = new Collection([new Stop({ geometry: new Point({ longitude: -117.195, latitude: 32.715 }) }), new Stop({ geometry: new Point({ longitude: -117.15, latitude: 32.74 }) })]);
      const r = await route.solve(ROUTE_SD, new RouteParameters({ stops, returnDirections: true, directionsLanguage: "es" }));
      const f = r.routeResults[0].directions?.features ?? [];
      return `maniobras=${f.length} · 1.ª: "${(f[0]?.attributes as Record<string, string>)?.text}"`;
    }),
    await intento("Pitfall 2: stops como array crudo de coordenadas", async () => {
      const p = new RouteParameters({ stops: [[-117.195, 32.715], [-117.15, 32.74]] as never });
      return route.solve(ROUTE_SD, p).then((r) => `resolvió: routeResults=${r.routeResults.length}`, (e) => `stops tras autocast=${String(p.stops)} · ${fallo(e)}`);
    }),
    await intento("Pitfall 2 (variante): un objeto plano en vez de RouteParameters", async () => {
      return route.solve(ROUTE_SD, { stops: new FeatureSet({ features: [sd(-117.195, 32.715), sd(-117.15, 32.74)] }) } as never).then((r) => `resolvió: routeResults=${r.routeResults.length}`, fallo);
    }),
    await intento("Pitfall ext. 1: executeQueryJSON contra el MapServer sin /0", async () => {
      const sin = await query.executeQueryJSON(USA, { where: "1=1", outFields: ["areaname"] }).then((f) => `${f.features.length} features`, fallo);
      const con = await query.executeQueryJSON(`${USA}/0`, { where: "pop2000 > 1000000", outFields: ["areaname"], returnGeometry: false }).then((f) => `${f.features.length} features`, fallo);
      return `sin /0: ${sin} · con /0: ${con}`;
    }),
    await intento("executeQueryJSON sin returnGeometry", async () => {
      const f = await query.executeQueryJSON(`${USA}/0`, { where: "pop2000 > 1000000", outFields: ["areaname"] });
      const n = await query.executeForCount(`${USA}/0`, { where: "1=1" });
      const todos = await query.executeQueryJSON(`${USA}/0`, { where: "1=1", outFields: ["objectid"] });
      return `geometría del 1.º=${f.features[0]?.geometry?.type ?? "null"} · count=${n} · where 1=1 trajo ${todos.features.length} · exceededTransferLimit=${todos.exceededTransferLimit}`;
    }),
    await intento("places sin API key", async () => {
      return aTiempo(places.queryPlacesNearPoint(new PlacesQueryParameters({ point: new Point({ longitude: -74.08, latitude: 4.6 }), searchText: "café" })).then((r) => `${r.results.length} lugares`));
    }),
  ];
}
