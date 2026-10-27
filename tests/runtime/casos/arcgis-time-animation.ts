import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-time-slider";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import TimeExtent from "@arcgis/core/time/TimeExtent.js";
import type MapView from "@arcgis/core/views/MapView.js";
import { intento } from "./_util.ts";

// Hurricanes 2000: a public, time-enabled MapServer layer (Aug–Oct 2000, maxRecordCount 1000).
const HURACANES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer/0";
const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
type Mapa = HTMLArcgisMapElement;

// Twelve client-side points, one per month of 2020, each at 00:00 UTC on the 1st.
function meses(timeInfo?: object) {
  const source = Array.from({ length: 12 }, (_, m) => new Graphic({
    geometry: new Point({ longitude: -74 + m * 0.01, latitude: 4.6 }),
    attributes: { oid: m + 1, fecha: Date.UTC(2020, m, 1) },
  }));
  return new FeatureLayer({
    source, objectIdField: "oid", geometryType: "point", spatialReference: { wkid: 4326 },
    fields: [{ name: "oid", type: "oid" }, { name: "fecha", type: "date" }],
    ...(timeInfo ? { timeInfo } : {}),
  });
}

async function mapa(container: HTMLElement, slider = false) {
  container.innerHTML = `<arcgis-map basemap="osm" center="-74,4.6" zoom="9" style="display:block;height:400px">${slider ? `<arcgis-time-slider slot="bottom-left"></arcgis-time-slider>` : ""}</arcgis-map>`;
  const m = container.querySelector("arcgis-map") as Mapa;
  await m.viewOnReady();
  return m;
}
async function quieto(view: MapView, lv: { updating: boolean }) { await tick(200); while (lv.updating || view.updating) await tick(); await tick(300); }
const enero = (inicio: Date) => new TimeExtent({ start: inicio, end: new Date(Date.UTC(2020, 1, 1) - 1) });

