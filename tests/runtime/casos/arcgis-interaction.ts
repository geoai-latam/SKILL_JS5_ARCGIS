import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-sketch";
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
const BOG = { longitude: -74.08, latitude: 4.6 };
// Public sample: US states (MapServer/2).
const ESTADOS = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2";

function cuadros(etiquetas = false) {
  return new FeatureLayer({
    title: "cuadros",
    source: [new Graphic({ geometry: new Point(BOG), attributes: { OBJECTID: 1, NOMBRE: "Bogotá", POP: 7900000 } })],
    objectIdField: "OBJECTID",
    fields: [{ name: "OBJECTID", type: "oid" }, { name: "NOMBRE", type: "string" }, { name: "POP", type: "integer" }],
    geometryType: "point", spatialReference: { wkid: 4326 },
    labelingInfo: etiquetas ? [{ labelExpressionInfo: { expression: "$feature.NOMBRE" }, labelPlacement: "center-right" }] as never : [],
    renderer: { type: "simple", symbol: { type: "simple-marker", style: "square", size: 30, color: [255, 0, 0] } } as never,
  });
}
async function vista(container: HTMLElement, layers: never[], extra: Record<string, unknown> = {}) {
  container.innerHTML = "";
  const div = document.createElement("div"); div.style.cssText = "width:400px;height:300px"; container.appendChild(div);
  const view = new MapView({ container: div, map: new Map({ layers }), extent: { xmin: -74.2, xmax: -73.96, ymin: 4.5, ymax: 4.7, spatialReference: { wkid: 4326 } }, ...extra } as never);
  await view.when();
  const t0 = performance.now();
  while (view.updating && performance.now() - t0 < 8000) await tick();
  await tick(500);
  return view;
}
const resumen = (rs: { type: string; layer?: { title?: string | null } | null }[]) =>
  rs.map((r) => `${r.type}:${r.layer?.title ?? "sin capa"}`).join(", ") || "vacío";

// Synthetic pointer click on the view surface, like a user would do.
function clic(view: MapView, x: number, y: number) {
  const s = view.surface as HTMLElement;
  const r = s.getBoundingClientRect();
  const o = { clientX: r.left + x, clientY: r.top + y, bubbles: true, pointerId: 1, pointerType: "mouse", button: 0, buttons: 1, isPrimary: true };
  s.dispatchEvent(new PointerEvent("pointerdown", o));
  s.dispatchEvent(new PointerEvent("pointerup", { ...o, buttons: 0 }));
}

