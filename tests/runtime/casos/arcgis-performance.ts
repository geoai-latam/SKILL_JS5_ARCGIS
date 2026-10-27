import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
// Public sample: US cities (MapServer/0).
const CIUDADES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0";
function div(container: HTMLElement) {
  const d = document.createElement("div"); d.style.cssText = "width:300px;height:200px"; container.appendChild(d); return d;
}
async function lista(view: MapView) { await view.when(); const t = performance.now(); while (view.updating && performance.now() - t < 8000) await tick(); }
const pedidos = (patron: string) => performance.getEntriesByType("resource").filter((e) => e.name.includes(patron)).length;

export async function run(container: HTMLElement) {
  return [
    await intento("Pitfall 2: 20 vistas sin destroy() (innerHTML = '')", async () => {
      const avisos: string[] = [];
      const w = console.warn; console.warn = (...a: unknown[]) => { avisos.push(a.map(String).join(" ").slice(0, 100)); w(...a); };
      const vistas: MapView[] = [];
      for (let i = 0; i < 20; i++) {
        container.innerHTML = "";
        const v = new MapView({ container: div(container), map: new Map({ basemap: "osm" }), center: [-74.08, 4.6], zoom: 10 });
        await v.when().catch(() => undefined); await tick(150);
        vistas.push(v);
      }
      console.warn = w;
      const vivas = vistas.filter((v) => !v.destroyed).length;
      const fatal = vistas.filter((v) => v.fatalError).length;
      vistas.forEach((v) => v.destroy());
      return `vistas vivas=${vivas} · con fatalError=${fatal} · avisos WebGL=${avisos.filter((a) => /webgl|context/i.test(a)).length}${avisos.length ? " · 1.º: " + avisos[0] : ""}`;
    }),
    await intento("Las mismas 20 vistas con destroy()", async () => {
      let fatal = 0;
      for (let i = 0; i < 20; i++) {
        container.innerHTML = "";
        const v = new MapView({ container: div(container), map: new Map({ basemap: "osm" }), center: [-74.08, 4.6], zoom: 10 });
        await v.when().catch(() => undefined); await tick(150);
        if (v.fatalError) fatal++;
        v.destroy();
      }
      return `con fatalError=${fatal}`;
    }),
    await intento("view.destroy() también destruye el mapa y sus capas", async () => {
      container.innerHTML = "";
      const capa = new GraphicsLayer();
      const map = new Map({ basemap: "osm", layers: [capa] });
      const v = new MapView({ container: div(container), map, center: [-74.08, 4.6], zoom: 10 });
      await v.when(); v.destroy();
      const r = `map.destroyed=${map.destroyed} · capa.destroyed=${capa.destroyed} · capas en el mapa=${map.layers.length}`;
      const map2 = new Map({ basemap: "osm", layers: [new GraphicsLayer()] });
      const v2 = new MapView({ container: div(container), map: map2, center: [-74.08, 4.6], zoom: 10 });
      await v2.when(); v2.map = null; v2.destroy();
      return `${r} · con view.map = null antes: map2.destroyed=${map2.destroyed}, capas=${map2.layers.length}`;
    }),
    await intento("Pitfall ext. 2: watch(view.center) vs view.stationary durante un goTo", async () => {
      container.innerHTML = "";
      const v = new MapView({ container: div(container), map: new Map({ basemap: "osm" }), center: [-74.08, 4.6], zoom: 10 });
      await lista(v);
      let centro = 0, quieto = 0;
      const h1 = reactiveUtils.watch(() => v.center, () => centro++);
      const h2 = reactiveUtils.watch(() => v.stationary, (s) => { if (s) quieto++; });
      await v.goTo({ center: [-75.57, 6.25] }, { duration: 1500 });
      await tick(300);
      h1.remove(); h2.remove(); v.destroy();
      return `watch(center) disparó ${centro} veces · watch(stationary=true) ${quieto}`;
    }),
    await intento("Pitfall ext. 4: minScale en una capa de detalle", async () => {
      container.innerHTML = "";
      const l = new FeatureLayer({ url: CIUDADES, minScale: 50000 });
      const v = new MapView({ container: div(container), map: new Map({ basemap: "osm", layers: [l] }), center: [-98, 38], zoom: 4 });
      const lv = await v.whenLayerView(l); await lista(v);
      const r = `zoom 4 (escala ${Math.round(v.scale)}): visibleAtCurrentScale=${lv.visibleAtCurrentScale} · suspended=${lv.suspended}`;
      v.destroy();
      return r;
    }),
    await intento("Pitfall ext. 5: alternar visible vs quitar y recrear la capa (pedidos de red)", async () => {
      container.innerHTML = "";
      performance.clearResourceTimings();
      const l = new FeatureLayer({ url: CIUDADES });
      const map = new Map({ basemap: "osm", layers: [l] });
      const v = new MapView({ container: div(container), map, center: [-98, 38], zoom: 4 });
      await v.whenLayerView(l); await lista(v);
      const base = pedidos("USA/MapServer/0");
      for (let i = 0; i < 3; i++) { l.visible = false; await tick(200); l.visible = true; await lista(v); }
      const conVisible = pedidos("USA/MapServer/0") - base;
      performance.clearResourceTimings();
      for (let i = 0; i < 3; i++) { map.removeAll(); const n = new FeatureLayer({ url: CIUDADES }); map.add(n); await v.whenLayerView(n); await lista(v); }
      const recreando = pedidos("USA/MapServer/0");
      v.destroy();
      return `3 alternancias de visible → ${conVisible} pedidos al servicio · 3 recreaciones → ${recreando} pedidos`;
    }),
    await intento("featureReduction cluster como objeto plano en 5.1", async () => {
      const l = new FeatureLayer({ url: CIUDADES, featureReduction: { type: "cluster", clusterRadius: 60 } as never });
      return `featureReduction.type=${l.featureReduction?.type} · declaredClass=${(l.featureReduction as unknown as { declaredClass: string })?.declaredClass}`;
    }),
  ];
}
