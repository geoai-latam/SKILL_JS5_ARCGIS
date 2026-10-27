import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import * as geographicTransformationUtils from "@arcgis/core/geometry/operators/support/geographicTransformationUtils.js";
import * as intersectsOperator from "@arcgis/core/geometry/operators/intersectsOperator.js";
import * as geodeticDistanceOperator from "@arcgis/core/geometry/operators/geodeticDistanceOperator.js";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import Point from "@arcgis/core/geometry/Point.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import { intento } from "./_util.ts";

const sr = (wkid: number) => new SpatialReference({ wkid });
// Plaza de Bolívar, Bogotá (approx.)
const BOGOTA = { x: -74.0761, y: 4.5981 };
const p = (wkid = 4326, z?: number) => new Point({ x: BOGOTA.x, y: BOGOTA.y, ...(z !== undefined ? { z } : {}), spatialReference: sr(wkid) });
const f = (n: number | undefined, d = 2) => (n === undefined ? "—" : n.toFixed(d));

export async function run() {
  const r = [
    await intento("execute ANTES de load()", async () => {
      const antes = projectOperator.isLoaded();
      try { const g = projectOperator.execute(p(), sr(3116)) as Point; return `isLoaded=${antes} · no lanza · resultado=${g ? `${f(g.x)}, ${f(g.y)}` : g}`; }
      catch (e) { return `isLoaded=${antes} · lanza: ${(e as Error).message}`; }
    }),
  ];
  await projectOperator.load();
  await geographicTransformationUtils.load();
  await geodeticDistanceOperator.load();
  r.push(
    await intento("4326 → 3116 (MAGNA-SIRGAS / Colombia Bogota zone) y → 9377 (Origen Nacional)", async () => {
      const a = projectOperator.execute(p(), sr(3116)) as Point;
      const b = projectOperator.execute(p(), sr(9377)) as Point;
      return `3116: ${f(a?.x)}, ${f(a?.y)} · 9377: ${f(b?.x)}, ${f(b?.y)}`;
    }),
    await intento("Datum Bogotá 1975 (4218) → WGS84 sin transformación vs. con getTransformation", async () => {
      const sin = projectOperator.execute(p(4218), sr(4326)) as Point;
      const t = geographicTransformationUtils.getTransformation(sr(4218), sr(4326));
      const con = projectOperator.execute(p(4218), sr(4326), { geographicTransformation: t }) as Point;
      const d = geodeticDistanceOperator.execute(sin, con, { unit: "meters" });
      const lista = geographicTransformationUtils.getTransformations(sr(4218), sr(4326)).length;
      return `transformación por defecto: ${t ? t.steps.map((s) => s.wkid).join("+") : "ninguna"} (${lista} disponibles) · diferencia entre sin y con: ${f(d, 1)} m`;
    }),
    await intento("Bogotá 1975: tratar sus coordenadas como WGS84 (solo cambiar la etiqueta) — ¿cuánto se corre?", async () => {
      const bien = projectOperator.execute(p(4218), sr(4326)) as Point;
      const relabel = p(4326);
      const ts = geographicTransformationUtils.getTransformations(sr(4218), sr(4326));
      const ds = ts.map((t) => geodeticDistanceOperator.execute(bien, projectOperator.execute(p(4218), sr(4326), { geographicTransformation: t }) as Point, { unit: "meters" }) ?? 0);
      return `corrimiento por reetiquetar: ${f(geodeticDistanceOperator.execute(bien, relabel, { unit: "meters" }), 0)} m · entre las ${ts.length} transformaciones: hasta ${f(Math.max(...ds), 1)} m`;
    }),
    await intento("Bogotá 1975 con areaOfInterestExtent de Colombia", async () => {
      const aoi = new Polygon({ rings: [[[-79, -4.3], [-66.8, -4.3], [-66.8, 12.5], [-79, 12.5], [-79, -4.3]]], spatialReference: sr(4326) }).extent;
      const t = geographicTransformationUtils.getTransformation(sr(4218), sr(4326), aoi);
      return `por defecto con AOI: ${t?.steps.map((s) => s.wkid).join("+")}`;
    }),
    await intento("NAD27 (4267) → WGS84: ¿execute elige solo una transformación?", async () => {
      const q = new Point({ x: -100, y: 40, spatialReference: sr(4267) });
      const sin = projectOperator.execute(q, sr(4326)) as Point;
      const t = geographicTransformationUtils.getTransformation(sr(4267), sr(4326), null);
      const con = projectOperator.execute(q, sr(4326), { geographicTransformation: t }) as Point;
      return `sin opción: ${f(sin.x, 6)}, ${f(sin.y, 6)} · con getTransformation: ${f(con.x, 6)}, ${f(con.y, 6)} · Δ=${f(geodeticDistanceOperator.execute(sin, con, { unit: "meters" }), 1)} m`;
    }),
    await intento("intersectsOperator con geometrías en SR distintos (4326 vs 3857)", async () => {
      const a = new Polygon({ rings: [[[-75, 4], [-73, 4], [-73, 5], [-75, 5], [-75, 4]]], spatialReference: sr(4326) });
      const b = webMercatorUtils.geographicToWebMercator(a) as Polygon;
      try { return `devuelve ${intersectsOperator.execute(a, b)} (son el mismo polígono)`; }
      catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("webMercatorUtils con MAGNA-SIRGAS geográfico (4686)", async () => {
      const ok = webMercatorUtils.canProject(sr(4686), sr(3857));
      const g = webMercatorUtils.geographicToWebMercator(p(4686));
      return `canProject(4686→3857)=${ok} · geographicToWebMercator devuelve SR ${g?.spatialReference?.wkid}`;
    }),
    await intento("Ejes al revés: Point({ x: lat, y: lon })", async () => {
      const g = webMercatorUtils.geographicToWebMercator(new Point({ x: BOGOTA.y, y: BOGOTA.x, spatialReference: sr(4326) })) as Point;
      const bien = webMercatorUtils.geographicToWebMercator(p()) as Point;
      return `al revés: ${f(g.x, 0)}, ${f(g.y, 0)} · bien: ${f(bien.x, 0)}, ${f(bien.y, 0)} · sin error`;
    }),
    await intento("webMercator cerca del polo: lat 85.06, 89.9 y 90", async () => {
      return [85.06, 89.9, 90].map((lat) => {
        const g = webMercatorUtils.geographicToWebMercator(new Point({ x: 0, y: lat, spatialReference: sr(4326) })) as Point;
        return `${lat}→${f(g.y, 0)}`;
      }).join(" · ");
    }),
    await intento("Pitfall 4: execute al mismo SR — ¿devuelve el mismo objeto?", async () => {
      const g = p();
      const out = projectOperator.execute(g, sr(4326));
      return `mismo objeto=${out === g} · igual=${out?.equals(g)}`;
    }),
    await intento("Z: 4326 con z=2600 → 3116", async () => {
      const g = projectOperator.execute(p(4326, 2600), sr(3116)) as Point;
      return `hasZ=${g.hasZ} · z=${g.z}`;
    }),
    await intento("executeMany con SR mezclados en el arreglo", async () => {
      try { const out = projectOperator.executeMany([p(4326), webMercatorUtils.geographicToWebMercator(p()) as Point], sr(3116)) as Point[]; return out.map((g) => `${f(g?.x)}, ${f(g?.y)}`).join(" | "); }
      catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
  );
  return r;
}
