import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-layer-list";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-basemap-gallery";
import "@arcgis/map-components/components/arcgis-expand";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import { intento } from "./_util.ts";

const CIUDADES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0";
const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
type C = HTMLElement & { view?: { type: string } | null; componentOnReady(): Promise<unknown> };
const caja = (el: Element) => { const a = el.getBoundingClientRect(); return `[${Math.round(a.left)},${Math.round(a.top)} ${Math.round(a.width)}×${Math.round(a.height)}]`; };
const listo = async (sel: string, root: ParentNode = document) => { const el = root.querySelector(sel) as C; await el.componentOnReady(); await tick(1200); return el; };

export async function run(container: HTMLElement) {
  return [
    await intento("Leyenda: anidada, fuera sin reference-element, con selector equivocado", async () => {
      container.innerHTML = `<arcgis-map id="myMap" basemap="osm" center="-98,39" zoom="4" style="display:block;width:600px;height:400px"><arcgis-legend id="dentro" slot="bottom-left"></arcgis-legend></arcgis-map><arcgis-legend id="suelta"></arcgis-legend><arcgis-legend id="mala" reference-element="#map"></arcgis-legend>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      m.map?.add(new FeatureLayer({ url: CIUDADES }));
      const [d, s, x] = [await listo("#dentro"), await listo("#suelta"), await listo("#mala")] as HTMLArcgisLegendElement[];
      await tick(2000);
      return `anidada: view=${d.view?.type}, capas en la leyenda=${d.activeLayerInfos?.length} · suelta: view=${s.view?.type ?? "null"}, capas=${s.activeLayerInfos?.length ?? 0} · reference-element="#map" (el id es myMap): view=${x.view?.type ?? "null"}, capas=${x.activeLayerInfos?.length ?? 0}`;
    }),
    await intento("Dos componentes en el mismo slot top-right", async () => {
      container.innerHTML = `<arcgis-map basemap="osm" center="-98,39" zoom="4" style="display:block;width:600px;height:400px"><arcgis-search slot="top-right"></arcgis-search><arcgis-legend slot="top-right"></arcgis-legend></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      const s = await listo("arcgis-search"), l = await listo("arcgis-legend");
      const a = s.getBoundingClientRect(), b = l.getBoundingClientRect();
      const solapan = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      return `search ${caja(s)} · legend ${caja(l)} · se solapan=${solapan}`;
    }),
    await intento("arcgis-layer-list dentro de arcgis-expand dentro del mapa", async () => {
      container.innerHTML = `<arcgis-map basemap="osm" center="-98,39" zoom="4" style="display:block;width:600px;height:400px"><arcgis-expand slot="top-left"><arcgis-layer-list></arcgis-layer-list></arcgis-expand></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      m.map?.add(new FeatureLayer({ url: CIUDADES }));
      const e = await listo("arcgis-expand") as HTMLArcgisExpandElement, ll = await listo("arcgis-layer-list") as HTMLArcgisLayerListElement;
      const antes = `expanded=${e.expanded}, layer-list view=${ll.view?.type ?? "null"}`;
      e.expanded = true; await tick(1500);
      return `${antes} · al expandir: layer-list view=${ll.view?.type ?? "null"}, alto=${Math.round(ll.getBoundingClientRect().height)} px`;
    }),
    await intento("arcgis-search sin API key: fuente por defecto y una búsqueda", async () => {
      container.innerHTML = `<arcgis-map basemap="osm" center="-74,4.6" zoom="5" style="display:block;width:600px;height:400px"><arcgis-search slot="top-right"></arcgis-search></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      const s = await listo("arcgis-search") as HTMLArcgisSearchElement;
      const fuentes = s.defaultSources?.toArray().map((f) => (f as { url?: string; name?: string }).url ?? f.name).join(",");
      const r = await Promise.race([s.search("Villa de Leyva").then((res) => `${res?.numResults} resultados, 1.º=${res?.results?.[0]?.results?.[0]?.name}`, (e: Error) => `rechaza: ${e.message}`), tick(15000).then(() => "pendiente 15 s")]);
      await tick(1500);
      return `fuentes por defecto=${fuentes} · search(): ${r} · centro del mapa tras buscar=${m.view.center.longitude.toFixed(2)},${m.view.center.latitude.toFixed(2)}`;
    }),
    await intento("arcgis-basemap-gallery sin API key", async () => {
      container.innerHTML = `<arcgis-map basemap="osm" center="-74,4.6" zoom="5" style="display:block;width:600px;height:400px"><arcgis-basemap-gallery slot="top-right"></arcgis-basemap-gallery></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      const g = await listo("arcgis-basemap-gallery") as HTMLArcgisBasemapGalleryElement;
      const src = g.source as unknown as { basemaps?: { length: number }; state?: string };
      const t0 = performance.now();
      while ((src?.basemaps?.length ?? 0) === 0 && performance.now() - t0 < 15000) await tick(300);
      return `basemaps en la galería=${src?.basemaps?.length} · state=${g.state} · diálogos de sesión=${document.querySelectorAll("calcite-dialog").length}`;
    }),
    await intento("Pitfall ext. 1: el tag sin su import", async () => {
      container.innerHTML = `<arcgis-bookmarks></arcgis-bookmarks>`;
      const el = container.querySelector("arcgis-bookmarks")!;
      return `customElements.get("arcgis-bookmarks")=${customElements.get("arcgis-bookmarks") ? "definido" : "undefined"} · es HTMLUnknownElement=${el instanceof HTMLUnknownElement} · alto=${el.getBoundingClientRect().height} px`;
    }),
  ];
}