export async function run(container: HTMLElement) {
  return [
    await intento("¿new Date(\"2020-01-01\") es local o UTC?", async () => {
      const iso = new Date("2020-01-01").getTime(), utc = Date.UTC(2020, 0, 1), local = new Date(2020, 0, 1).getTime();
      return `zona del navegador=${Intl.DateTimeFormat().resolvedOptions().timeZone} · ISO de solo fecha == Date.UTC: ${iso === utc} · new Date(2020, 0, 1) == Date.UTC: ${local === utc} (diferencia ${(local - utc) / 3.6e6} h)`;
    }),
    await intento("Pitfall 1: view.timeExtent sin timeInfo / con timeInfo / con campo mal escrito", async () => {
      const out: string[] = [];
      for (const [nombre, ti] of [["sin timeInfo", undefined], ["timeInfo startField=fecha", { startField: "fecha" }], ["timeInfo startField=FECHA_MAL", { startField: "FECHA_MAL" }]] as const) {
        const m = await mapa(container);
        const l = meses(ti);
        let err = "";
        l.on("layerview-create-error", (e) => { err = e.error?.message ?? "error"; });
        m.map?.add(l);
        m.view.timeExtent = enero(new Date(Date.UTC(2020, 0, 1)));
        const lv = await m.view.whenLayerView(l).catch((e: Error) => { err = e.message; return null; });
        if (!lv) { out.push(`${nombre}: sin layerView (${err})`); continue; }
        await quieto(m.view, lv);
        const visibles = await lv.queryFeatureCount();
        out.push(`${nombre}: lv.queryFeatureCount=${visibles}, timeInfo.fullTimeExtent=${l.timeInfo?.fullTimeExtent ? "sí" : "no"}${err ? `, error=${err}` : ""}`);
      }
      return out.join(" · ");
    }),
    await intento("Pitfall 2: TimeExtent con hora local frente a UTC (datos a las 00:00 UTC)", async () => {
      const m = await mapa(container);
      const l = meses({ startField: "fecha" });
      m.map?.add(l);
      const lv = await m.view.whenLayerView(l);
      const out: string[] = [];
      for (const [nombre, inicio] of [["Date.UTC(2020,0,1)", new Date(Date.UTC(2020, 0, 1))], ["new Date(\"2020-01-01\")", new Date("2020-01-01")], ["new Date(2020,0,1) local", new Date(2020, 0, 1)]] as const) {
        m.view.timeExtent = enero(inicio);
        await quieto(m.view, lv);
        out.push(`${nombre}: ${await lv.queryFeatureCount()} de 1`);
      }
      return out.join(" · ");
    }),
    await intento("useViewTime=false y layer.timeExtent", async () => {
      const m = await mapa(container);
      const a = meses({ startField: "fecha" }); a.useViewTime = false;
      m.map?.add(a);
      m.view.timeExtent = enero(new Date(Date.UTC(2020, 0, 1)));
      const lva = await m.view.whenLayerView(a); await quieto(m.view, lva);
      const sinVista = await lva.queryFeatureCount();
      a.useViewTime = true;
      a.timeExtent = new TimeExtent({ start: new Date(Date.UTC(2020, 5, 1)), end: new Date(Date.UTC(2021, 0, 1)) });
      await quieto(m.view, lva);
      return `useViewTime=false con vista en enero: ${sinVista} de 12 · layer.timeExtent jun–dic + vista enero: ${await lva.queryFeatureCount()} (intersección vacía)`;
    }),
    await intento("Pitfall 3: ¿cambiar view.timeExtent pide al servidor en cada paso?", async () => {
      const m = await mapa(container);
      m.view.goTo({ center: [-60, 25], zoom: 3 }, { animate: false });
      const l = new FeatureLayer({ url: HURACANES });
      m.map?.add(l);
      const lv = await m.view.whenLayerView(l); await quieto(m.view, lv);
      const fte = l.timeInfo!.fullTimeExtent!;
      const consultas = () => performance.getEntriesByType("resource").filter((e) => e.name.includes("Hurricanes/MapServer/0/query")).length;
      const antes = consultas();
      const dia = 86400000, conteos: number[] = [];
      for (let i = 0; i < 10; i++) {
        const s = fte.start!.getTime() + i * 7 * dia;
        m.view.timeExtent = new TimeExtent({ start: new Date(s), end: new Date(s + 7 * dia) });
        await quieto(m.view, lv);
        conteos.push(await lv.queryFeatureCount());
      }
      return `modo=${(l as unknown as { mode?: string }).mode ?? "?"} · fullTimeExtent=${fte.start?.toISOString().slice(0, 10)}..${fte.end?.toISOString().slice(0, 10)} · consultas a /query en 10 pasos=${consultas() - antes} · puntos por semana=${conteos.join(",")}`;
    }),
    await intento("arcgis-time-slider: ¿toma solo el rango y mueve view.timeExtent?", async () => {
      const m = await mapa(container, true);
      const l = new FeatureLayer({ url: HURACANES });
      m.map?.add(l);
      await l.load();
      const s = container.querySelector("arcgis-time-slider") as HTMLArcgisTimeSliderElement;
      await s.componentOnReady(); await tick(3000);
      const solo = `sin configurar: fullTimeExtent=${s.fullTimeExtent ? "sí" : "null"}, timeExtent=${s.timeExtent ? "sí" : "null"}, view.timeExtent=${m.view.timeExtent ? "sí" : "null"}, mode=${s.mode}`;
      s.fullTimeExtent = l.timeInfo!.fullTimeExtent;
      s.stops = { interval: { value: 1, unit: "days" } } as never;
      await tick(800);
      const a = m.view.timeExtent;
      s.next(); await tick(800);
      const b = m.view.timeExtent;
      return `${solo} · con fullTimeExtent del layer: view.timeExtent=${a?.start?.toISOString()}..${a?.end?.toISOString()} · tras next(): ${b?.start?.toISOString()}..${b?.end?.toISOString()} · playRate=${s.playRate} · loop=${s.loop}`;
    }),
  ];
}
