import MapView from "@arcgis/core/views/MapView.js";
import DistanceMeasurementAnalysis from "@arcgis/core/analysis/DistanceMeasurementAnalysis.js";
import AreaMeasurementAnalysis from "@arcgis/core/analysis/AreaMeasurementAnalysis.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-sketch";
import "@arcgis/map-components/components/arcgis-measurement";
import "@arcgis/map-components/components/arcgis-distance-measurement-2d";
import "@arcgis/map-components/components/arcgis-direct-line-measurement-3d";
import "@arcgis/map-components/components/arcgis-snapping-controls";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
type El = HTMLElement & Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function mapa(container: HTMLElement, hijos: string[], tag = "arcgis-map") {
  container.innerHTML = "";
  const m = document.createElement(tag) as El;
  m.style.cssText = "display:block;width:400px;height:300px";
  m.basemap = "osm"; m.center = [-74.08, 4.6]; m.zoom = 12; // without a basemap or a layer the view never gets ready
  const els = hijos.map((t) => { const e = document.createElement(t) as El; m.appendChild(e); return e; });
  container.appendChild(m);
  await m.viewOnReady();
  for (const e of els) await e.componentOnReady?.();
  await tick(600);
  return { m, els };
}
const linea = () => new Polyline({ paths: [[[-74.10, 4.60], [-74.05, 4.60]]], spatialReference: { wkid: 4326 } });

export async function run(container: HTMLElement) {
  return [
    await intento("arcgis-snapping-controls junto a arcgis-sketch: ¿comparten snappingOptions?", async () => {
      const { els: [sk, sn] } = await mapa(container, ["arcgis-sketch", "arcgis-snapping-controls"]);
      const mismo = sk.snappingOptions === sn.snappingOptions;
      sn.snappingOptions.enabled = true;
      const r = `mismo objeto=${mismo} · tras activar en los controles, sketch.snappingOptions.enabled=${sk.snappingOptions?.enabled} · featureSources=${sk.snappingOptions?.featureSources?.length}`;
      sn.snappingOptions = sk.snappingOptions; sk.snappingOptions.enabled = true;
      return `${r} → compartido a mano: mismo=${sk.snappingOptions === sn.snappingOptions}`;
    }),
    await intento("snappingOptions por defecto del sketch", async () => {
      const { els: [sk] } = await mapa(container, ["arcgis-sketch"]);
      const o = sk.snappingOptions;
      return `enabled=${o.enabled} · selfEnabled=${o.selfEnabled} · featureEnabled=${o.featureEnabled} · distance=${o.distance}px · featureSources=${o.featureSources.length} · gridEnabled=${o.gridEnabled}`;
    }),
    await intento("arcgis-measurement en 2D: activeTool, unidades y estado inicial", async () => {
      const { els: [me] } = await mapa(container, ["arcgis-measurement"]);
      const antes = `activeTool=${me.activeTool} · linearUnit=${me.linearUnit} · areaUnit=${me.areaUnit} · state=${me.state} · lang=${document.documentElement.lang || "(vacío)"}`;
      me.activeTool = "distance"; await tick(300);
      const d = me.state;
      me.activeTool = "direct-line"; await tick(300);
      return `${antes} · distance→state=${d} · "direct-line" en 2D→activeTool=${me.activeTool}, activeWidget=${me.activeWidget?.declaredClass ?? me.activeWidget?.tagName ?? "null"}`;
    }),
    await intento("Pitfall 1: arcgis-direct-line-measurement-3d dentro de arcgis-map", async () => {
      const errores: string[] = [];
      const w = console.error, ww = console.warn;
      console.error = (...a: unknown[]) => { errores.push(a.map(String).join(" ").slice(0, 120)); w(...a); };
      console.warn = (...a: unknown[]) => { errores.push(a.map(String).join(" ").slice(0, 120)); ww(...a); };
      const { els: [d3] } = await mapa(container, ["arcgis-direct-line-measurement-3d"]);
      let st = ""; try { await Promise.race([d3.start(), tick(3000)]); st = `start()→state=${d3.state}`; } catch (e) { st = `start lanza: ${(e as Error).message}`; }
      console.error = w; console.warn = ww;
      return `view=${d3.view ? d3.view.type : "undefined"} · ${st} · avisos=${errores.length}${errores.length ? ": " + errores[0] : ""}`;
    }),
    await intento("arcgis-distance-measurement-2d: unidad por defecto y unitOptions", async () => {
      const { els: [d2] } = await mapa(container, ["arcgis-distance-measurement-2d"]);
      return `unit=${d2.unit} · unitOptions=${d2.unitOptions?.join(",")} · state=${d2.state}`;
    }),
    await intento("Medición por código: DistanceMeasurementAnalysis en view.analyses", async () => {
      const { m } = await mapa(container, []);
      const view = m.view as MapView;
      const a = new DistanceMeasurementAnalysis({ geometry: linea() });
      view.analyses.add(a);
      const av = await (view as unknown as { whenAnalysisView(x: unknown): Promise<{ result?: { length?: { value: number; unit: string }; mode?: string } | null; updating: boolean }> }).whenAnalysisView(a);
      for (let i = 0; i < 60 && (!av.result || av.updating); i++) await tick(100);
      const ar = new AreaMeasurementAnalysis({ geometry: new Polygon({ rings: [[[-74.1, 4.6], [-74.09, 4.6], [-74.09, 4.61], [-74.1, 4.61], [-74.1, 4.6]]], spatialReference: { wkid: 4326 } }) });
      view.analyses.add(ar);
      const avr = await (view as unknown as { whenAnalysisView(x: unknown): Promise<{ result?: Record<string, { value: number; unit: string } | string> | null; updating: boolean }> }).whenAnalysisView(ar);
      for (let i = 0; i < 60 && (!avr.result || avr.updating); i++) await tick(100);
      const res = avr.result as Record<string, { value: number; unit: string }> | null;
      return `distancia=${av.result?.length?.value?.toFixed(1)} ${av.result?.length?.unit} (modo ${av.result?.mode}) · área: ${res ? Object.entries(res).map(([k, v]) => `${k}=${typeof v === "object" ? `${v.value?.toFixed?.(0)} ${v.unit}` : v}`).join(", ") : "null"} · valid=${a.valid}`;
    }),
    await intento("Pitfall 2: las formas del sketch no se guardan (y viven en una GraphicsLayer)", async () => {
      const { m, els: [sk] } = await mapa(container, ["arcgis-sketch"]);
      const capa = sk.layer as GraphicsLayer;
      return `layer=${capa?.type} · en map.layers=${m.map.layers.includes(capa)} · listMode=${capa?.listMode} · title=${capa?.title ?? "null"}`;
    }),
    await intento("clear() de arcgis-measurement deja el estado", async () => {
      const { els: [me] } = await mapa(container, ["arcgis-measurement"]);
      me.activeTool = "area"; await tick(300);
      const a = me.state;
      await me.clear(); await tick(200);
      return `con area: state=${a} · tras clear(): activeTool=${me.activeTool} · state=${me.state}`;
    }),
  ];
}
