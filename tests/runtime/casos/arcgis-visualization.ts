import "@arcgis/map-components/components/arcgis-map";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import HeatmapRenderer from "@arcgis/core/renderers/HeatmapRenderer.js";
import ColorVariable from "@arcgis/core/renderers/visualVariables/ColorVariable.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
import type Renderer from "@arcgis/core/renderers/Renderer.js";
import { intento } from "./_util.ts";

// What is measured is what the GPU draws: one polygon covers the whole view, and the center pixel of
// view.takeScreenshot() is read back. The opaque fill hides the OSM basemap; seeing the basemap means nothing was drawn.
const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
const ESTADOS = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2";
const relleno = (color: string) => new SimpleFillSymbol({ color, outline: { color, width: 0 } });
const ROJO = relleno("#ff0000"), AZUL = relleno("#0000ff"), GRIS = relleno("#808080");

let contenedor: HTMLElement;
async function pixel(renderer: Renderer, attrs: Record<string, unknown>, opts: { fields?: object[]; symbol?: SimpleFillSymbol } = {}) {
  contenedor.innerHTML = `<arcgis-map basemap="osm" center="0,0" zoom="5" style="display:block;width:300px;height:300px"></arcgis-map>`;
  const m = contenedor.querySelector("arcgis-map") as HTMLArcgisMapElement;
  await m.viewOnReady();
  const fields = opts.fields ?? [{ name: "oid", type: "oid" }, ...Object.keys(attrs).map((k) => ({ name: k, type: typeof attrs[k] === "number" ? "double" : "string" }))];
  const g = new Graphic({ geometry: new Polygon({ rings: [[[-60, -60], [-60, 60], [60, 60], [60, -60], [-60, -60]]], spatialReference: { wkid: 4326 } }), attributes: { oid: 1, ...attrs }, symbol: opts.symbol });
  const l = new FeatureLayer({ source: [g], objectIdField: "oid", geometryType: "polygon", spatialReference: { wkid: 4326 }, fields: fields as never, renderer });
  m.map?.add(l);
  const lv = await m.view.whenLayerView(l);
  await tick(300); while (lv.updating || m.view.updating) await tick(); await tick(500);
  const shot = await m.view.takeScreenshot({ format: "png" });
  const d = shot.data, i = (Math.floor(d.height / 2) * d.width + Math.floor(d.width / 2)) * 4;
  const rgb = `${d.data[i]},${d.data[i + 1]},${d.data[i + 2]}`;
  return rgb === "255,0,0" ? "rojo" : rgb === "0,0,255" ? "azul" : rgb === "128,128,128" ? "gris" : `nada (se ve el basemap: ${rgb})`;
}

export async function run(container: HTMLElement) {
  contenedor = container;
  return [
    await intento("Pitfall ext. 1: field con otra caja que el del servicio (\"type\" vs \"TYPE\")", async () => {
      const uv = (field: string) => new UniqueValueRenderer({ field, uniqueValueInfos: [{ value: "park", symbol: ROJO }], defaultSymbol: GRIS });
      return `field "TYPE": ${await pixel(uv("TYPE"), { TYPE: "park" })} · field "type": ${await pixel(uv("type"), { TYPE: "park" })} · valor "Park" con info "park": ${await pixel(uv("TYPE"), { TYPE: "Park" })}`;
    }),
    await intento("Pitfall 2: cortes con hueco y el borde exacto entre clases", async () => {
      const cb = (infos: Array<[number, number, SimpleFillSymbol]>, def?: SimpleFillSymbol) => new ClassBreaksRenderer({ field: "v", classBreakInfos: infos.map(([minValue, maxValue, symbol]) => ({ minValue, maxValue, symbol })), defaultSymbol: def });
      const hueco = [[0, 100, ROJO], [200, 300, AZUL]] as Array<[number, number, SimpleFillSymbol]>;
      return `v=150 en hueco sin defaultSymbol: ${await pixel(cb(hueco), { v: 150 })} · con defaultSymbol gris: ${await pixel(cb(hueco, GRIS), { v: 150 })} · v=100 con [0,100] rojo y [100,300] azul: ${await pixel(cb([[0, 100, ROJO], [100, 300, AZUL]]), { v: 100 })}`;
    }),
    await intento("Pitfall ext. 2: valor fuera de los cortes y valor nulo", async () => {
      const cb = (def?: SimpleFillSymbol) => new ClassBreaksRenderer({ field: "v", classBreakInfos: [{ minValue: 0, maxValue: 100, symbol: ROJO }], defaultSymbol: def });
      return `v=500 sin defaultSymbol: ${await pixel(cb(), { v: 500 })} · con defaultSymbol: ${await pixel(cb(GRIS), { v: 500 })} · v=null sin defaultSymbol: ${await pixel(cb(), { v: null as unknown as number }, { fields: [{ name: "oid", type: "oid" }, { name: "v", type: "double" }] })}`;
    }),
    await intento("Pitfall ext. 3: stops de una variable de color en desorden", async () => {
      const vv = (stops: Array<[number, string]>) => new SimpleRenderer({ symbol: GRIS, visualVariables: [new ColorVariable({ field: "v", stops: stops.map(([value, color]) => ({ value, color })) })] });
      return `v=0 con stops [0 azul, 100 rojo]: ${await pixel(vv([[0, "#0000ff"], [100, "#ff0000"]]), { v: 0 })} · v=0 con stops [100 rojo, 0 azul]: ${await pixel(vv([[100, "#ff0000"], [0, "#0000ff"]]), { v: 0 })} · v=100 desordenado: ${await pixel(vv([[100, "#ff0000"], [0, "#0000ff"]]), { v: 100 })}`;
    }),
    await intento("Pitfall 1: graphic.symbol dentro de una FeatureLayer", async () => {
      return `renderer azul + graphic.symbol rojo en source: ${await pixel(new SimpleRenderer({ symbol: AZUL }), { v: 1 }, { symbol: ROJO })}`;
    }),
    await intento("Pitfall 3: HeatmapRenderer sobre una capa de polígonos", async () => {
      container.innerHTML = `<arcgis-map basemap="osm" center="-98,39" zoom="3" style="display:block;height:300px"></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      const l = new FeatureLayer({ url: ESTADOS, renderer: new HeatmapRenderer({ radius: 18 }) });
      let err = "";
      l.on("layerview-create-error", (e) => { err = e.error?.message ?? "error"; });
      m.map?.add(l);
      const lv = await m.view.whenLayerView(l).then((v) => v, (e: Error) => { err ||= e.message; return null; });
      if (lv) { await tick(300); while (lv.updating) await tick(); }
      const centro = await pixel(new HeatmapRenderer({ radius: 18, colorStops: [{ ratio: 0, color: "rgba(255,0,0,0)" }, { ratio: 1, color: "#ff0000" }] }), { v: 1 });
      return `polígono de cliente con heatmap, píxel del centro: ${centro} · servicio de estados: geometryType=${l.geometryType} · layerView=${lv ? "creada" : "no"} · error=${err || "ninguno"} · renderer final=${l.renderer?.type}`;
    }),
  ];
}
