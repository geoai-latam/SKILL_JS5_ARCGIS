import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
import Collection from "@arcgis/core/core/Collection.js";
import esriRequest from "@arcgis/core/request.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Map from "@arcgis/core/Map.js";
import Basemap from "@arcgis/core/Basemap.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));

export async function run() {
  return [
    await intento("watch: ¿el callback corre síncrono? ¿agrupa tres cambios seguidos?", async () => {
      const l = new GraphicsLayer();
      const vistos: number[] = [];
      const h = reactiveUtils.watch(() => l.opacity, (v) => vistos.push(v));
      l.opacity = 0.1; l.opacity = 0.2; l.opacity = 0.3;
      const sincrono = vistos.length;
      await tick();
      h.remove();
      return `llamadas justo después de asignar: ${sincrono} · después de esperar: ${vistos.length} (${vistos.join(", ")})`;
    }),
    await intento("watch con { sync: true }", async () => {
      const l = new GraphicsLayer();
      const vistos: number[] = [];
      const h = reactiveUtils.watch(() => l.opacity, (v) => vistos.push(v), { sync: true });
      l.opacity = 0.1; l.opacity = 0.2; l.opacity = 0.3;
      h.remove();
      return `llamadas: ${vistos.length} (${vistos.join(", ")})`;
    }),
    await intento("when: ¿una vez o cada vez que vuelve a ser verdadero?", async () => {
      const l = new GraphicsLayer({ visible: false });
      let n = 0;
      const h = reactiveUtils.when(() => l.visible, () => n++);
      for (const v of [true, false, true, false, true]) { l.visible = v; await tick(); }
      h.remove();
      return `pasó a true 3 veces → callback ${n} veces`;
    }),
    await intento("whenOnce", async () => {
      const l = new GraphicsLayer({ visible: false });
      const p = reactiveUtils.whenOnce(() => l.visible);
      l.visible = true; await tick(); l.visible = false; await tick(); l.visible = true;
      const v = await p;
      return `resuelve con ${v}`;
    }),
    await intento("initial: true", async () => {
      const l = new GraphicsLayer({ opacity: 0.5 });
      let sin = 0, con = 0;
      const a = reactiveUtils.watch(() => l.opacity, () => sin++);
      const b = reactiveUtils.watch(() => l.opacity, () => con++, { initial: true });
      await tick();
      a.remove(); b.remove();
      return `sin initial: ${sin} llamadas · con initial: ${con}`;
    }),
    await intento("Getter que lanza (map.basemap null) y luego el valor aparece", async () => {
      const m = new Map();
      let n = 0, ultimo: unknown;
      const errores: string[] = [];
      const onerr = (e: ErrorEvent) => errores.push(e.message);
      window.addEventListener("error", onerr);
      const h = reactiveUtils.watch(() => (m.basemap as Basemap).title, (t) => { n++; ultimo = t; });
      await tick();
      m.basemap = new Basemap({ title: "uno" }); await tick();
      m.basemap.title = "dos"; await tick();
      h.remove();
      window.removeEventListener("error", onerr);
      return `callbacks después de que aparece el basemap: ${n} (último=${ultimo}) · errores globales: ${errores.length}`;
    }),
    await intento("Getter con ?. (map.basemap?.title)", async () => {
      const m = new Map();
      let n = 0;
      const h = reactiveUtils.watch(() => m.basemap?.title, () => n++);
      m.basemap = new Basemap({ title: "uno" }); await tick();
      m.basemap.title = "dos"; await tick();
      h.remove();
      return `callbacks: ${n}`;
    }),
    await intento("debounce: tres llamadas seguidas", async () => {
      let corridas = 0;
      const f = promiseUtils.debounce(async (q: string) => { corridas++; await tick(30); return q; });
      const res = await Promise.allSettled([f("a"), f("ab"), f("abc")]);
      return res.map((r) => r.status === "fulfilled" ? `ok:${r.value}` : `rechazo abort=${promiseUtils.isAbortError(r.reason)}`).join(" · ") + ` · corridas=${corridas}`;
    }),
    await intento("debounce recreado en cada llamada (pitfall ext. 2)", async () => {
      let corridas = 0;
      const real = async (q: string) => { corridas++; await tick(30); return q; };
      await Promise.allSettled(["a", "ab", "abc"].map((q) => promiseUtils.debounce(real)(q)));
      return `corridas=${corridas}`;
    }),
    await intento("Collection: layers[0] = x (asignar por índice)", async () => {
      const m = new Map({ layers: [new GraphicsLayer({ title: "vieja" })] });
      let cambios = 0;
      m.layers.on("change", () => cambios++);
      (m.layers as unknown as Record<number, unknown>)[0] = new GraphicsLayer({ title: "nueva" });
      await tick();
      return `length=${m.layers.length} · getItemAt(0).title=${m.layers.getItemAt(0)?.title} · eventos change=${cambios}`;
    }),
    await intento("Collection: filter/map devuelven Collection", async () => {
      const c = new Collection<number>([1, 2, 3, 4]);
      const f = c.filter((n) => n % 2 === 0), mm = c.map((n) => n * 10);
      return `filter instanceof Collection=${f instanceof Collection} · map instanceof Collection=${mm instanceof Collection} · ${mm.toArray().join(",")}`;
    }),
    await intento("Collection: evento change al add/remove", async () => {
      const c = new Collection<number>([1]);
      const ev: string[] = [];
      c.on("change", (e) => ev.push(`+${e.added.length}/-${e.removed.length}`));
      c.add(2); c.addMany([3, 4]); c.removeAt(0);
      await tick();
      return `eventos: ${ev.join(" ")}`;
    }),
    await intento("esriRequest JSON de un servicio real", async () => {
      const { data } = await esriRequest("https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2", { responseType: "json", query: { f: "json" } });
      return `name=${(data as { name: string }).name}`;
    }),
    await intento("esriRequest con signal abortado", async () => {
      const c = new AbortController();
      const p = esriRequest("https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer?f=json", { signal: c.signal });
      c.abort();
      try { await p; return "no abortó"; } catch (e) { return `rechaza · isAbortError=${promiseUtils.isAbortError(e)}`; }
    }),
    await intento("Legado: layer.watch() en 5.1", async () => {
      const l = new FeatureLayer({ url: "https://example.invalid/FeatureServer/0" });
      const fn = (l as unknown as { watch?: unknown }).watch;
      return `layer.watch existe=${typeof fn === "function"}`;
    }),
  ];
}
