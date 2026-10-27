import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-utility-network-trace-analysis";
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork.js";
import TraceParameters from "@arcgis/core/rest/networks/support/TraceParameters.js";
import TraceLocation from "@arcgis/core/rest/networks/support/TraceLocation.js";
import * as traceRest from "@arcgis/core/rest/networks/trace.js";
import { intento } from "./_util.ts";

// Esri's public Naperville sample asks for a token (HTTP 499 "Token Required"), and this harness never signs in.
// Everything below is measured without credentials: what an app sees before it authenticates, and what the
// client-side classes do with their parameters.
const NAPERVILLE = "https://sampleserver7.arcgisonline.com/server/rest/services/UtilityNetwork/NapervilleElectric/FeatureServer/0";
const NO_EXISTE = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/NoExiste/FeatureServer/0";
const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
const msg = (e: unknown) => { const x = e as { name?: string; message?: string }; return `${x?.name}: ${x?.message?.slice(0, 110)}`; };

export async function run(container: HTMLElement) {
  return [
    await intento("TraceParameters: el nombre REST traceConfigurationGlobalId frente al de JS", async () => {
      const id = "{F0A1B2C3-0000-4000-8000-000000000000}";
      const rest = new TraceParameters({ traceType: "connected", traceConfigurationGlobalId: id } as never);
      const js = new TraceParameters({ traceType: "connected", namedTraceConfigurationGlobalId: id });
      return `con traceConfigurationGlobalId: namedTraceConfigurationGlobalId=${String(rest.namedTraceConfigurationGlobalId)}, toJSON=${JSON.stringify(rest.toJSON())} · con namedTraceConfigurationGlobalId: toJSON=${JSON.stringify(js.toJSON())}`;
    }),
    await intento("TraceLocation: type y terminalId por defecto", async () => {
      const l = new TraceLocation({ globalId: "{A}", type: "starting-point" });
      const b = new TraceLocation({ globalId: "{B}", type: "barrier", terminalId: 2 });
      return `sin terminalId: terminalId=${l.terminalId}, percentAlong=${l.percentAlong} · toJSON=${JSON.stringify(l.toJSON())} · barrera: ${JSON.stringify(b.toJSON())}`;
    }),
    await intento("un.trace() antes de load()", async () => {
      const un = new UtilityNetwork({ layerUrl: NO_EXISTE });
      return un.trace({ traceType: "connected", traceLocations: [] }).then(() => "resolvió", (e) => `rechaza: ${msg(e)} · loaded=${un.loaded}`);
    }),
    await intento("load() de un servicio inexistente", async () => {
      const un = new UtilityNetwork({ layerUrl: NO_EXISTE });
      return un.load().then(() => "cargó", (e) => `rechaza: ${msg(e)}`);
    }),
    await intento("Pitfall: load() de un servicio con token, sin sesión", async () => {
      const un = new UtilityNetwork({ layerUrl: NAPERVILLE });
      const r = await Promise.race([un.load().then(() => "cargó", (e) => `rechaza: ${msg(e)}`), tick(15000).then(() => "pendiente a los 15 s")]);
      const dialogo = document.querySelectorAll("calcite-dialog, .esri-identity-modal, esri-identity").length;
      return `${r} · diálogos de inicio de sesión en el DOM=${dialogo} · loadStatus=${un.loadStatus}`;
    }),
    await intento("trace REST con un objeto plano (lo que mostraba la skill)", async () => {
      const r = await Promise.race([
        traceRest.trace(NO_EXISTE.replace("FeatureServer/0", "UtilityNetworkServer"), { traceType: "connected", traceLocations: [{ globalId: "{A}", type: "starting-point" }] } as never).then(() => "resolvió", (e) => `rechaza: ${msg(e)}`),
        tick(15000).then(() => "pendiente a los 15 s"),
      ]);
      return r;
    }),
    await intento("arcgis-utility-network-trace-analysis en un mapa sin web map", async () => {
      container.innerHTML = `<arcgis-map basemap="osm" center="-88.15,41.77" zoom="14" style="display:block;height:300px"><arcgis-utility-network-trace-analysis slot="top-right"></arcgis-utility-network-trace-analysis></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      const c = container.querySelector("arcgis-utility-network-trace-analysis") as HTMLArcgisUtilityNetworkTraceAnalysisElement;
      await c.componentOnReady(); await tick(3000);
      const texto = (c.shadowRoot?.textContent ?? c.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
      return `state=${c.state} · map.utilityNetworks=${(m.map as unknown as { utilityNetworks?: { length: number } })?.utilityNetworks?.length ?? "no existe"} · texto visible="${texto}"`;
    }),
  ];
}
