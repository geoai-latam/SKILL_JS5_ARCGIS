import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@esri/calcite-components/dist/components/calcite-shell";
import esriConfig from "@arcgis/core/config.js";
import { intento } from "./_util.ts";

type Mapa = HTMLElement & { viewOnReady(): Promise<void>; view?: { ready: boolean; type: string } };
const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));

export async function run(container: HTMLElement) {
  return [
    await intento("El main.ts del scaffold: (e as CustomEvent).detail.view", async () => {
      container.innerHTML = `<calcite-shell style="height:400px"><arcgis-map basemap="osm" center="-74.08,4.6" zoom="11" style="height:400px"><arcgis-zoom slot="top-left"></arcgis-zoom></arcgis-map></calcite-shell>`;
      const m = container.querySelector("arcgis-map") as Mapa;
      const vistos: string[] = [];
      m.addEventListener("arcgisViewReadyChange", (e) => {
        const d = (e as CustomEvent).detail;
        let v = "";
        try { v = String((d as { view?: unknown })?.view); } catch (err) { v = `lanza: ${(err as Error).message}`; }
        vistos.push(`detail=${d === null ? "null" : typeof d} · detail.view=${v} · e.target.view.ready=${(e.target as Mapa).view?.ready}`);
      });
      await m.viewOnReady();
      await tick(500);
      return `eventos=${vistos.length} · ${vistos.join(" | ")} · tras viewOnReady: el.view.type=${m.view?.type} ready=${m.view?.ready}`;
    }),
    await intento("apiKey sin .env: import.meta.env.VITE_ARCGIS_API_KEY ausente", async () => {
      const antes = esriConfig.apiKey;
      esriConfig.apiKey = (undefined as unknown) as string;
      const r = `esriConfig.apiKey=${String(esriConfig.apiKey)} · typeof=${typeof esriConfig.apiKey}`;
      esriConfig.apiKey = antes;
      return r;
    }),
    await intento("Pitfall ext. 2: arcgis-map sin altura", async () => {
      container.innerHTML = `<div><arcgis-map basemap="osm" center="-74.08,4.6" zoom="11"></arcgis-map></div>`;
      const m = container.querySelector("arcgis-map") as Mapa;
      const listo = await Promise.race([m.viewOnReady().then(() => "listo"), tick(15000).then(() => "pendiente 15 s")]);
      return `altura=${Math.round(m.getBoundingClientRect().height)} px · viewOnReady=${listo} · view.ready=${m.view?.ready}`;
    }),
  ];
}
