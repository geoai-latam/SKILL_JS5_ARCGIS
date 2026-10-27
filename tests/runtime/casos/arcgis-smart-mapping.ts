import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Extent from "@arcgis/core/geometry/Extent.js";
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color.js";
import * as typeRendererCreator from "@arcgis/core/smartMapping/renderers/type.js";
import * as sizeRendererCreator from "@arcgis/core/smartMapping/renderers/size.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
const CIUDADES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0";
const ESTADOS = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2";
// Small extent over New York state (WGS84).
const NY = new Extent({ xmin: -80, ymin: 40.5, xmax: -71.8, ymax: 45.1, spatialReference: { wkid: 4326 } });

async function vista(container: HTMLElement, layers: FeatureLayer[], extent?: Extent) {
  container.innerHTML = "";
  const d = document.createElement("div"); d.style.cssText = "width:400px;height:300px"; container.appendChild(d);
  const v = new MapView({ container: d, map: new Map({ basemap: "osm", layers }), ...(extent ? { extent } : { center: [-98, 38], zoom: 3 }) });
  await v.when();
  for (const l of layers) await v.whenLayerView(l);
  const t = performance.now(); while (v.updating && performance.now() - t < 10000) await tick(100);
  return v;
}
const est = (s: { min?: number | null; max?: number | null; count?: number | null } | null | undefined) => `min=${s?.min} max=${s?.max} n=${s?.count}`;

