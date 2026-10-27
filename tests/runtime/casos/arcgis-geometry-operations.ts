import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator.js";
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";
import * as unionOperator from "@arcgis/core/geometry/operators/unionOperator.js";
import * as containsOperator from "@arcgis/core/geometry/operators/containsOperator.js";
import * as simplifyOperator from "@arcgis/core/geometry/operators/simplifyOperator.js";
import * as areaOperator from "@arcgis/core/geometry/operators/areaOperator.js";
import * as geodeticAreaOperator from "@arcgis/core/geometry/operators/geodeticAreaOperator.js";
import * as geodeticLengthOperator from "@arcgis/core/geometry/operators/geodeticLengthOperator.js";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";
import Point from "@arcgis/core/geometry/Point.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import { intento } from "./_util.ts";

const WGS = { wkid: 4326 }, WM = { wkid: 3857 };
const bog = new Point({ longitude: -74.08, latitude: 4.6 });

export async function run() {
  await geodeticAreaOperator.load();
  return [
    await intento("Inicio Rápido: bufferOperator (planar) sobre un punto en lon/lat con 1000 m", async () => {
      try {
        const p = bufferOperator.execute(bog, 1000, { unit: "meters" });
        const ext = p?.extent;
        return `devuelve ${p ? "polígono" : String(p)} · ancho del extent=${ext?.width.toFixed(4)} (en ${ext?.spatialReference.wkid}) · área geodésica=${p ? (geodeticAreaOperator.execute(p, { unit: "square-kilometers" }) ?? NaN).toFixed(3) : "-"} km² (un círculo de 1 km da 3,142)`;
      } catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("geodesicBufferOperator sin load()", async () => {
      try {
        const p = geodesicBufferOperator.execute(bog, 1000, { unit: "meters" });
        return `isLoaded=${geodesicBufferOperator.isLoaded()} · devuelve ${p ? "polígono" : String(p)}`;
      } catch (e) { return `lanza: ${(e as Error).message} · isLoaded=${geodesicBufferOperator.isLoaded()}`; }
    }),
    await intento("geodesicBufferOperator con load(): área del círculo de 1 km", async () => {
      await geodesicBufferOperator.load();
      const p = geodesicBufferOperator.execute(bog, 1000, { unit: "meters" })!;
      return `área geodésica=${geodeticAreaOperator.execute(p, { unit: "square-kilometers" })!.toFixed(3)} km²`;
    }),
    await intento("bufferOperator planar en Web Mercator a 60° de latitud (1000 m)", async () => {
      const p60 = new Point({ x: 1113195, y: 8399738, spatialReference: WM }); // ≈ 10°E, 60°N
      const planar = bufferOperator.execute(p60, 1000, { unit: "meters" })!;
      const pb = new Point({ x: -8246616, y: 512620, spatialReference: WM }); // Bogotá
      const pbog = bufferOperator.execute(pb, 1000, { unit: "meters" })!;
      return `a 60°N: área real=${geodeticAreaOperator.execute(planar, { unit: "square-kilometers" })!.toFixed(3)} km² · en Bogotá: ${geodeticAreaOperator.execute(pbog, { unit: "square-kilometers" })!.toFixed(3)} km² · esperado 3,142`;
    }),
    await intento("geometryEngine en 5.1: ¿funciona? ¿avisa deprecación?", async () => {
      const avisos: string[] = [];
      const w = console.warn;
      console.warn = (...a: unknown[]) => { avisos.push(a.map(String).join(" ").slice(0, 140)); w(...a); };
      const area = geometryEngine.geodesicBuffer(bog, 500, "meters") as Polygon;
      const dentro = geometryEngine.contains(area, bog);
      console.warn = w;
      const op = containsOperator.execute(area, bog);
      return `geometryEngine.contains=${dentro} · containsOperator=${op} · avisos=${avisos.length}${avisos.length ? ": " + avisos[0] : ""}`;
    }),
    await intento("Pitfall 2: polígono en moño (auto-intersecado)", async () => {
      const mono = new Polygon({ rings: [[[0, 0], [10, 10], [10, 0], [0, 10], [0, 0]]], spatialReference: WM });
      const caja = new Polygon({ rings: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]], spatialReference: WM });
      const simple = simplifyOperator.isSimple(mono);
      const sin = intersectionOperator.execute(mono, caja);
      const limpio = simplifyOperator.execute(mono) as Polygon;
      const con = intersectionOperator.execute(limpio, caja);
      const a = (g: unknown) => (g ? areaOperator.execute(g as Polygon).toFixed(1) : String(g));
      return `isSimple=${simple} · área planar del moño=${a(mono)} · intersección sin simplificar=${a(sin)} · simplificado: ${limpio.rings.length} anillos, área=${a(limpio)} · intersección=${a(con)} (área real de los dos triángulos: 50)`;
    }),
    await intento("Pitfall ext. 1: intersección con referencias espaciales distintas", async () => {
      const a = geodesicBufferOperator.execute(bog, 1000, { unit: "meters" })!; // 4326
      const bWM = bufferOperator.execute(new Point({ x: -8246616, y: 512620, spatialReference: WM }), 1000, { unit: "meters" })!;
      try {
        const r = intersectionOperator.execute(a, bWM);
        return `no lanza · resultado=${r ? `${r.type} vacío=${(r as Polygon).rings?.length === 0}` : String(r)}`;
      } catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("Pitfall 3: 5000 buffers con un loop vs executeMany", async () => {
      const pts = Array.from({ length: 5000 }, (_, i) => new Point({ x: -8246616 + i * 50, y: 512620, spatialReference: WM }));
      let t = performance.now();
      pts.forEach((g) => bufferOperator.execute(g, 100));
      const loop = performance.now() - t;
      t = performance.now();
      const r = bufferOperator.executeMany(pts, pts.map(() => 100));
      const many = performance.now() - t;
      t = performance.now();
      const u = bufferOperator.executeMany(pts, pts.map(() => 100), { union: true });
      const unidos = performance.now() - t;
      return `loop=${loop.toFixed(0)} ms · executeMany=${many.toFixed(0)} ms (${r.length}) · executeMany union=${unidos.toFixed(0)} ms (${u.length} polígono) · los dos son síncronos (bloquean el hilo)`;
    }),
    await intento("geodeticLengthOperator vs lengthOperator en grados", async () => {
      await geodeticLengthOperator.load();
      const ruta = new Polyline({ paths: [[[-74.08, 4.6], [-75.57, 6.25]]], spatialReference: WGS }); // Bogotá → Medellín
      return `geodésica=${geodeticLengthOperator.execute(ruta, { unit: "kilometers" })!.toFixed(1)} km`;
    }),
    await intento("unionOperator.executeMany", async () => {
      const a = new Polygon({ rings: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]], spatialReference: WM });
      const b = new Polygon({ rings: [[[5, 0], [5, 10], [15, 10], [15, 0], [5, 0]]], spatialReference: WM });
      const u = unionOperator.executeMany([a, b]);
      return `${u?.type} · área=${areaOperator.execute(u as Polygon)}`;
    }),
  ];
}
