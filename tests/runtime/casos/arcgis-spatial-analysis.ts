import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";
import LinearUnit from "@arcgis/core/rest/support/LinearUnit.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import { intento } from "./_util.ts";

// Public sample GP services: Viewshed is synchronous, 911 Calls Hotspot asynchronous.
const VIEWSHED = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed";
const HOTSPOT = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/911CallsHotspot/GPServer/911%20Calls%20Hotspot";
const CIUDADES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0";
const obs = () => new FeatureSet({ features: [new Graphic({ geometry: new Point({ longitude: -122.42, latitude: 37.77 }) })] });
const fallo = (e: unknown) => { const x = e as { name?: string; message?: string; details?: { messages?: unknown[] } }; return `${x.name}: ${x.message?.slice(0, 120)}`; };
type Res = { results: Array<{ paramName: string; dataType: string; value: { features?: unknown[] } }>; messages: unknown[] };

export async function run() {
  return [
    await intento("execute (síncrono) con FeatureSet y LinearUnit", async () => {
      const r = (await geoprocessor.execute(VIEWSHED, { Input_Observation_Point: obs(), Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }) })) as Res;
      const v = r.results[0];
      return `claves del resultado=${Object.keys(r).join(",")} · results[0]=${v.paramName}/${v.dataType} · polígonos=${v.value.features?.length} · value es FeatureSet=${v.value instanceof FeatureSet}`;
    }),
    await intento("Viewshed_Distance como número suelto (lo que enseñaba la skill)", async () =>
      geoprocessor.execute(VIEWSHED, { Input_Observation_Point: obs(), Viewshed_Distance: 5000 }).then((r) => `resolvió: polígonos=${(r as Res).results[0]?.value.features?.length}`, fallo)),
    await intento("Pitfall ext. 2: un Graphic suelto en vez de FeatureSet", async () =>
      geoprocessor.execute(VIEWSHED, { Input_Observation_Point: new Graphic({ geometry: new Point({ longitude: -122.42, latitude: 37.77 }) }), Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }) }).then((r) => `resolvió: polígonos=${(r as Res).results[0]?.value.features?.length}`, fallo)),
    await intento("Pitfall ext. 2: featureSet.toJSON() (lo que enseñaba como correcto)", async () =>
      geoprocessor.execute(VIEWSHED, { Input_Observation_Point: obs().toJSON(), Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }) }).then((r) => `resolvió: polígonos=${(r as Res).results[0]?.value.features?.length}`, fallo)),
    await intento("Pitfall 2: nombre de parámetro en minúsculas", async () =>
      geoprocessor.execute(VIEWSHED, { input_observation_point: obs(), viewshed_distance: new LinearUnit({ distance: 5, units: "kilometers" }) }).then((r) => `resolvió: polígonos=${(r as Res).results[0]?.value.features?.length}`, fallo)),
    await intento("Pitfall 1: execute sobre un servicio asíncrono", async () =>
      geoprocessor.execute(HOTSPOT, { Query: "(\"DATE\" > date '1998-01-01 00:00:00' AND \"DATE\" < date '1998-01-31 00:00:00')" }).then(() => "resolvió", fallo)),
    await intento("submitJob + waitForJobCompletion + fetchResultData", async () => {
      const estados: string[] = [];
      const job = await geoprocessor.submitJob(HOTSPOT, { Query: "(\"DATE\" > date '1998-01-01 00:00:00' AND \"DATE\" < date '1998-01-31 00:00:00')" });
      const fin = await job.waitForJobCompletion({ interval: 1500, statusCallback: (j) => { if (estados.at(-1) !== j.jobStatus) estados.push(j.jobStatus); } });
      const out = await fin.fetchResultData("Hotspot_Raster").then((p) => `${p.paramName}/${p.dataType}`, fallo);
      return `estados=${estados.join(">")} · final=${fin.jobStatus} · salida=${out}`;
    }),
    await intento("Pitfall ext. 1: un trabajo que falla ¿resuelve o rechaza?", async () => {
      const job = await geoprocessor.submitJob(HOTSPOT, { Query: "esto no es SQL" });
      return job.waitForJobCompletion({ interval: 1500 }).then((j) => `resolvió con jobStatus=${j.jobStatus}`, (e) => `rechazó con ${Object.prototype.toString.call(e)} · claves=${Object.keys(e ?? {}).join(",")} · jobStatus del rechazo=${(e as { jobStatus?: string })?.jobStatus} · mensajes=${JSON.stringify((e as { messages?: Array<{ description: string }> })?.messages?.map((m) => m.description).slice(-2))}`);
    }),
    await intento("Pitfall 3: estadísticas en el servidor vs bajar features", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const q = l.createQuery();
      q.outStatistics = [{ statisticType: "sum", onStatisticField: "pop2000", outStatisticFieldName: "total" }] as never;
      const s = await l.queryFeatures(q);
      const todos = await l.queryFeatures({ where: "1=1", outFields: ["pop2000"] } as never);
      const suma = todos.features.reduce((a, f) => a + (f.attributes.pop2000 as number), 0);
      return `estadística total=${s.features[0].attributes.total} · bajando features: ${todos.features.length} filas, suma=${suma} · exceededTransferLimit=${todos.exceededTransferLimit}`;
    }),
    await intento("Pitfall ext. 3: outStatistics sin outStatisticFieldName", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const q = l.createQuery();
      q.outStatistics = [{ statisticType: "sum", onStatisticField: "pop2000" }] as never;
      const s = await l.queryFeatures(q).then((r) => `atributos=${JSON.stringify(r.features[0]?.attributes)}`, fallo);
      return s;
    }),
    await intento("groupByFieldsForStatistics", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const q = l.createQuery();
      q.outStatistics = [{ statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "n" }] as never;
      q.groupByFieldsForStatistics = ["st"];
      q.orderByFields = ["n DESC"];
      const r = await l.queryFeatures(q);
      return `grupos=${r.features.length} · 1.º=${JSON.stringify(r.features[0]?.attributes)} · geometría=${r.features[0]?.geometry ?? "null"}`;
    }),
    await intento("Nombre de parámetro mal escrito", async () =>
      geoprocessor.execute(VIEWSHED, { Observation_Point: obs().toJSON(), Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }) }).then((r) => `resolvió: polígonos=${(r as Res).results[0]?.value.features?.length}`, fallo)),
    await intento("Repetición: execute con la instancia FeatureSet (en caliente)", async () => {
      const t = performance.now();
      return geoprocessor.execute(VIEWSHED, { Input_Observation_Point: obs(), Viewshed_Distance: new LinearUnit({ distance: 5, units: "kilometers" }) }).then((r) => `resolvió en ${Math.round(performance.now() - t)} ms: polígonos=${(r as Res).results[0]?.value.features?.length}`, fallo);
    }),
  ];
}
