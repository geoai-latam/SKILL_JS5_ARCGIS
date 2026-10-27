import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import CSVLayer from "@arcgis/core/layers/CSVLayer.js";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Query from "@arcgis/core/rest/support/Query.js";
import { intento } from "./_util.ts";
const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));

// Public sample: US cities, 3557 rows, maxRecordCount 1000, supports pagination (checked 2026-10-27).
const CIUDADES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0";
const blob = (txt: string, type: string) => URL.createObjectURL(new Blob([txt], { type }));

export async function run(container: HTMLElement) {
  return [
    await intento("queryFeatures() sin argumentos sobre 3557 ciudades (maxRecordCount 1000)", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const fs = await l.queryFeatures();
      return `${fs.features.length} features · exceededTransferLimit=${fs.exceededTransferLimit} · geometría=${fs.features[0]?.geometry ? "sí" : "no"} · campos=${Object.keys(fs.features[0]?.attributes ?? {}).join(",")}`;
    }),
    await intento("createQuery() sin load(): ¿qué trae?", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const q = l.createQuery();
      const antes = `where=${q.where} · returnGeometry=${q.returnGeometry} · outFields=${JSON.stringify(q.outFields)}`;
      const fs = await l.queryFeatures(q);
      return `${antes} → ${fs.features.length} features, geometría=${fs.features[0]?.geometry ? "sí" : "no"}`;
    }),
    await intento("outFields de la capa: ¿pasan a createQuery?", async () => {
      const l = new FeatureLayer({ url: CIUDADES, outFields: ["areaname", "pop2000"] });
      await l.load();
      const q = l.createQuery();
      q.num = 1;
      const fs = await l.queryFeatures(q);
      return `query.outFields=${JSON.stringify(q.outFields)} · campos devueltos=${Object.keys(fs.features[0]?.attributes ?? {}).join(",")}`;
    }),
    await intento("Filtrar en el servidor vs en el cliente", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const todas = await l.queryFeatures();
      const enCliente = todas.features.filter((f) => f.attributes.capital === "Y").length;
      const q = l.createQuery(); q.where = "capital = 'Y'";
      const enServidor = (await l.queryFeatures(q)).features.length;
      const total = await l.queryFeatureCount(q);
      return `cliente (sobre las ${todas.features.length} que bajaron)=${enCliente} capitales · servidor=${enServidor} · queryFeatureCount=${total}`;
    }),
    await intento("definitionExpression + where de la query", async () => {
      const l = new FeatureLayer({ url: CIUDADES, definitionExpression: "st = 'TX'" });
      const q = l.createQuery(); q.where = "pop2000 > 500000";
      const n = await l.queryFeatureCount(q);
      const sin = new FeatureLayer({ url: CIUDADES });
      const q2 = sin.createQuery(); q2.where = "pop2000 > 500000";
      return `con definitionExpression TX: ${n} · sin ella: ${await sin.queryFeatureCount(q2)} · createQuery().where=${l.createQuery().where}`;
    }),
    await intento("definitionExpression: tres formas de pasar el where", async () => {
      const l = new FeatureLayer({ url: CIUDADES, definitionExpression: "st = 'TX'" });
      const plano = await l.queryFeatureCount({ where: "pop2000 > 500000" } as never);
      const q = new Query({ where: "pop2000 > 500000" });
      const clase = await l.queryFeatureCount(q);
      const cq = l.createQuery(); cq.where = `(${cq.where}) AND pop2000 > 500000`;
      return `objeto plano=${plano} · new Query=${clase} · createQuery + AND=${await l.queryFeatureCount(cq)}`;
    }),
    await intento("new Query(): returnGeometry y outFields por defecto", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const q = new Query({ where: "1=1", num: 1 });
      const f = (await l.queryFeatures(q)).features[0];
      return `returnGeometry=${q.returnGeometry} · outFields=${JSON.stringify(q.outFields)} → geometry=${f?.geometry ? "sí" : String(f?.geometry)} · campos=${Object.keys(f?.attributes ?? {}).join(",")}`;
    }),
    await intento("Paginación con start/num y orderByFields", async () => {
      const l = new FeatureLayer({ url: CIUDADES, outFields: ["areaname", "pop2000"] });
      const pagina = async (start: number) => {
        const q = l.createQuery(); q.orderByFields = ["pop2000 DESC"]; q.start = start; q.num = 3; q.returnGeometry = false;
        return (await l.queryFeatures(q)).features.map((f) => f.attributes.areaname).join(", ");
      };
      return `p1: ${await pagina(0)} · p2: ${await pagina(3)}`;
    }),
    await intento("returnGeometry = false", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const q = l.createQuery(); q.num = 1; q.returnGeometry = false;
      const f = (await l.queryFeatures(q)).features[0];
      return `geometry=${String(f?.geometry)}`;
    }),
    await intento("Pitfall 4: map.layers[0] = nueva", async () => {
      const a = new GraphicsLayer({ title: "a" }), b = new GraphicsLayer({ title: "b" });
      const map = new Map({ layers: [a] });
      try { (map.layers as unknown as GraphicsLayer[])[0] = b; } catch (e) { return `lanza: ${(e as Error).message}`; }
      return `length=${map.layers.length} · getItemAt(0)=${map.layers.getItemAt(0)?.title} · includes(b)=${map.layers.includes(b)}`;
    }),
    await intento("Pitfall 5: URL rota agregada al mapa", async () => {
      container.innerHTML = "";
      const div = document.createElement("div"); div.style.cssText = "width:300px;height:200px"; container.appendChild(div);
      const l = new FeatureLayer({ url: CIUDADES.replace("/0", "/99") });
      const view = new MapView({ container: div, map: new Map({ layers: [l] }), center: [-98, 38], zoom: 3 });
      let avisos = 0; const w = console.error; console.error = (...a: unknown[]) => { avisos++; w(...a); };
      let lv = "";
      try { await Promise.race([view.whenLayerView(l), tick(10000).then(() => { throw new Error("pendiente a los 10 s"); })]); lv = "resolvió"; } catch (e) { lv = `${(e as Error).message}`.slice(0, 120); }
      console.error = w;
      const out = `loadStatus=${l.loadStatus} · loadError=${l.loadError?.message?.slice(0, 80)} · whenLayerView ${lv} · console.error=${avisos}`;
      view.destroy();
      return out;
    }),
    await intento("CSVLayer: columnas lat/lon sin declararlas", async () => {
      const l = new CSVLayer({ url: blob("nombre,lat,lon\nBogotá,4.6,-74.08\nLima,-12.05,-77.04\n", "text/csv") });
      await l.load();
      const n = (await l.queryFeatures()).features.length;
      return `latitudeField=${l.latitudeField} · longitudeField=${l.longitudeField} · ${n} puntos`;
    }),
    await intento("CSVLayer: columnas con nombres propios (norte/este)", async () => {
      const csv = "nombre,norte,este\nBogotá,4.6,-74.08\n";
      const sin = new CSVLayer({ url: blob(csv, "text/csv") });
      let r1 = "";
      try { await sin.load(); r1 = `carga · ${(await sin.queryFeatures()).features.length} puntos`; } catch (e) { r1 = `falla: ${(e as Error).message}`; }
      const con = new CSVLayer({ url: blob(csv, "text/csv"), latitudeField: "norte", longitudeField: "este" });
      await con.load();
      return `sin declarar: ${r1} · con latitudeField/longitudeField: ${(await con.queryFeatures()).features.length} puntos`;
    }),
    await intento("GeoJSONLayer desde un Blob: tipo de geometría inferido", async () => {
      const gj = { type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "Point", coordinates: [-74.08, 4.6] }, properties: { place: "Bogotá", mag: 4.1 } }] };
      const l = new GeoJSONLayer({ url: blob(JSON.stringify(gj), "application/json") });
      await l.load();
      return `geometryType=${l.geometryType} · campos=${l.fields.map((f) => `${f.name}:${f.type}`).join(",")} · SR=${l.spatialReference.wkid}`;
    }),
  ];
}
