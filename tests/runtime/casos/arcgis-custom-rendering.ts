import Map from "@arcgis/core/Map.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import MapView from "@arcgis/core/views/MapView.js";
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
import * as webgl from "@arcgis/core/views/3d/webgl.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import BaseLayerViewGL2D from "@arcgis/core/views/2d/layers/BaseLayerViewGL2D.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));

async function escena(container: HTMLElement) {
  container.innerHTML = "";
  const div = document.createElement("div");
  div.style.cssText = "width:300px;height:200px";
  container.appendChild(div);
  const view = new SceneView({ container: div, map: new Map({ basemap: "osm" }), camera: { position: { longitude: -74.08, latitude: 4.6, z: 20000 }, tilt: 0 } });
  await view.when();
  await tick(1500);
  return view;
}

// Paints the top-left 40×40 px of the composite red, so the screenshot proves the node ran.
function pintarRojo(this: RenderNode & { n: number }) {
  this.n = (this.n ?? 0) + 1;
  const gl = this.gl;
  const out = this.bindRenderTarget();
  gl.enable(gl.SCISSOR_TEST);
  gl.scissor(0, gl.drawingBufferHeight - 40, 40, 40);
  gl.clearColor(1, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.SCISSOR_TEST);
  return out;
}

async function pixel(view: SceneView) {
  const s = await view.takeScreenshot({ format: "png", width: 300, height: 200 });
  const d = s.data.data;
  let rojos = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] < 40 && d[i + 2] < 40) rojos++;
  return `rgb(${d[0]},${d[1]},${d[2]}) en (0,0) · píxeles rojos=${rojos}`;
}

