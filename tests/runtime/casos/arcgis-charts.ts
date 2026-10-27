import "@arcgis/charts-components/components/arcgis-chart";
import { createModel } from "@arcgis/charts-components/model/shared/setup-utils";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import { intento } from "./_util.ts";

const STATES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2";

function montar(container: HTMLElement) {
  container.innerHTML = "";
  const el = document.createElement("arcgis-chart") as HTMLArcgisChartElement;
  el.style.cssText = "display:block;width:600px;height:400px";
  container.appendChild(el);
  return el;
}
const evento = (el: HTMLElement, nombre: string, ms = 30000) =>
  new Promise<string>((ok) => { el.addEventListener(nombre, () => ok(`${nombre} disparado`), { once: true }); setTimeout(() => ok(`sin ${nombre} en ${ms / 1000} s`), ms); });

export async function run(container: HTMLElement) {
  const layer = new FeatureLayer({ url: STATES });
  return [
    await intento("Lo que enseñaba la skill: chartEl.layer + chartEl.config = {type:'bar',…}", async () => {
      const el = montar(container) as unknown as Record<string, unknown> & HTMLElement;
      const tieneConfig = "config" in el;
      el.layer = layer; el.config = { type: "bar", category: { field: "sub_region" }, aggregation: "count" };
      const r = await evento(el, "arcgisDataProcessComplete", 15000);
      return `¿el elemento tiene propiedad config?=${tieneConfig} · ${r} · model=${el.model ? "sí" : "no"}`;
    }),
    await intento("API real: createModel({ layer, chartType: 'barChart' }) + xAxisField + aggregationType", async () => {
      const el = montar(container);
      const model = await createModel({ layer, chartType: "barChart" });
      model.xAxisField = "sub_region";
      model.aggregationType = "count";
      const r = evento(el, "arcgisDataProcessComplete");
      el.layer = layer; el.model = model;
      const res = await r;
      if (res.startsWith("sin ")) throw new Error(res);
      return `${res} · series=${model.config.series?.length} · tipo=${model.config.series?.[0]?.type}`;
    }),
    await intento("Serie temporal: lineChart sobre campo no fecha (sub_region) — ¿qué pasa?", async () => {
      const model = await createModel({ layer, chartType: "lineChart" });
      try { model.xAxisField = "sub_region"; return `acepta xAxisField string · binTemporalData=${model.binTemporalData}`; }
      catch (e) { return `rechaza: ${(e as Error).message}`; }
    }),
  ];
}
