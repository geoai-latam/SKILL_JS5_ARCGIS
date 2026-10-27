import CIMSymbol from "@arcgis/core/symbols/CIMSymbol.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import Color from "@arcgis/core/Color.js";
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import * as cimSymbolUtils from "@arcgis/core/symbols/support/cimSymbolUtils.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { intento } from "./_util.ts";

type Capa = Record<string, unknown>;
const relleno = (extra: Capa = {}) => ({ type: "CIMSolidFill", enable: true, color: [255, 0, 0, 255], ...extra });
const marcador = (opts: { size?: number; rings?: number[][][]; fill?: Capa; name?: string } = {}) => ({
  type: "CIMVectorMarker",
  enable: true,
  size: opts.size ?? 20,
  ...(opts.name ? { primitiveName: opts.name } : {}),
  frame: { xmin: 0, ymin: 0, xmax: 16, ymax: 16 },
  markerGraphics: [{
    type: "CIMMarkerGraphic",
    geometry: { rings: opts.rings ?? [[[0, 0], [16, 0], [16, 16], [0, 16], [0, 0]]] },
    symbol: { type: "CIMPolygonSymbol", symbolLayers: [opts.fill ?? relleno()] },
  }],
});
const ref = (layers: unknown[], extra: Capa = {}) => ({ type: "CIMSymbolReference", symbol: { type: "CIMPointSymbol", symbolLayers: layers }, ...extra });

/** Draws the symbol preview to a canvas and measures what got painted. */
async function medir(data: unknown) {
  const sym = new CIMSymbol({ data: data as never });
  const el = await symbolUtils.renderPreviewHTML(sym);
  const node = el as HTMLElement;
  let img: CanvasImageSource;
  let w: number, h: number;
  if (node instanceof HTMLCanvasElement) { img = node; w = node.width; h = node.height; }
  else {
    const c = node.querySelector("canvas");
    if (c) { img = c; w = c.width; h = c.height; }
    else {
      const svg = node instanceof SVGElement ? node : node.querySelector("svg");
      const im = node instanceof HTMLImageElement ? node : node.querySelector("img");
      const src = im ? im.src : svg ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg)) : "";
      if (!src) return { pintados: 0, alto: 0, ancho: 0, alfa: 0, tag: node.tagName };
      const i = new Image(); i.src = src; await i.decode();
      img = i; w = i.naturalWidth || 64; h = i.naturalHeight || 64;
    }
  }
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d")!; ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, w, h).data;
  let pintados = 0, alfa = 0, minY = h, maxY = -1, minX = w, maxX = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const a = d[(y * w + x) * 4 + 3];
    if (a > 0) { pintados++; alfa = Math.max(alfa, a); minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
  }
  return { pintados, alto: maxY - minY + 1, ancho: maxX - minX + 1, alfa, tag: node.tagName };
}
const fmt = (m: Awaited<ReturnType<typeof medir>>) => `px pintados=${m.pintados} · caja=${m.ancho}×${m.alto} · alfa máx=${m.alfa} (${m.tag})`;

