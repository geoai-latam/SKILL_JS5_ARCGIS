import "@arcgis/map-components/components/arcgis-map";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import Basemap from "@arcgis/core/Basemap.js";
import { intento } from "./_util.ts";

function caja(container: HTMLElement, alto = "300px") {
  container.innerHTML = "";
  const div = document.createElement("div");
  div.style.cssText = `width:400px;height:${alto}`;
  container.appendChild(div);
  return div;
}
const tiempo = <T>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<"tope">((ok) => setTimeout(() => ok("tope"), ms))]);

export async function run(container: HTMLElement) {
  return [
    await intento("Inicio Rápido de la skill: (e as CustomEvent).detail.view.zoom en arcgisViewReadyChange", async () => {
      container.innerHTML = "";
      const el = document.createElement("arcgis-map") as HTMLArcgisMapElement;
      el.style.cssText = "display:block;width:400px;height:300px";
      el.setAttribute("basemap", "osm");
      el.setAttribute("center", "-74.08,4.6");
      el.setAttribute("zoom", "11");
      const r = new Promise<string>((ok) => el.addEventListener("arcgisViewReadyChange", (e) => {
        const detail = (e as CustomEvent).detail;
        let skill: string;
        try { skill = `zoom=${detail.view.zoom}`; } catch (err) { skill = `lanza: ${(err as Error).message}`; }
        ok(`detail=${JSON.stringify(detail)} · código de la skill → ${skill} · e.target.view.zoom=${(e.target as HTMLArcgisMapElement).view?.zoom} · center=${el.view.center.longitude.toFixed(2)},${el.view.center.latitude.toFixed(2)}`);
      }, { once: true }));
      const antes = `antes de montar: view=${typeof el.view} ready=${el.ready}`;
      container.appendChild(el);
      const res = await tiempo(r, 30000);
      return `${antes} · ${res}`;
    }),
    await intento("viewOnReady() del componente", async () => {
      container.innerHTML = "";
      const el = document.createElement("arcgis-map") as HTMLArcgisMapElement;
      el.style.cssText = "display:block;width:400px;height:300px";
      el.basemap = "osm";
      container.appendChild(el);
      await el.viewOnReady();
      return `ready=${el.ready} · view.ready=${el.view.ready} · zoom=${el.view.zoom}`;
    }),
    await intento("Basemap 'arcgis/topographic' sin API key", async () => {
      const b = Basemap.fromId("arcgis/topographic") ?? new Basemap({ style: { id: "arcgis/topographic" } } as never);
      const r = await tiempo(b.load().then(() => `carga · baseLayers=${b.baseLayers.length}`).catch((e: Error) => `falla: ${e.message}`), 30000);
      return `fromId=${Basemap.fromId("arcgis/topographic") ? "sí" : "null"} · ${r}`;
    }),
    await intento("Basemap 'arcgis/topographic' en un MapView sin API key: ¿el view queda listo?", async () => {
      const view = new MapView({ container: caja(container), map: new Map({ basemap: "arcgis/topographic" }), center: [-74.08, 4.6], zoom: 11 });
      const r = await tiempo(view.when().then(() => "view listo").catch((e: Error) => `view falla: ${e.message}`), 30000);
      const err = view.map.basemap.loadError?.message ?? view.map.basemap.baseLayers.getItemAt(0)?.loadError?.message;
      const out = `${r} · basemap.loadStatus=${view.map.basemap.loadStatus}${err ? " · " + err : ""}`;
      view.destroy();
      return out;
    }),
    await intento("Basemaps legacy sin key: 'topo-vector' y 'osm'", async () => {
      const res: string[] = [];
      for (const id of ["topo-vector", "osm"]) {
        const b = Basemap.fromId(id);
        const r = b ? await tiempo(b.load().then(() => "carga").catch((e: Error) => `falla: ${e.message}`), 30000) : "fromId=null";
        res.push(`${id}: ${r}`);
      }
      return res.join(" · ");
    }),
    await intento("Pitfall 3: MapView con camera { tilt: 65 }", async () => {
      const view = new MapView({ container: caja(container), map: new Map({ basemap: "osm" }), center: [-74.08, 4.6], zoom: 11, camera: { tilt: 65 } } as never);
      await view.when();
      const out = `view listo · "camera" en view: ${"camera" in view} · zoom=${view.zoom}`;
      view.destroy();
      return out;
    }),
    await intento("Centro con ejes al revés: center [4.6, -74.08]", async () => {
      const view = new MapView({ container: caja(container), map: new Map({ basemap: "osm" }), center: [4.6, -74.08], zoom: 4 });
      await view.when();
      const out = `centro: lon=${view.center.longitude.toFixed(2)}, lat=${view.center.latitude.toFixed(2)}`;
      view.destroy();
      return out;
    }),
    await intento("Contenedor de 0 px de alto", async () => {
      const view = new MapView({ container: caja(container, "0px"), map: new Map({ basemap: "osm" }), center: [-74.08, 4.6], zoom: 11 });
      const r = await tiempo(view.when().then(() => "view listo"), 10000);
      const out = `${r} · height=${view.height} · ready=${view.ready}`;
      view.destroy();
      return out;
    }),
    await intento("ground: 'world-elevation' en un Map", async () => {
      const m = new Map({ basemap: "osm", ground: "world-elevation" });
      await m.ground.load();
      return `ground.layers=${m.ground.layers.length} · ${m.ground.layers.getItemAt(0)?.title}`;
    }),
  ];
}