export async function run(container: HTMLElement) {
  return [
    await intento("Ejemplo 2 de la skill: consumes: [{ name: 'composite-color' }]", async () => {
      const view = await escena(container);
      const Nodo = RenderNode.createSubclass({ produces: "composite-color", render: pintarRojo });
      let n: RenderNode & { n: number };
      try {
        n = new Nodo({ view, consumes: [{ name: "composite-color" }] as never }) as never;
      } catch (e) { view.destroy(); return `el constructor lanza: ${(e as Error).message}`; }
      view.environment.lighting.date = new Date(); await tick(1500);
      const out = `render llamado ${n.n ?? 0} veces · ${await pixel(view)}`;
      n.destroy(); view.destroy();
      return out;
    }),
    await intento("Correcto: createSubclass con consumes { required: ['composite-color'] }", async () => {
      const view = await escena(container);
      const Nodo = RenderNode.createSubclass({ consumes: { required: ["composite-color"] }, produces: "composite-color", render: pintarRojo });
      const n = new Nodo({ view }) as RenderNode & { n: number };
      await tick(1500);
      const quieto = n.n ?? 0;
      await tick(3000);
      const quieto2 = n.n ?? 0;
      n.requestRender(); await tick(3000);
      const tras = n.n;
      const px = await pixel(view);
      n.destroy(); await tick(300);
      const despues = n.n; view.camera = view.camera.clone().set({ heading: 30 }) as never; await tick(800);
      const out = `${px} · render: ${quieto} al inicio, ${quieto2} 1,5 s después sin mover nada, ${tras} tras requestRender() · tras destroy() y mover la cámara: ${n.n} (antes ${despues})`;
      view.destroy();
      return out;
    }),
    await intento("Clase ES6 `class X extends RenderNode` sin @subclass", async () => {
      const view = await escena(container);
      class Nodo extends RenderNode {
        n = 0;
        override render() { return pintarRojo.call(this as never); }
      }
      let r: string;
      try {
        const n = new Nodo({ view, consumes: { required: ["composite-color"] }, produces: "composite-color" }) as never as RenderNode & { n: number };
        await tick(1500);
        r = `render llamado ${n.n} veces · ${await pixel(view)}`;
        n.destroy();
      } catch (e) { r = `lanza: ${(e as Error).message}`; }
      view.destroy();
      return r;
    }),
    await intento("Sin resetear estado GL: dejar SCISSOR_TEST encendido", async () => {
      const view = await escena(container);
      const s0 = await view.takeScreenshot({ format: "png", width: 300, height: 200 });
      const base = s0.data.data;
      const Nodo = RenderNode.createSubclass({
        consumes: { required: ["composite-color"] }, produces: "composite-color",
        render() {
          const out = this.bindRenderTarget();
          const gl = this.gl;
          gl.enable(gl.SCISSOR_TEST); gl.scissor(0, 0, 1, 1); // and never disables it
          return out;
        },
      });
      const n = new Nodo({ view });
      view.camera = view.camera.clone().set({ heading: 90 }) as never;
      await tick(2000);
      const s = await view.takeScreenshot({ format: "png", width: 300, height: 200 });
      const d = s.data.data; let iguales = 0, distintos = 0;
      for (let i = 0; i < d.length; i += 4 * 97) { if (d[i] !== d[0] || d[i + 1] !== d[1]) distintos++; if (d[i] === base[i]) iguales++; }
      n.destroy(); view.destroy();
      return `con el scissor sucio y la cámara girada 90°: muestra con variación=${distintos} · iguales a antes de girar=${iguales}/${Math.ceil(d.length / 388)}`;
    }),
    await intento("toRenderCoordinates en global: Bogotá → ECEF", async () => {
      const view = await escena(container);
      const out = new Float64Array(3);
      webgl.toRenderCoordinates(view, [-74.08, 4.6, 2600], 0, SpatialReference.WGS84, out, 0, 1);
      const r = Math.hypot(out[0], out[1], out[2]);
      const mal = Math.hypot(-74.08, 4.6, 2600);
      const res = `viewingMode=${view.viewingMode} · ECEF=[${[...out].map((v) => v.toFixed(0)).join(", ")}] · |r|=${r.toFixed(0)} (6378137+2600) · coordenadas crudas usadas como si fueran de render: |r|=${mal.toFixed(0)} m del centro de la Tierra`;
      view.destroy();
      return res;
    }),
    await intento("camera del nodo: view/projection matrix y pixelRatio", async () => {
      const view = await escena(container);
      let info = "";
      const Nodo = RenderNode.createSubclass({
        consumes: { required: ["composite-color"] }, produces: "composite-color",
        render() { const c = this.camera; info = `viewMatrix=${c.viewMatrix.length} · projectionMatrix=${c.projectionMatrix.length} · viewport=${c.viewport.join("x")} · pixelRatio=${c.pixelRatio} · gl=${this.gl.constructor.name}`; return this.bindRenderTarget(); },
      });
      const n = new Nodo({ view }); n.requestRender(); await tick(3000);
      n.destroy(); view.destroy();
      return info || "render no se llamó";
    }),
    await intento("externalRenderers en 5.1: ¿existe el módulo?", async () => {
      const r = await fetch("/node_modules/@arcgis/core/views/3d/externalRenderers.js");
      const t = r.ok ? await r.text() : "";
      return `GET externalRenderers.js → ${r.status}${t.includes("export") ? " (módulo)" : " (no es un módulo del SDK)"}`;
    }),
    await intento("2D: BaseLayerViewGL2D en un MapView (la skill decía que no hay WebGL en 2D)", async () => {
      container.innerHTML = "";
      const div = document.createElement("div"); div.style.cssText = "width:300px;height:200px"; container.appendChild(div);
      let n = 0, ctx = "";
      const LV = BaseLayerViewGL2D.createSubclass({
        render(p: { context: WebGL2RenderingContext }) { n++; ctx = p.context.constructor.name; },
      });
      const Capa = GraphicsLayer.createSubclass({ createLayerView(view: MapView) { if (view.type === "2d") return new LV({ view, layer: this }); } });
      const view = new MapView({ container: div, map: new Map({ basemap: "osm", layers: [new Capa()] }), center: [-74.08, 4.6], zoom: 10 });
      await view.when(); await tick(1500);
      const out = `render 2D llamado ${n} veces · contexto ${ctx}`;
      view.destroy();
      return out;
    }),
  ];
}