export async function run(container: HTMLElement) {
  const r = [
    await intento("Ejemplo 1 de la skill: cuadrado rojo envuelto en CIMSymbolReference", async () => fmt(await medir(ref([marcador()])))),
    await intento("Quick Start de la skill: symbolLayers: [] — ¿dibuja algo?", async () => fmt(await medir(ref([])))),
    await intento("Pitfall 1: data = CIMPointSymbol sin CIMSymbolReference", async () => {
      try { return fmt(await medir({ type: "CIMPointSymbol", symbolLayers: [marcador()] })); }
      catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("Pitfall 2: CIMSolidFill sin enable", async () => {
      const { enable, ...sin } = relleno(); void enable;
      return fmt(await medir(ref([marcador({ fill: sin })])));
    }),
    await intento("Pitfall 2 bis: marcador entero sin enable", async () => {
      const { enable, ...sin } = marcador(); void enable;
      return fmt(await medir(ref([sin])));
    }),
    await intento("Orden: symbolLayers[0] rojo y [1] azul, mismo tamaño — ¿cuál queda encima?", async () => {
      const azul = marcador({ fill: relleno({ color: [0, 0, 255, 255] }) });
      const sym = new CIMSymbol({ data: ref([marcador(), azul]) as never });
      const el = (await symbolUtils.renderPreviewHTML(sym)) as HTMLElement;
      const im = (el instanceof HTMLImageElement ? el : el.querySelector("img"))!;
      await im.decode();
      const cv = document.createElement("canvas"); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
      const ctx = cv.getContext("2d")!; ctx.drawImage(im, 0, 0);
      const [r, g, b] = ctx.getImageData(cv.width >> 1, cv.height >> 1, 1, 1).data;
      return `centro = rgb(${r},${g},${b}) → encima queda ${r > b ? "la capa [0]" : "la capa [1]"}`;
    }),
    await intento("enable: false explícito en el relleno", async () => fmt(await medir(ref([marcador({ fill: relleno({ enable: false }) })])))),
    await intento("Pitfall 3: alfa 1 (escala 0–1) frente a 255", async () => {
      const uno = await medir(ref([marcador({ fill: relleno({ color: [255, 0, 0, 1] }) })]));
      const todo = await medir(ref([marcador({ fill: relleno({ color: [255, 0, 0, 255] }) })]));
      return `alfa 1 → alfa máx ${uno.alfa} · alfa 255 → alfa máx ${todo.alfa}`;
    }),
    await intento("Tamaño: size 20 y size 40 — ¿puntos o píxeles?", async () => {
      const a = await medir(ref([marcador({ size: 20 })]));
      const b = await medir(ref([marcador({ size: 40 })]));
      return `size 20 → ${a.alto} px de alto · size 40 → ${b.alto} px (20 pt = 26,7 px)`;
    }),
    await intento("Pitfall ext. 1: geometría fuera del frame (anillo hasta 100 en un frame 0..16)", async () => {
      const dentro = await medir(ref([marcador()]));
      const fuera = await medir(ref([marcador({ rings: [[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]]] })]));
      return `dentro → ${dentro.ancho}×${dentro.alto} · fuera → ${fuera.ancho}×${fuera.alto}`;
    }),
    await intento("Pitfall ext. 2: el mismo CIMSymbol en dos SimpleRenderer — ¿se comparte?", async () => {
      const sym = new CIMSymbol({ data: ref([marcador()]) as never });
      const r1 = new SimpleRenderer({ symbol: sym });
      const r2 = new SimpleRenderer({ symbol: sym });
      cimSymbolUtils.applyCIMSymbolColor(r1.symbol as CIMSymbol, new Color([0, 0, 255, 1]));
      const c2 = cimSymbolUtils.getCIMSymbolColor(r2.symbol as CIMSymbol);
      return `r1.symbol === r2.symbol: ${r1.symbol === r2.symbol} · color de r2 tras cambiar r1: ${c2?.toHex()}`;
    }),
    await intento("cimSymbolUtils: getCIMSymbolSize / scaleCIMSymbolTo", async () => {
      const sym = new CIMSymbol({ data: ref([marcador({ size: 20 })]) as never });
      const antes = cimSymbolUtils.getCIMSymbolSize(sym);
      cimSymbolUtils.scaleCIMSymbolTo(sym, 40);
      return `antes ${antes} · después ${cimSymbolUtils.getCIMSymbolSize(sym)}`;
    }),
  ];

  const override = (prop: string) => async () => {
    container.innerHTML = "";
    const div = document.createElement("div"); div.style.cssText = "width:400px;height:200px"; container.appendChild(div);
    const pts = [{ x: -40, s: 8 }, { x: 40, s: 40 }];
    const layer = new FeatureLayer({
      source: pts.map((p, i) => new Graphic({ geometry: new Point({ longitude: p.x, latitude: 0 }), attributes: { oid: i + 1, s: p.s } })),
      objectIdField: "oid",
      fields: [{ name: "oid", type: "oid" }, { name: "s", type: "integer" }],
      geometryType: "point",
      spatialReference: { wkid: 4326 },
      renderer: new SimpleRenderer({
        symbol: new CIMSymbol({
          data: ref([marcador({ size: 10, name: "m" })], {
            primitiveOverrides: [{
              type: "CIMPrimitiveOverride", primitiveName: "m", propertyName: prop,
              valueExpressionInfo: { type: "CIMExpressionInfo", title: "s", expression: "$feature.s", returnType: "Default" },
            }],
          }) as never,
        }),
      }),
    });
    const view = new MapView({ container: div, map: new Map({ layers: [layer] }), center: [0, 0], scale: 150000000, ui: { components: [] } });
    await view.when();
    const lv = await view.whenLayerView(layer);
    await reactiveUtils.whenOnce(() => !lv.updating);
    await new Promise((ok) => setTimeout(ok, 1500));
    const shot = await view.takeScreenshot({ format: "png" });
    const { data, width, height } = shot.data;
    let izq = 0, der = 0;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i] > 200 && data[i + 1] < 60 && data[i + 2] < 60) { if (x < width / 2) izq++; else der++; }
    }
    view.destroy();
    return `px rojos: s=8 → ${izq} · s=40 → ${der}`;
  };
  r.push(await intento("primitiveOverrides: Size desde $feature.s en un MapView (2 puntos, s=8 y s=40)", override("Size")));
  r.push(await intento("primitiveOverrides con propertyName en minúscula (\"size\")", override("size")));
  r.push(await intento("En el mapa: relleno SIN enable (izq.) frente a enable: false (der.)", async () => {
    container.innerHTML = "";
    const div = document.createElement("div"); div.style.cssText = "width:400px;height:200px"; container.appendChild(div);
    const { enable, ...sin } = relleno(); void enable;
    const capa = (x: number, fill: Capa) => new FeatureLayer({
      source: [new Graphic({ geometry: new Point({ longitude: x, latitude: 0 }), attributes: { oid: 1 } })],
      objectIdField: "oid", fields: [{ name: "oid", type: "oid" }], geometryType: "point", spatialReference: { wkid: 4326 },
      renderer: new SimpleRenderer({ symbol: new CIMSymbol({ data: ref([marcador({ size: 30, fill })]) as never }) }),
    });
    const a = capa(-40, sin), b = capa(40, relleno({ enable: false }));
    const view = new MapView({ container: div, map: new Map({ layers: [a, b] }), center: [0, 0], scale: 150000000, ui: { components: [] } });
    await view.when();
    for (const l of [a, b]) { const lv = await view.whenLayerView(l); await reactiveUtils.whenOnce(() => !lv.updating); }
    await new Promise((ok) => setTimeout(ok, 1500));
    const { data, width, height } = (await view.takeScreenshot({ format: "png" })).data;
    let izq = 0, der = 0;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i] > 200 && data[i + 1] < 60 && data[i + 2] < 60) { if (x < width / 2) izq++; else der++; }
    }
    view.destroy();
    return `px rojos: sin enable → ${izq} · enable:false → ${der}`;
  }));
  return r;
}