export async function run(container: HTMLElement) {
  return [
    await intento("hitTest sin include: dos capas apiladas en el mismo punto", async () => {
      const fl = cuadros();
      const gl = new GraphicsLayer({ title: "dibujos", graphics: [new Graphic({ geometry: new Point(BOG), symbol: { type: "simple-marker", size: 40, color: [0, 0, 255, 0.3] } as never })] });
      const view = await vista(container, [fl, gl] as never);
      const sp = view.toScreen(new Point(BOG))!;
      const todo = await view.hitTest(sp);
      const solo = await view.hitTest(sp, { include: [fl] });
      const sin = await view.hitTest(sp, { exclude: [gl] });
      view.destroy();
      return `sin filtro: [${resumen(todo.results)}] · include fl: [${resumen(solo.results)}] · exclude gl: [${resumen(sin.results)}]`;
    }),
    await intento("hitTest sobre la etiqueta (no el símbolo)", async () => {
      const fl = cuadros(true);
      const view = await vista(container, [fl] as never);
      const sp = view.toScreen(new Point(BOG))!;
      const r = await view.hitTest({ x: sp.x + 40, y: sp.y });
      const g = r.results[0]?.type === "graphic" ? r.results[0].graphic : null;
      view.destroy();
      return `a 40 px a la derecha (sobre el texto): [${resumen(r.results)}] · graphic.NOMBRE=${g?.attributes?.NOMBRE ?? "-"}`;
    }),
    await intento("results[i].type: hay que estrechar antes de leer .graphic", async () => {
      const fl = cuadros();
      const view = await vista(container, [fl] as never);
      const r = await view.hitTest(view.toScreen(new Point(BOG))!);
      const h = r.results[0];
      view.destroy();
      return `type=${h?.type} · keys=${Object.keys(h ?? {}).join(",")}`;
    }),
    await intento("hitTest sobre una FeatureLayer de servicio: ¿qué atributos trae el graphic?", async () => {
      const def = new FeatureLayer({ url: ESTADOS, title: "estados" });
      const view = await vista(container, [def] as never, { extent: { xmin: -104, xmax: -93, ymin: 35, ymax: 42, spatialReference: { wkid: 4326 } } });
      const sp = { x: 200, y: 150 };
      const a = (await view.hitTest(sp, { include: [def] })).results[0];
      const ka = a?.type === "graphic" ? Object.keys(a.graphic.attributes ?? {}) : [];
      view.destroy();
      const full = new FeatureLayer({ url: ESTADOS, title: "estados", outFields: ["*"] });
      const v2 = await vista(container, [full] as never, { extent: { xmin: -104, xmax: -93, ymin: 35, ymax: 42, spatialReference: { wkid: 4326 } } });
      const b = (await v2.hitTest(sp, { include: [full] })).results[0];
      const kb = b?.type === "graphic" ? Object.keys(b.graphic.attributes ?? {}) : [];
      const nombre = b?.type === "graphic" ? b.graphic.attributes?.state_name : "-";
      v2.destroy();
      return `por defecto: ${ka.length} campos (${ka.join(",")}) · outFields ["*"]: ${kb.length} campos · state_name=${nombre}`;
    }),
    await intento("SceneView: clic en el suelo vacío", async () => {
      container.innerHTML = "";
      const div = document.createElement("div"); div.style.cssText = "width:400px;height:300px"; container.appendChild(div);
      const fl = cuadros();
      const view = new SceneView({ container: div, map: new Map({ layers: [fl], ground: "world-elevation" }), center: [BOG.longitude, BOG.latitude], zoom: 10 } as never);
      await view.when(); while (view.updating) await tick(); await tick(800);
      const vacio = await view.hitTest({ x: 20, y: 280 });
      const lleno = await view.hitTest(view.toScreen(new Point(BOG))!);
      view.destroy();
      return `suelo vacío: results=[${resumen(vacio.results)}] · ground.mapPoint=${vacio.ground?.mapPoint ? "sí" : "no"} · sobre el cuadro: [${resumen(lleno.results)}]`;
    }),
    await intento("SketchViewModel: create('point') + clic: estados del evento", async () => {
      const gl = new GraphicsLayer();
      const view = await vista(container, [gl] as never);
      const sk = new SketchViewModel({ view, layer: gl });
      const estados: string[] = [];
      sk.on("create", (e) => estados.push(e.state));
      const p = sk.create("point");
      await tick(300);
      clic(view, 200, 150);
      await tick(800);
      const r = await Promise.race([p.then(() => "resuelta"), tick(50).then(() => "pendiente")]);
      const out = `legacy=${sk.isUsingLegacyCreateTools} · create() devuelve ${p instanceof Promise ? "Promise" : typeof p} (${r}) · estados=[${estados.join(",")}] · gráficos en la capa=${gl.graphics.length}`;
      sk.destroy(); view.destroy();
      return out;
    }),
    await intento("SketchViewModel: polígono con tres clics y complete()", async () => {
      const gl = new GraphicsLayer();
      const view = await vista(container, [gl] as never);
      const sk = new SketchViewModel({ view, layer: gl });
      const estados: string[] = [];
      sk.on("create", (e) => { if (estados.at(-1) !== e.state) estados.push(e.state); });
      let activos = 0; sk.on("create", (e) => { if (e.state === "active") activos++; });
      sk.create("polygon");
      await tick(300);
      for (const [x, y] of [[100, 100], [300, 100], [200, 250]]) { clic(view, x, y); await tick(250); }
      sk.complete();
      await tick(400);
      const g = gl.graphics.at(0);
      const out = `estados (sin repetir)=[${estados.join(",")}] · eventos 'active'=${activos} · anillo=${(g?.geometry as { rings?: number[][][] })?.rings?.[0]?.length ?? 0} vértices`;
      sk.destroy(); view.destroy();
      return out;
    }),
    await intento("Pitfall 5: create() dos veces seguidas", async () => {
      const gl = new GraphicsLayer();
      const view = await vista(container, [gl] as never);
      const sk = new SketchViewModel({ view, layer: gl });
      const ev: string[] = [];
      sk.on("create", (e) => ev.push(`${e.tool}:${e.state}`));
      sk.create("polygon");
      await tick(200);
      clic(view, 100, 100); await tick(250);
      sk.create("polyline");
      await tick(400);
      const out = `eventos=[${[...new Set(ev)].join(", ")}] · activeTool=${sk.activeTool} · state=${sk.state}`;
      sk.destroy(); view.destroy();
      return out;
    }),
    await intento("Pitfall 2: destroy() del SketchViewModel", async () => {
      const gl = new GraphicsLayer();
      const view = await vista(container, [gl] as never);
      const sk = new SketchViewModel({ view, layer: gl });
      sk.create("point"); await tick(200); clic(view, 200, 150); await tick(500);
      const antes = gl.graphics.length;
      sk.create("polygon"); await tick(200);
      sk.destroy(); await tick(200);
      const out = `gráficos antes=${antes} · después de destroy=${gl.graphics.length} · capas en el mapa=${view.map?.layers.length} · destroyed=${sk.destroyed}`;
      view.destroy();
      return out;
    }),
    await intento("view.on('click'): qué trae el evento y handle.remove()", async () => {
      const view = await vista(container, [new GraphicsLayer()] as never);
      const vistos: string[] = [];
      const h = view.on("click", (e) => vistos.push(`x=${e.x.toFixed(0)},mapPoint=${e.mapPoint ? "sí" : "no"}`));
      let movs = 0;
      const hm = view.on("pointer-move", () => movs++);
      clic(view, 120, 80); await tick(500);
      const s = view.surface as HTMLElement, r = s.getBoundingClientRect();
      for (let i = 0; i < 30; i++) s.dispatchEvent(new PointerEvent("pointermove", { clientX: r.left + 10 + i, clientY: r.top + 10, bubbles: true, pointerId: 1, pointerType: "mouse" }));
      await tick(200);
      h.remove(); hm.remove();
      clic(view, 120, 80); await tick(500);
      view.destroy();
      return `clics=${vistos.length} [${vistos.join(" | ")}] · pointer-move recibidos de 30 movimientos=${movs}`;
    }),
    await intento("pointer-move + hitTest: promiseUtils.debounce", async () => {
      const fl = cuadros();
      const view = await vista(container, [fl] as never);
      let crudos = 0, hechos = 0, abortados = 0;
      const sp = view.toScreen(new Point(BOG))!;
      const crudo = Array.from({ length: 30 }, () => view.hitTest(sp).then(() => crudos++));
      await Promise.all(crudo);
      const deb = promiseUtils.debounce(async (x: number, y: number) => view.hitTest({ x, y }));
      await Promise.allSettled(Array.from({ length: 30 }, (_, i) => deb(sp.x + i * 0.1, sp.y).then(() => hechos++, (e) => { if (promiseUtils.isAbortError(e)) abortados++; })));
      view.destroy();
      return `sin debounce: ${crudos} hitTests corridos · con debounce: ${hechos} resueltos, ${abortados} abortados (AbortError)`;
    }),
    await intento("arcgis-sketch (componente) junto a arcgis-map", async () => {
      container.innerHTML = "";
      const map = document.createElement("arcgis-map") as HTMLElement & { viewOnReady(): Promise<void>; view: MapView; center: unknown; zoom: number };
      map.style.cssText = "display:block;width:400px;height:300px";
      map.center = [BOG.longitude, BOG.latitude] as never; map.zoom = 10;
      const sk = document.createElement("arcgis-sketch") as HTMLElement & { componentOnReady(): Promise<unknown>; layer?: GraphicsLayer; creationMode: string; availableCreateTools?: string[] };
      let listo = false; sk.addEventListener("arcgisReady", () => { listo = true; });
      map.appendChild(sk); container.appendChild(map);
      await map.viewOnReady();
      await sk.componentOnReady(); await tick(800);
      return `arcgisReady=${listo} · layer=${sk.layer ? `${sk.layer.type} en el mapa=${map.view.map?.layers.includes(sk.layer as never)}` : "null"} · creationMode=${sk.creationMode} · herramientas=${sk.availableCreateTools?.join(",")}`;
    }),
  ];
}
