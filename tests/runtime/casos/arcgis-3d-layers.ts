import Map from "@arcgis/core/Map.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import MapView from "@arcgis/core/views/MapView.js";
import SceneLayer from "@arcgis/core/layers/SceneLayer.js";
import GaussianSplatLayer from "@arcgis/core/layers/GaussianSplatLayer.js";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer.js";

const BUILDINGS = "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Buildings_NewYork_17/SceneServer";
const SPLAT = "https://tiles.arcgis.com/tiles/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Portcoast_industrial/3DTilesServer/tileset.json";

async function intento(check: string, fn: () => Promise<string | void>) {
  try { return { check, ok: true, detail: (await fn()) ?? "" }; }
  catch (e) { return { check, ok: false, detail: String((e as Error)?.message ?? e) }; }
}

export async function run(container: HTMLElement) {
  const out = [];
  out.push(await intento("SceneLayer de la skill carga (servicio público)", async () => {
    const l = new SceneLayer({ url: BUILDINGS }); await l.load(); return `${l.title} · ${l.geometryType}`;
  }));
  out.push(await intento("GaussianSplatLayer con .ply (lo que enseñaba la skill): load() resuelve pero queda vacía", async () => {
    const l = new GaussianSplatLayer({ url: "https://example.com/splats/site.ply" }); await l.load();
    const ancho = l.fullExtent?.width ?? 0;
    if (l.loadError || ancho < 360) throw new Error(`cambió: loadError=${l.loadError} ancho=${ancho}`);
    return `load() resuelve, loadError=null, extent = mundo entero (${ancho}°): falla en silencio`;
  }));
  out.push(await intento("GaussianSplatLayer con 3DTilesServer/tileset.json carga", async () => {
    const l = new GaussianSplatLayer({ url: SPLAT }); await l.load();
    if (!l.fullExtent) throw new Error("sin extent");
    return `${l.title} · extent wkid ${l.fullExtent.spatialReference.wkid}`;
  }));
  out.push(await intento("IntegratedMeshLayer sobre un servicio 3DTiles — se espera que FALLE (tipo equivocado)", async () => {
    const l = new IntegratedMeshLayer({ url: SPLAT }); await l.load(); return "cargó";
  }).then((r) => ({ ...r, ok: !r.ok, detail: r.ok ? "cargó" : `falla: ${r.detail}` })));
  out.push(await intento("SceneLayer en MapView 2D: ¿se crea layerView?", async () => {
    const map = new Map({ basemap: "satellite" });
    const l = new SceneLayer({ url: BUILDINGS }); map.add(l);
    const view = new MapView({ map, container });
    await view.when();
    const lv = await view.whenLayerView(l).then(() => "sí").catch((e: Error) => `no: ${e.message}`);
    view.destroy();
    return `layerView en 2D: ${lv}`;
  }));
  out.push(await intento("SceneView: qualityProfile automático (sin fijarlo)", async () => {
    const map = new Map({ basemap: "satellite", ground: "world-elevation" });
    const view = new SceneView({ map, container });
    await view.when();
    const q = view.qualityProfile; view.destroy(); return `qualityProfile=${q}`;
  }));
  return out;
}
