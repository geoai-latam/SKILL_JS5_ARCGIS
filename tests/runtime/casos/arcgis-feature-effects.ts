import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect.js";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
const A = { longitude: -74.06, latitude: 4.6 }, B = { longitude: -74.02, latitude: 4.6 };

// Two big pure-red squares on a white map: POP 2,000,000 (A, left) and 500 (B, right).
function capa() {
  return new FeatureLayer({
    source: [
      new Graphic({ geometry: new Point(A), attributes: { OBJECTID: 1, POP: 2000000 } }),
      new Graphic({ geometry: new Point(B), attributes: { OBJECTID: 2, POP: 500 } }),
    ],
    objectIdField: "OBJECTID",
    fields: [{ name: "OBJECTID", type: "oid" }, { name: "POP", type: "integer" }],
    geometryType: "point", spatialReference: { wkid: 4326 },
    renderer: { type: "simple", symbol: { type: "simple-marker", style: "square", size: 30, color: [255, 0, 0], outline: null } } as never,
  });
}

async function vista(container: HTMLElement, l: FeatureLayer) {
  container.innerHTML = "";
  const div = document.createElement("div"); div.style.cssText = "width:400px;height:200px;background:#fff"; container.appendChild(div);
  const view = new MapView({ container: div, map: new Map({ layers: [l] }), extent: { xmin: -74.12, xmax: 73.96 * -1, ymin: 4.5, ymax: 4.7, spatialReference: { wkid: 4326 } } as never, background: { color: [255, 255, 255] } as never });
  const lv = await view.whenLayerView(l);
  while (lv.updating || view.updating) await tick();
  await tick(400);
  return { view, lv };
}
async function color(view: MapView, p: typeof A) {
  const s = await view.takeScreenshot({ format: "png" });
  const sp = view.toScreen(new Point(p))!;
  const ratio = s.data.width / view.width;
  const i = (Math.round(sp.y * ratio) * s.data.width + Math.round(sp.x * ratio)) * 4;
  const d = s.data.data;
  return `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`;
}
// Run-length of the row through the points: shows where each square is and how wide.
async function fila(view: MapView) {
  const s = await view.takeScreenshot({ format: "png" });
  const y = Math.round(view.toScreen(new Point(A))!.y * s.data.width / view.width);
  const d = s.data.data, out: string[] = [];
  let prev = "", n = 0;
  for (let x = 0; x < s.data.width; x++) {
    const i = (y * s.data.width + x) * 4;
    const c = d[i] > 240 && d[i + 1] > 240 ? "w" : d[i] > 200 && d[i + 1] < 60 ? "R" : d[i] === d[i + 1] && d[i] < 200 ? "g" : `(${d[i]},${d[i + 1]},${d[i + 2]})`;
    if (c === prev) n++; else { if (prev) out.push(`${prev}×${n}`); prev = c; n = 1; }
  }
  out.push(`${prev}×${n}`);
  return `${s.data.width}px: ${out.slice(0, 14).join(" ")}`;
}
async function con(view: MapView, lv: { updating: boolean }) { await tick(200); while (lv.updating || view.updating) await tick(); await tick(400); }