export async function run(container: HTMLElement) {
  return [
    await intento("Concepto 1: capa de servicio, estadísticas con la vista en NY vs en todo EE. UU.", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const vNY = await vista(container, [l], NY);
      const a = await colorRendererCreator.createContinuousRenderer({ layer: l, view: vNY, field: "pop2000" });
      vNY.destroy();
      const l2 = new FeatureLayer({ url: CIUDADES });
      const vUS = await vista(container, [l2]);
      const b = await colorRendererCreator.createContinuousRenderer({ layer: l2, view: vUS, field: "pop2000" });
      vUS.destroy();
      const c = await colorRendererCreator.createContinuousRenderer({ layer: new FeatureLayer({ url: CIUDADES }), field: "pop2000" });
      return `vista NY: ${est(a.statistics)} · vista EE. UU.: ${est(b.statistics)} · sin view: ${est(c.statistics)} · renderer sin view=${c.renderer?.type}`;
    }),
    await intento("Capa cliente (source): estadísticas solo de lo que está en la vista", async () => {
      const fs = await new FeatureLayer({ url: ESTADOS }).queryFeatures({ where: "1=1", outFields: ["*"], returnGeometry: true } as never);
      const mk = () => new FeatureLayer({ source: fs.features.map((f) => f.clone()), fields: fs.fields, objectIdField: "objectid", geometryType: "polygon", spatialReference: fs.spatialReference });
      const l = mk();
      const vNY = await vista(container, [l], NY);
      const a = await colorRendererCreator.createContinuousRenderer({ layer: l, view: vNY, field: "pop2000" });
      vNY.destroy();
      const l2 = mk();
      const vUS = await vista(container, [l2]);
      const b = await colorRendererCreator.createContinuousRenderer({ layer: l2, view: vUS, field: "pop2000" });
      vUS.destroy();
      return `vista NY: ${est(a.statistics)} · vista EE. UU.: ${est(b.statistics)}`;
    }),
    await intento("Pitfall 1: llamar antes de view.when()", async () => {
      container.innerHTML = "";
      const d = document.createElement("div"); d.style.cssText = "width:400px;height:300px"; container.appendChild(d);
      const l = new FeatureLayer({ url: CIUDADES });
      const v = new MapView({ container: d, map: new Map({ basemap: "osm", layers: [l] }), center: [-98, 38], zoom: 3 });
      const r = await colorRendererCreator.createContinuousRenderer({ layer: l, view: v, field: "pop2000" }).then((x) => `resolvió: ${est(x.statistics)} · basemapTheme=${x.basemapTheme}`, (e: Error) => `error: ${e.message}`);
      v.destroy();
      return r;
    }),
    await intento("Pitfall 3: continuo sobre un campo de texto", async () => {
      return colorRendererCreator.createContinuousRenderer({ layer: new FeatureLayer({ url: CIUDADES }), field: "areaname" }).then((x) => `resolvió sin error: ${x.renderer?.type} · ${est(x.statistics)} · stops=${x.visualVariable?.stops?.map((s) => s.value).join(",")}`, (e: Error) => `error: ${e.name}: ${e.message}`);
    }),
    await intento("Pitfall ext. 1: definitionExpression cambia las estadísticas", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const a = await colorRendererCreator.createContinuousRenderer({ layer: l, field: "pop2000" });
      l.definitionExpression = "st = 'NY'";
      const b = await colorRendererCreator.createContinuousRenderer({ layer: l, field: "pop2000" });
      return `sin filtro: ${est(a.statistics)} · st='NY': ${est(b.statistics)}`;
    }),
    await intento("filter con where: ¿se respeta?", async () => {
      const r = await colorRendererCreator.createContinuousRenderer({ layer: new FeatureLayer({ url: CIUDADES }), field: "pop2000", filter: { where: "st = 'NY'" } as never });
      return `con filter.where st='NY': ${est(r.statistics)}`;
    }),
    await intento("type.createRenderer sobre un campo con 51 valores (st)", async () => {
      const r = await typeRendererCreator.createRenderer({ layer: new FeatureLayer({ url: CIUDADES }), field: "st" });
      const u = r.renderer;
      return `uniqueValueInfos=${u.uniqueValueInfos?.length} · defaultLabel=${u.defaultLabel} · defaultSymbol=${u.defaultSymbol ? "sí" : "no"} · clases distintas en datos=${r.uniqueValueInfos?.length ?? "?"}`;
    }),
    await intento("type.createRenderer con numTypes: -1", async () => {
      const r = await typeRendererCreator.createRenderer({ layer: new FeatureLayer({ url: CIUDADES }), field: "st", numTypes: -1 });
      return `uniqueValueInfos=${r.renderer.uniqueValueInfos?.length}`;
    }),
    await intento("createClassBreaksRenderer por defecto", async () => {
      const r = await colorRendererCreator.createClassBreaksRenderer({ layer: new FeatureLayer({ url: CIUDADES }), field: "pop2000" });
      const cb = r.renderer;
      const l = new FeatureLayer({ url: CIUDADES });
      const primera = await l.queryFeatureCount({ where: `pop2000 <= ${cb.classBreakInfos[0].maxValue}` } as never);
      const q = await colorRendererCreator.createClassBreaksRenderer({ layer: new FeatureLayer({ url: CIUDADES }), field: "pop2000", classificationMethod: "quantile" });
      const primeraQ = await l.queryFeatureCount({ where: `pop2000 <= ${q.renderer.classBreakInfos[0].maxValue}` } as never);
      return `clases=${cb.classBreakInfos.length} · cortes=${cb.classBreakInfos.map((c) => Math.round(c.maxValue)).join(",")} · ciudades en la 1.ª clase=${primera} de 3557 · con quantile: 1.ª clase hasta ${Math.round(q.renderer.classBreakInfos[0].maxValue)} con ${primeraQ}`;
    }),
    await intento("Pitfall 2: el creator no asigna el renderer solo", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      await l.load();
      const antes = l.renderer?.type;
      await colorRendererCreator.createContinuousRenderer({ layer: l, field: "pop2000" });
      return `renderer antes=${antes} · después de llamar sin asignar=${l.renderer?.type}`;
    }),
    await intento("size.createContinuousRenderer y el tema", async () => {
      const r = await sizeRendererCreator.createContinuousRenderer({ layer: new FeatureLayer({ url: CIUDADES }), field: "pop2000" });
      const s = await colorRendererCreator.createContinuousRenderer({ layer: new FeatureLayer({ url: CIUDADES }), field: "pop2000", theme: "above-and-below" });
      return `size: renderer=${r.renderer.type} · visualVariables=${r.renderer.visualVariables?.map((v) => v.type).join(",")} · color above-and-below stops=${s.visualVariable.stops.length}`;
    }),
  ];
}
