import { createArcadeExecutor, createArcadeProfile } from "@arcgis/core/arcade.js";
import Graphic from "@arcgis/core/Graphic.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import { intento, invertido } from "./_util.ts";

const FEATURE = [{ name: "$feature", type: "feature" as const }];
const g = (attrs: Record<string, unknown>, geometry?: Polygon) => new Graphic({ attributes: attrs, geometry });

export async function run() {
  return [
    await intento("Quick Start de la skill: compila y ejecuta", async () => {
      const e = await createArcadeExecutor("Round($feature.POP / 1000) + ' k'", { variables: FEATURE });
      return `resultado=${e.execute({ $feature: g({ POP: 12345 }) })} · fieldsUsed=${e.fieldsUsed} · isAsync=${e.isAsync}`;
    }),
    await intento("Pitfall 1 de la skill: ¿$feature.pop con campo POP da null?", async () => {
      const e = await createArcadeExecutor("$feature.pop", { variables: FEATURE });
      return `$feature.pop = ${e.execute({ $feature: g({ POP: 7 }) })}`;
    }),
    await intento("Pitfall 3 de la skill: división por cero", async () => {
      const e = await createArcadeExecutor("$feature.POP / $feature.AREA", { variables: FEATURE });
      return `POP/0 = ${e.execute({ $feature: g({ POP: 7, AREA: 0 }) })}`;
    }),
    await intento("Pitfall 1 Top 3: sin declarar $feature en el perfil", async () => {
      try { const e = await createArcadeExecutor("$feature.POP", { variables: [] }); return `compiló; ejecuta=${e.execute({})}`; }
      catch (err) { return `falla al compilar: ${(err as Error).message}`; }
    }),
    await intento("createArcadeProfile('popup') trae las variables del perfil", async () => {
      const p = createArcadeProfile("popup"); return p.variables.map((v) => `${v.name}:${v.type}`).join(", ");
    }),
    await intento("createArcadeProfile('visualization') (renderer)", async () => {
      const p = createArcadeProfile("visualization"); return p.variables.map((v) => `${v.name}:${v.type}`).join(", ");
    }),
    await invertido("Script con FeatureSet ejecutado con execute() (sync) — se espera error", async () => {
      const e = await createArcadeExecutor("Count(FeatureSetByName($map, 'x'))", createArcadeProfile("popup"));
      if (!e.isAsync) throw new Error("isAsync=false?");
      e.execute({ $feature: g({}), $map: null }); return "no lanzó";
    }),
    await intento("geometryUsed / Area sin geometría", async () => {
      const e = await createArcadeExecutor("Area($feature, 'square-meters')", { variables: FEATURE });
      let sin: string; try { sin = String(e.execute({ $feature: g({ POP: 1 }) })); } catch (err) { sin = `lanza: ${(err as Error).message}`; }
      const poly = new Polygon({ rings: [[[0, 0], [0, 1000], [1000, 1000], [1000, 0], [0, 0]]], spatialReference: { wkid: 3857 } });
      return `geometryUsed=${e.geometryUsed} · sin geometría → ${sin} · con polígono 1 km² (3857) → ${e.execute({ $feature: g({}, poly) })}`;
    }),
    await intento("fieldsUsed → outFields con una capa real (ejecución con features consultados)", async () => {
      const layer = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2" });
      const e = await createArcadeExecutor("$feature.pop2000 / 1000", { variables: FEATURE });
      const sinCampos = await layer.queryFeatures({ where: "1=1", num: 1, outFields: ["objectid"], returnGeometry: false });
      const conCampos = await layer.queryFeatures({ where: "1=1", num: 1, outFields: e.fieldsUsed, returnGeometry: false });
      let r1: string; try { r1 = String(e.execute({ $feature: sinCampos.features[0] })); } catch (err) { r1 = `lanza: ${(err as Error).message}`; }
      return `fieldsUsed=${e.fieldsUsed} · sin el campo → ${r1} · con el campo → ${e.execute({ $feature: conCampos.features[0] })}`;
    }),
    await intento("Area() planar en Web Mercator vs AreaGeodetic() a 50° S (Patagonia)", async () => {
      const ring = (lat: number) => { const d = 0.01; return [[[-70, lat], [-70, lat + d], [-70 + d, lat + d], [-70 + d, lat], [-70, lat]]]; };
      const { geographicToWebMercator } = await import("@arcgis/core/geometry/support/webMercatorUtils.js");
      const poly = geographicToWebMercator(new Polygon({ rings: ring(-50), spatialReference: { wkid: 4326 } })) as Polygon;
      const plan = await createArcadeExecutor("Area($feature, 'square-kilometers')", { variables: FEATURE });
      const geod = await createArcadeExecutor("AreaGeodetic($feature, 'square-kilometers')", { variables: FEATURE });
      const a = plan.execute({ $feature: g({}, poly) }) as number, b = geod.execute({ $feature: g({}, poly) }) as number;
      return `planar=${a.toFixed(3)} km² · geodésica=${b.toFixed(3)} km² · factor ${(a / b).toFixed(2)}`;
    }),
  ];
}