export async function run(container: HTMLElement) {
  return [
    await intento("Línea base y layer.effect = 'grayscale(100%)'", async () => {
      const l = capa(); const { view, lv } = await vista(container, l);
      const antes = await color(view, A);
      const f0 = await fila(view);
      l.effect = "grayscale(100%)"; await con(view, lv);
      const out = `sin efecto A=${antes} · grayscale A=${await color(view, A)} · A en ${JSON.stringify(view.toScreen(new Point(A)))} B en ${JSON.stringify(view.toScreen(new Point(B)))} · fila: ${f0}`;
      view.destroy(); return out;
    }),
    await intento("Pitfall 1: 'blur(2)' sin unidad vs 'blur(2px)'", async () => {
      const l = capa(); const avisos: string[] = [];
      const w = console.warn, e = console.error;
      console.warn = (...a: unknown[]) => { avisos.push(a.map(String).join(" ").slice(0, 120)); w(...a); };
      console.error = (...a: unknown[]) => { avisos.push(a.map(String).join(" ").slice(0, 120)); e(...a); };
      const { view, lv } = await vista(container, l);
      let lanza = "no";
      try { l.effect = "blur(2)"; } catch (err) { lanza = (err as Error).message; }
      await con(view, lv);
      const sin = `${await color(view, A)} / borde ${await color(view, { longitude: A.longitude + 0.0144, latitude: 4.6 })}`;
      l.effect = "blur(8px)"; await con(view, lv);
      const con8 = `${await fila(view)} · ${await color(view, A)} / borde ${await color(view, { longitude: A.longitude + 0.0144, latitude: 4.6 })}`;
      console.warn = w; console.error = e;
      view.destroy();
      return `blur(2): lanza=${lanza}, centro/borde=${sin} · blur(8px): ${con8} · avisos en consola=${avisos.length}${avisos.length ? ": " + avisos[0] : ""}`;
    }),
    await intento("Ejemplo 2: featureEffect included grayscale / excluded opacity(40%)", async () => {
      const l = capa(); const { view, lv } = await vista(container, l);
      l.featureEffect = new FeatureEffect({ filter: new FeatureFilter({ where: "POP > 1000000" }), includedEffect: "grayscale(100%)", excludedEffect: "opacity(40%)" });
      await con(view, lv);
      const out = `A (incluido) = ${await color(view, A)} · B (excluido) = ${await color(view, B)} · fila: ${await fila(view)}`;
      view.destroy(); return out;
    }),
    await intento("Pitfall ext. 2: featureEffect SIN filter", async () => {
      const l = capa(); const { view, lv } = await vista(container, l);
      l.featureEffect = new FeatureEffect({ includedEffect: "grayscale(100%)", excludedEffect: "opacity(20%)" });
      await con(view, lv);
      const out = `A = ${await color(view, A)} · B = ${await color(view, B)}`;
      view.destroy(); return out;
    }),
    await intento("Pitfall 2: excludedEffect opacity(0%) — ¿hitTest lo sigue encontrando?", async () => {
      const l = capa(); const { view, lv } = await vista(container, l);
      l.featureEffect = new FeatureEffect({ filter: new FeatureFilter({ where: "POP > 1000000" }), excludedEffect: "opacity(0%)" });
      await con(view, lv);
      const px = `${await color(view, B)} · fila: ${await fila(view)}`;
      const hit = await view.hitTest(view.toScreen(new Point(B))!);
      const ids = hit.results.map((r) => (r as { graphic?: Graphic }).graphic?.attributes?.OBJECTID).filter((x) => x != null);
      const q = await lv.queryFeatureCount();
      view.destroy();
      return `B se ve ${px} · hitTest en B → OBJECTID ${ids.join(",") || "ninguno"} · layerView.queryFeatureCount=${q}`;
    }),
    await intento("Filtro de verdad: layerView.filter (en vez de opacity 0)", async () => {
      const l = capa(); const { view, lv } = await vista(container, l);
      (lv as unknown as { filter: FeatureFilter }).filter = new FeatureFilter({ where: "POP > 1000000" });
      await con(view, lv);
      const hit = await view.hitTest(view.toScreen(new Point(B))!);
      const ids = hit.results.map((r) => (r as { graphic?: Graphic }).graphic?.attributes?.OBJECTID).filter((x) => x != null);
      const out = `B se ve ${await color(view, B)} · hitTest en B → ${ids.join(",") || "ninguno"} · layerView.queryFeatureCount=${await lv.queryFeatureCount()} · layer.queryFeatureCount=${await l.queryFeatureCount()}`;
      view.destroy(); return out;
    }),
    await intento("Efecto por escala: effect = [{ scale, value }]", async () => {
      const l = capa(); const { view, lv } = await vista(container, l);
      l.effect = [{ scale: 1e9, value: "grayscale(100%)" }, { scale: 1000, value: "grayscale(0%)" }];
      await con(view, lv);
      const out = `escala ${Math.round(view.scale)} → A=${await color(view, A)}`;
      view.destroy(); return out;
    }),
    await intento("Limitación: effect en un SceneView", async () => {
      container.innerHTML = "";
      const div = document.createElement("div"); div.style.cssText = "width:300px;height:200px"; container.appendChild(div);
      const l = capa();
      const view = new SceneView({ container: div, map: new Map({ layers: [l] }), center: [-74.04, 4.6], zoom: 12 });
      await view.when();
      let lanza = "no";
      try { l.effect = "grayscale(100%)"; } catch (err) { lanza = (err as Error).message; }
      await tick(1500);
      const out = `asignar no lanza=${lanza === "no"} · layer.effect quedó=${JSON.stringify(l.effect)} (el SDK documenta que no se aplica en 3D)`;
      view.destroy(); return out;
    }),
    await intento("Limitación: effect con clustering", async () => {
      const l = capa();
      l.featureReduction = { type: "cluster", clusterRadius: "20px" } as never;
      const { view, lv } = await vista(container, l);
      const antes = await color(view, A);
      l.effect = "grayscale(100%)"; await con(view, lv);
      const out = `con cluster: antes A=${antes} · tras grayscale A=${await color(view, A)}`;
      view.destroy(); return out;
    }),
  ];
}
