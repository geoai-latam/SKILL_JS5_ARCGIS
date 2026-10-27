import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer.js";
import RasterFunction from "@arcgis/core/layers/support/RasterFunction.js";
import * as rasterFunctionUtils from "@arcgis/core/layers/support/rasterFunctionUtils.js";
import Point from "@arcgis/core/geometry/Point.js";
import { intento } from "./_util.ts";

// Public Esri Landsat 8 service (metadata answers fast; identify/query hung >60 s on 2026-10-27).
const LANDSAT = "https://landsat2.arcgis.com/arcgis/rest/services/Landsat/MS/ImageServer";
// Public 4-band sample (Blue, Green, Red, NearInfrared; 0-based 0..3), fast identify.
const TORONTO = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Toronto/ImageServer";
const SELVA = new Point({ longitude: -79.392, latitude: 43.663 }); // Queen's Park (trees)
const RIO = new Point({ longitude: -79.37, latitude: 43.633 });    // Toronto harbour (water)

async function valor(rf: RasterFunction | undefined, p: Point) {
  const l = new ImageryLayer({ url: TORONTO, rasterFunction: rf });
  await l.load();
  const r = await l.identify({ geometry: p });
  const v = r.value as unknown;
  return Array.isArray(v) ? (v.length === 1 ? v[0] : v.join(",")) : v ?? null;
}
const ndvi = (vis: number, nir: number) => new RasterFunction({ functionName: "NDVI", functionArguments: { VisibleBandID: vis, InfraredBandID: nir } });
const f = (v: unknown) => (typeof v === "number" ? v.toFixed(3) : String(v));

export async function run() {
  return [
    await intento("Servicio: bandas y tipo de píxel", async () => {
      const l = new ImageryLayer({ url: LANDSAT }); await l.load();
      return `${l.serviceRasterInfo?.bandCount} bandas · ${l.serviceRasterInfo?.pixelType} · bandas: ${l.serviceRasterInfo?.keyProperties?.BandProperties?.map((b: { BandName?: string }) => b.BandName).slice(0, 6).join(", ") ?? "?"}`;
    }),
    await intento("Píxeles crudos (B, G, R, NIR) y NDVI calculado a mano", async () => {
      const raw = async (p: Point) => String(await valor(undefined, p)).split(",").map(Number);
      const [b1, g1, r1, n1] = await raw(SELVA), [, , r2, n2] = await raw(RIO);
      return `parque=${[b1, g1, r1, n1].join("/")} → (NIR−R)/(NIR+R)=${((n1 - r1) / (n1 + r1)).toFixed(3)} · agua → ${((n2 - r2) / (n2 + r2)).toFixed(3)}`;
    }),
    await intento("Ejemplo de la skill: NDVI { VisibleBandID: 2, InfraredBandID: 3 } (correcto para B,G,R,NIR)", async () => {
      return `parque=${f(await valor(ndvi(2, 3), SELVA))} · agua=${f(await valor(ndvi(2, 3), RIO))}`;
    }),
    await intento("NDVI con 3 y 4 (contando bandas desde 1)", async () => {
      try { return `parque=${f(await valor(ndvi(3, 4), SELVA))} · agua=${f(await valor(ndvi(3, 4), RIO))}`; }
      catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("NDVI con Verde=1, Rojo=2 (banda equivocada)", async () => {
      return `parque=${f(await valor(ndvi(1, 3), SELVA))} · agua=${f(await valor(ndvi(1, 3), RIO))}`;
    }),
    await intento("Pitfall 2: NDVI sin argumentos", async () => {
      const rf = new RasterFunction({ functionName: "NDVI", functionArguments: {} });
      try { return `selva=${f(await valor(rf, SELVA))} · río=${f(await valor(rf, RIO))}`; }
      catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 })", async () => {
      const rf = rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 });
      return `functionName=${rf.functionName} · selva=${f(await valor(rf, SELVA))} · río=${f(await valor(rf, RIO))}`;
    }),
    await intento("renderingRule (4.x) en 5.1", async () => {
      const l = new ImageryLayer({ url: TORONTO, renderingRule: { functionName: "NDVI", functionArguments: { VisibleBandID: 2, InfraredBandID: 3 } } } as never);
      await l.load();
      const r = await l.identify({ geometry: SELVA });
      return `"renderingRule" en la capa=${"renderingRule" in l} · rasterFunction=${l.rasterFunction?.functionName ?? "null"} · identify en selva=${f(r.value?.[0] ?? r.value)}`;
    }),
    await intento("Pitfall 1: ImageryTileLayer acepta rasterFunction (procesa en el cliente)", async () => {
      const l = new ImageryTileLayer({ rasterFunction: rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 }) } as never);
      return `rasterFunction en ImageryTileLayer=${l.rasterFunction?.functionName ?? "ignorado"}`;
    }),
    await intento("queryRasters: consulta de escenas tipo features", async () => {
      const l = new ImageryLayer({ url: TORONTO }); await l.load();
      const fs = await l.queryRasters({ geometry: SELVA, outFields: ["*"], num: 3, returnGeometry: false } as never);
      return `${fs.features.length} escenas · primera: ${fs.features[0]?.attributes?.Name} · campos=${Object.keys(fs.features[0]?.attributes ?? {}).slice(0, 6).join(",")}`;
    }),
  ];
}
