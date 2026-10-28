import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import ParquetLayer from "@arcgis/core/layers/ParquetLayer.js";
import ParquetFilesData from "@arcgis/core/layers/support/ParquetFilesData.js";
import ParquetPortalItemData from "@arcgis/core/layers/support/ParquetPortalItemData.js";
import GeometryEncodingWkb from "@arcgis/core/layers/support/GeometryEncodingWkb.js";
import GeometryEncodingLocation from "@arcgis/core/layers/support/GeometryEncodingLocation.js";
import * as parquetUtils from "@arcgis/core/layers/support/parquetUtils.js";
import type Polygon from "@arcgis/core/geometry/Polygon.js";
import type Point from "@arcgis/core/geometry/Point.js";
import { intento } from "./_util.ts";

// What the arcgis-parquet skill claims, executed. Two sources:
// - Esri's sample file (Kansas water wells, 310 702 rows, 56 MB, gzip, lng/lat columns), public
//   portal item 6ab6f959c1684eb5a54db91644a89747 owned by jsapi_team (checked 2026-10-28);
// - small files written by tests/runtime/generar-parquet.py (five Colombian cities), served by
//   Vite from public/parquet/, plus the /sin-rango/ and /sin-head/ hosts of correr.mjs.
// Each check throws ("cambió: …") when the SDK stops behaving as the skill says.
const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
const ITEM = "6ab6f959c1684eb5a54db91644a89747";
const KANSAS = `https://jsapi.maps.arcgis.com/sharing/rest/content/items/${ITEM}/data`;
const url = (ruta: string) => new URL(ruta, location.href).href;
const archivos = (...f: string[]) => new ParquetFilesData({ urls: f.map((x) => url(`/parquet/${x}`)) });
const kansas = (extra: Partial<ConstructorParameters<typeof ParquetLayer>[0]> = {}) => new ParquetLayer({ data: new ParquetFilesData({ urls: [KANSAS] }), ...extra });
const ROJO = { type: "simple-fill", color: "#ff0000", outline: { color: "#ff0000", width: 0 } } as const;

function esperar(ok: boolean, detalle: string) {
  if (!ok) throw new Error(`cambió: ${detalle}`);
  return detalle;
}
const rechazo = (p: Promise<unknown>) => p.then(() => "resolvió", (e: Error) => `rechaza: ${e.message}`);
const codificacion = (l: ParquetLayer) => {
  const g = l.geometryEncoding;
  return g ? (g.type === "wkb" ? `wkb(${g.field})` : `location(${g.xField},${g.yField})`) : "null";
};

let contenedor: HTMLElement;
async function enVista(l: ParquetLayer, center: [number, number], zoom: number, basemap?: string) {
  contenedor.innerHTML = "";
  const div = document.createElement("div");
  div.style.cssText = "width:300px;height:300px";
  contenedor.appendChild(div);
  const view = new MapView({ container: div, map: new Map({ basemap, layers: [l] }), center, zoom });
  await view.when();
  return view;
}
async function esperarVista(view: MapView) {
  await tick(300);
  while (view.updating) await tick(100);
  await tick(500);
}
async function pixeles(view: MapView) {
  const d = (await view.takeScreenshot({ format: "png" })).data;
  const c = (Math.floor(d.height / 2) * d.width + Math.floor(d.width / 2)) * 4;
  let pintados = 0;
  for (let i = 3; i < d.data.length; i += 4) if (d.data[i] > 0) pintados++;
  return { centro: `${d.data[c]},${d.data[c + 1]},${d.data[c + 2]}`, pintados, total: d.width * d.height };
}

export async function run(container: HTMLElement) {
  contenedor = container;
  const k = kansas();
  return [
    await intento("Sample de Esri: ParquetPortalItemData público, sin sesión, detecta lng/lat", async () => {
      const l = new ParquetLayer({ data: new ParquetPortalItemData({ portalItem: { id: ITEM } }) });
      await l.load();
      const d = `isTable=${l.isTable} · geometryType=${l.geometryType} · encoding=${codificacion(l)} · SR=${l.spatialReference.wkid} · ${l.fields.length} campos · objectIdField=${l.objectIdField}`;
      return esperar(!l.isTable && l.geometryType === "point" && codificacion(l) === "location(lng,lat)" && l.objectIdField === "__OBJECTID", d);
    }),
    await intento("Mismo archivo por URL (ParquetFilesData): 310702 filas", async () => {
      await k.load();
      const n = await k.queryFeatureCount();
      return esperar(n === 310702, `queryFeatureCount()=${n} · getField("OBJECTID").type=${k.getField("OBJECTID")?.type} (el OBJECTID del archivo no es el objectIdField)`);
    }),
    await intento("queryFeatures corta en 8000 con exceededTransferLimit=false", async () => {
      const a = await k.queryFeatures({ where: "1=1", outFields: ["OBJECTID"], returnGeometry: false });
      const b = await k.queryFeatures({ where: "1=1", outFields: ["OBJECTID"], returnGeometry: false, num: 20000 });
      const ultima = await k.queryFeatures({ where: "1=1", outFields: ["OBJECTID"], returnGeometry: false, start: 310000, num: 8000 });
      const d = `maxRecordCount=${k.capabilities?.query?.maxRecordCount} · sin num=${a.features.length}/exceeded=${a.exceededTransferLimit} · num 20000=${b.features.length}/exceeded=${b.exceededTransferLimit} · start 310000=${ultima.features.length}`;
      return esperar(a.features.length === 8000 && !a.exceededTransferLimit && b.features.length === 8000 && !b.exceededTransferLimit && ultima.features.length === 702, d);
    }),
    await intento("queryObjectIds: todos sin where, 8000 con where", async () => {
      const todos = (await k.queryObjectIds()).length;
      const conWhere = (await k.queryObjectIds({ where: "STATUS = 'Constructed'" })).length;
      const cuenta = await k.queryFeatureCount({ where: "STATUS = 'Constructed'" });
      return esperar(todos === 310702 && conWhere === 8000 && cuenta === 244149, `queryObjectIds()=${todos} · con where=${conWhere} (count de ese where=${cuenta})`);
    }),
    await intento("Los valores del where distinguen mayúsculas", async () => {
      const a = await k.queryFeatureCount({ where: "STATUS = 'Constructed'" });
      const b = await k.queryFeatureCount({ where: "STATUS = 'constructed'" });
      const c = await k.queryFeatureCount({ where: "UPPER(STATUS) = 'CONSTRUCTED'" });
      const def = await new ParquetLayer({ data: archivos("geoparquet-poligonos.parquet"), definitionExpression: "nombre = 'bogotá'" }).queryFeatureCount();
      return esperar(a === 244149 && b === 0 && c === a && def === 0, `'Constructed'=${a} · 'constructed'=${b} · UPPER(STATUS)='CONSTRUCTED'=${c} · definitionExpression "nombre = 'bogotá'" (el archivo dice Bogotá)=${def}`);
    }),
    await intento("Un where suelto reemplaza el definitionExpression; createQuery lo conserva", async () => {
      const l = kansas({ definitionExpression: "STATUS = 'Plugged'" });
      const base = await l.queryFeatureCount();
      const suelto = await l.queryFeatureCount({ where: "COUNTY = 'Sedgwick'" });
      const q = l.createQuery();
      q.where = `(${q.where}) AND COUNTY = 'Sedgwick'`;
      const bien = await l.queryFeatureCount(q);
      return esperar(base === 64254 && suelto === 73538 && bien === 14703, `count()=${base} · {where Sedgwick}=${suelto} (todas las de Sedgwick) · createQuery + AND=${bien}`);
    }),
    await intento("queryExtent().count no es queryFeatureCount() con filtro (filas sin coordenadas)", async () => {
      const l = kansas({ definitionExpression: "STATUS = 'Plugged'" });
      const n = await l.queryFeatureCount();
      const e = await l.queryExtent();
      const sin = await l.queryFeatureCount({ where: "STATUS = 'Plugged' AND (lat IS NULL OR lng IS NULL)" });
      const todas = (await k.queryExtent()).count;
      const sinTodas = await k.queryFeatureCount({ where: "lat IS NULL OR lng IS NULL" });
      return esperar(n - e.count === sin && sin === 175 && todas === 310702 && sinTodas === 389, `con filtro: queryFeatureCount=${n} · queryExtent.count=${e.count} · filas sin lat/lng=${sin} · sin filtro: queryExtent.count=${todas} aunque ${sinTodas} filas no tienen lat/lng`);
    }),
    await intento("orderByFields y estadísticas corren en el cliente", async () => {
      const top = await k.queryFeatures({ where: "DEPTH_OF_COMPLETED_WELL IS NOT NULL", orderByFields: ["DEPTH_OF_COMPLETED_WELL DESC"], num: 3, outFields: ["DEPTH_OF_COMPLETED_WELL"], returnGeometry: false });
      const st = await k.queryFeatures({ where: "1=1", outStatistics: [{ statisticType: "avg", onStatisticField: "DEPTH_OF_COMPLETED_WELL", outStatisticFieldName: "prom" }] });
      const v = top.features.map((f) => f.attributes.DEPTH_OF_COMPLETED_WELL);
      return esperar(v[0] === 1708, `3 más profundos=${v.join(",")} pies · promedio=${Number(st.features[0]?.attributes.prom).toFixed(1)}`);
    }),
    await intento("Sin edición: capabilities y la capa no tienen applyEdits", async () => {
      const c = k.capabilities?.operations;
      return esperar(c?.supportsEditing === false && !("applyEdits" in k), `supportsEditing=${c?.supportsEditing} · supportsAdd=${c?.supportsAdd} · applyEdits en la capa=${"applyEdits" in k}`);
    }),
    await intento("Kansas se dibuja: 310702 en la vista y píxeles pintados", async () => {
      const l = kansas();
      const view = await enVista(l, [-98.3, 38.25], 6);
      const lv = await view.whenLayerView(l);
      const t0 = performance.now();
      await esperarVista(view);
      const n = await lv.queryFeatureCount();
      const p = await pixeles(view);
      view.destroy();
      return esperar(n === 310702 && p.pintados > 0, `en la vista=${n} · ${p.pintados}/${p.total} px pintados · ${Math.round(performance.now() - t0)} ms hasta updating=false`);
    }),
    await intento("Fechas: timestamp[ms] → date; timestamp[us] → big-integer en µs; date32 → integer en días", async () => {
      const l = new ParquetLayer({ data: archivos("fechas.parquet") });
      await l.load();
      const a = (await l.queryFeatures({ where: "1=1", outFields: ["*"], num: 1 })).features[0].attributes;
      const tipos = ["fecha_ms", "fecha_us", "dia"].map((f) => l.getField(f)?.type);
      const kd = (await k.queryFeatures({ where: "COMPLETION_DATE IS NOT NULL", num: 1, outFields: ["COMPLETION_DATE"], returnGeometry: false })).features[0].attributes.COMPLETION_DATE;
      const desde2020 = await k.queryFeatureCount({ where: "COMPLETION_DATE > DATE '2020-01-01'" });
      const otros = ["OBJECTID", "WATER_USE_CODE", "TOWNSHIP", "DEPTH_OF_COMPLETED_WELL"].map((f) => `${f}:${k.getField(f)?.type}`).join(",");
      const d = `tipos=${tipos.join(",")} · valores=${a.fecha_ms},${a.fecha_us},${a.dia} (2020-01-01) · Kansas COMPLETION_DATE=${k.getField("COMPLETION_DATE")?.type} ${kd} (${typeof kd}), > DATE '2020-01-01'=${desde2020} · uint32/int32/int16/double → ${otros}`;
      return esperar(tipos.join() === "date,big-integer,integer" && a.fecha_us === a.fecha_ms * 1000 && a.dia === 18262 && desde2020 > 0 && otros === "OBJECTID:integer,WATER_USE_CODE:integer,TOWNSHIP:small-integer,DEPTH_OF_COMPLETED_WELL:double", d);
    }),
    await intento("GeoParquet: codificación, tipo y SR se detectan solos; int64 → big-integer", async () => {
      const l = new ParquetLayer({ data: archivos("geoparquet-puntos.parquet") });
      await l.load();
      const info = await parquetUtils.getParquetLayerInfo(archivos("geoparquet-puntos.parquet"));
      const d = `encoding=${codificacion(l)} · geometryType=${l.geometryType} · SR=${l.spatialReference.wkid} · fullExtent=${l.fullExtent ? "sí" : "null"} · poblacion=${l.getField("poblacion")?.type} · getParquetLayerInfo: ${info.geometryEncoding?.type}/${info.geometryType}/${info.spatialReference?.wkid}`;
      return esperar(codificacion(l) === "wkb(geometry)" && !!l.fullExtent && l.getField("poblacion")?.type === "big-integer", d);
    }),
    await intento("WKB sin metadato geo y sin geometryEncoding: carga como tabla, sin error", async () => {
      const l = new ParquetLayer({ data: archivos("wkb-puntos.parquet") });
      await l.load();
      const n = await l.queryFeatureCount();
      return esperar(l.isTable && l.loadError == null, `isTable=${l.isTable} · loadError=${l.loadError} · geometryType=${l.geometryType} · count=${n}`);
    }),
    await intento("WKB de polígonos con encoding pero sin geometryType: queda 'point' y la geometría sale null", async () => {
      const l = new ParquetLayer({ data: archivos("wkb-poligonos.parquet"), geometryEncoding: new GeometryEncodingWkb({ field: "geom" }), spatialReference: { wkid: 4326 } });
      const fs = await l.queryFeatures({ where: "1=1", returnGeometry: true });
      return esperar(l.geometryType === "point" && fs.features.length === 5 && fs.features[0].geometry == null, `geometryType=${l.geometryType} · ${fs.features.length} features · geometry=${fs.features[0]?.geometry} · loadError=${l.loadError}`);
    }),
    await intento("WKB de polígonos con encoding + geometryType + SR: funciona", async () => {
      const l = new ParquetLayer({ data: archivos("wkb-poligonos.parquet"), geometryEncoding: new GeometryEncodingWkb({ field: "geom" }), geometryType: "polygon", spatialReference: { wkid: 4326 } });
      const f = (await l.queryFeatures({ where: "1=1", returnGeometry: true })).features[0];
      const g = f.geometry as Polygon;
      return esperar(g.type === "polygon" && g.rings[0]?.length === 5, `geometry=${g.type} · anillo de ${g.rings[0]?.length} vértices · fullExtent=${l.fullExtent ? "sí" : "null"}`);
    }),
    await intento("Puntos WKB declarados polygon: polígonos vacíos, sin error", async () => {
      const l = new ParquetLayer({ data: archivos("wkb-puntos.parquet"), geometryEncoding: new GeometryEncodingWkb({ field: "geom" }), geometryType: "polygon", spatialReference: { wkid: 4326 } });
      const fs = await l.queryFeatures({ where: "1=1", returnGeometry: true });
      const g = fs.features[0]?.geometry as Polygon;
      return esperar(fs.features.length === 5 && g?.type === "polygon" && g.rings.length === 0, `${fs.features.length} features · geometry=${g?.type} · rings=${JSON.stringify(g?.rings)}`);
    }),
    await intento("WKB con encoding + geometryType pero sin spatialReference: geometría null", async () => {
      const l = new ParquetLayer({ data: archivos("wkb-puntos.parquet"), geometryEncoding: new GeometryEncodingWkb({ field: "geom" }), geometryType: "point" });
      const g = (await l.queryFeatures({ where: "1=1", returnGeometry: true })).features[0]?.geometry as Point | null;
      return esperar(g == null && l.spatialReference.wkid === 4326, `geometry=${g ? `${g.x},${g.y}` : String(g)} · aunque layer.spatialReference=${l.spatialReference.wkid} (su valor por defecto)`);
    }),
    await intento("lon/lat se detectan solos (gzip)", async () => {
      const l = new ParquetLayer({ data: archivos("lonlat.parquet") });
      await l.load();
      return esperar(codificacion(l) === "location(lon,lat)" && !!l.fullExtent, `encoding=${codificacion(l)} · fullExtent=${l.fullExtent ? "sí" : "null"}`);
    }),
    await intento("coord_x/coord_y sin encoding: tabla, sin error, y getParquetLayerInfo no la reconoce", async () => {
      const l = new ParquetLayer({ data: archivos("coord-xy.parquet") });
      await l.load();
      const info = await parquetUtils.getParquetLayerInfo(archivos("coord-xy.parquet"));
      return esperar(l.isTable && info.geometryEncoding == null, `isTable=${l.isTable} · loadError=${l.loadError} · count=${await l.queryFeatureCount()} · getParquetLayerInfo.geometryEncoding=${info.geometryEncoding}`);
    }),
    await intento("coord_x/coord_y con GeometryEncodingLocation + geometryType SIN spatialReference: no dibuja nada, sin error", async () => {
      const l = new ParquetLayer({ data: archivos("coord-xy.parquet"), geometryEncoding: new GeometryEncodingLocation({ xField: "coord_x", yField: "coord_y" }), geometryType: "point",
        renderer: { type: "simple", symbol: { type: "simple-marker", size: 40, color: "#ff0000", outline: { width: 0 } } } });
      const g = (await l.queryFeatures({ where: "1=1", returnGeometry: true })).features[0]?.geometry;
      const view = await enVista(l, [-74.08, 4.61], 10, "osm");
      await view.whenLayerView(l);
      await esperarVista(view);
      const p = await pixeles(view);
      view.destroy();
      return esperar(g === null && p.centro !== "255,0,0", `isTable=${l.isTable} · loadError=${l.loadError} · geometry=${JSON.stringify(g)} · whenLayerView resolvió · píxel del centro=${p.centro} (el basemap, no el punto rojo)`);
    }),
    await intento("coord_x/coord_y con encoding + geometryType + spatialReference: se dibuja", async () => {
      const l = new ParquetLayer({ data: archivos("coord-xy.parquet"), geometryEncoding: new GeometryEncodingLocation({ xField: "coord_x", yField: "coord_y" }), geometryType: "point", spatialReference: { wkid: 4326 },
        renderer: { type: "simple", symbol: { type: "simple-marker", size: 40, color: "#ff0000", outline: { width: 0 } } } });
      const g = (await l.queryFeatures({ where: "1=1", returnGeometry: true })).features[0]?.geometry as Point;
      const view = await enVista(l, [-74.08, 4.61], 10, "osm");
      await view.whenLayerView(l);
      await esperarVista(view);
      const p = await pixeles(view);
      view.destroy();
      return esperar(g?.x === -74.08 && p.centro === "255,0,0", `geometry=${g?.x},${g?.y} · píxel del centro=${p.centro}`);
    }),
    await intento("Sin metadato geo: fullExtent según la codificación, y un mapa sin basemap que no arranca", async () => {
      const xy = new ParquetLayer({ data: archivos("coord-xy.parquet"), geometryEncoding: new GeometryEncodingLocation({ xField: "coord_x", yField: "coord_y" }), geometryType: "point", spatialReference: { wkid: 4326 } });
      const wkb = new ParquetLayer({ data: archivos("wkb-puntos.parquet"), geometryEncoding: new GeometryEncodingWkb({ field: "geom" }), geometryType: "point", spatialReference: { wkid: 4326 } });
      const xySinSR = new ParquetLayer({ data: archivos("coord-xy.parquet"), geometryEncoding: new GeometryEncodingLocation({ xField: "coord_x", yField: "coord_y" }), geometryType: "point" });
      await Promise.all([xy.load(), wkb.load(), xySinSR.load()]);
      const qe = await wkb.queryExtent();
      const qeSinSR = await rechazo(xySinSR.queryExtent());
      contenedor.innerHTML = "";
      const div = document.createElement("div");
      div.style.cssText = "width:300px;height:300px";
      contenedor.appendChild(div);
      const view = new MapView({ container: div, map: new Map({ layers: [wkb] }), center: [-74, 5], zoom: 5 });
      const arranca = await Promise.race([view.when().then(() => "resolvió"), tick(8000).then(() => "pendiente a los 8 s")]);
      view.destroy();
      const d = `location+SR: fullExtent=${xy.fullExtent ? "sí" : "null"} · WKB+SR: fullExtent=${wkb.fullExtent ? "sí" : "null"}, queryExtent()=${qe.count} con extent ${qe.extent ? "sí" : "no"} · location sin SR: queryExtent() ${qeSinSR} · MapView sin basemap con solo la capa WKB: view.when() ${arranca}`;
      return esperar(!!xy.fullExtent && wkb.fullExtent == null && !!qe.extent && qeSinSR.startsWith("rechaza") && arranca.startsWith("pendiente"), d);
    }),
    await intento("ZSTD: load() rechaza con un mensaje claro", async () => {
      const r = await rechazo(new ParquetLayer({ data: archivos("lonlat-zstd.parquet") }).load());
      return esperar(/zstd/i.test(r), r);
    }),
    await intento("GeoParquet en EPSG:9377 rechaza; en 3857 carga", async () => {
      const a = await rechazo(new ParquetLayer({ data: archivos("geoparquet-9377.parquet") }).load());
      const m = new ParquetLayer({ data: archivos("geoparquet-3857.parquet") });
      await m.load();
      return esperar(a.includes("Only WGS84 and Web Mercator") && m.spatialReference.wkid === 3857, `9377: ${a} · 3857: carga, SR=${m.spatialReference.wkid}`);
    }),
    await intento("Columnas UTM declaradas como x/y con su SR proyectado: rechaza", async () => {
      const r = await rechazo(kansas({ geometryEncoding: new GeometryEncodingLocation({ xField: "NAD83_UTM_X", yField: "NAD83_UTM_Y" }), geometryType: "point", spatialReference: { wkid: 26914 } }).load());
      return esperar(r.includes("Only WGS84 and Web Mercator"), r);
    }),
    await intento("Varios archivos con el mismo esquema: se suman", async () => {
      const l = new ParquetLayer({ data: archivos("geoparquet-puntos.parquet", "geoparquet-puntos-2.parquet") });
      const n = await l.queryFeatureCount();
      return esperar(n === 8, `count=${n} (5 + 3)`);
    }),
    await intento("Varios archivos con esquemas distintos: cargan, cuentan, y pedir un campo rechaza", async () => {
      const l = new ParquetLayer({ data: archivos("geoparquet-puntos.parquet", "geoparquet-otro-esquema.parquet") });
      await l.load();
      const n = await l.queryFeatureCount();
      const r = await rechazo(l.queryFeatures({ where: "1=1", outFields: ["poblacion"], returnGeometry: false }));
      return esperar(n === 6 && r.includes("Unknown field"), `campos=${l.fields.map((f) => f.name).join(",")} · count=${n} · outFields ["poblacion"] ${r}`);
    }),
    await intento("404, host sin CORS, sin Range o sin HEAD: el mismo 'Failed to parse file'", async () => {
      const r404 = await rechazo(new ParquetLayer({ data: archivos("no-existe.parquet") }).load());
      const cors = await rechazo(new ParquetLayer({ data: new ParquetFilesData({ urls: ["https://www.google.com/datos.parquet"] }) }).load());
      const conRango = new ParquetLayer({ data: new ParquetFilesData({ urls: [url("/parquet/puntos-10k.parquet")] }) });
      const n = await conRango.queryFeatureCount();
      const sinRango = await rechazo(new ParquetLayer({ data: new ParquetFilesData({ urls: [url("/sin-rango/parquet/puntos-10k.parquet")] }) }).load());
      const sinHead = await rechazo(new ParquetLayer({ data: new ParquetFilesData({ urls: [url("/sin-head/parquet/puntos-10k.parquet")] }) }).load());
      const d = `404: ${r404} · sin CORS: ${cors} · con Range: ${n} filas · sin Range: ${sinRango} · sin HEAD: ${sinHead}`;
      return esperar([r404, cors, sinRango, sinHead].every((x) => x.includes("Failed to parse file")) && n === 10000, d);
    }),
    await intento("Archivo elegido por el usuario (blob: URL)", async () => {
      const buf = await (await fetch(url("/parquet/geoparquet-puntos.parquet"))).arrayBuffer();
      const l = new ParquetLayer({ data: new ParquetFilesData({ urls: [URL.createObjectURL(new Blob([buf]))] }) });
      const n = await l.queryFeatureCount();
      return esperar(n === 5, `count=${n}`);
    }),
    await intento("Polígonos: se dibujan, hitTest sin outFields trae solo el oid, con outFields los campos", async () => {
      const sin = new ParquetLayer({ data: archivos("geoparquet-poligonos.parquet"), renderer: { type: "simple", symbol: ROJO } });
      let view = await enVista(sin, [-74.08, 4.61], 12);
      await esperarVista(view);
      const p = await pixeles(view);
      const h1 = (await view.hitTest({ x: 150, y: 150 })).results[0];
      const a1 = h1 && "graphic" in h1 ? Object.keys(h1.graphic.attributes ?? {}).join(",") : "nada";
      view.destroy();
      const con = new ParquetLayer({ data: archivos("geoparquet-poligonos.parquet"), outFields: ["*"] });
      view = await enVista(con, [-74.08, 4.61], 12);
      await esperarVista(view);
      const h2 = (await view.hitTest({ x: 150, y: 150 })).results[0];
      const a2 = h2 && "graphic" in h2 ? JSON.stringify(h2.graphic.attributes) : "nada";
      const pt = con.createPopupTemplate();
      view.destroy();
      return esperar(p.centro === "255,0,0" && a1 === "__OBJECTID" && a2.includes("Bogotá"), `píxel=${p.centro} · hit sin outFields=${a1} · con outFields ["*"]=${a2} · createPopupTemplate: ${pt?.fieldInfos?.length} campos`);
    }),
    await intento("SceneView: la vista de la capa no se crea", async () => {
      contenedor.innerHTML = "";
      const div = document.createElement("div");
      div.style.cssText = "width:300px;height:300px";
      contenedor.appendChild(div);
      const l = new ParquetLayer({ data: archivos("geoparquet-puntos.parquet") });
      const view = new SceneView({ container: div, map: new Map({ layers: [l] }), center: [-74, 5], zoom: 5 });
      await view.when();
      const r = await Promise.race([rechazo(view.whenLayerView(l)), tick(15000).then(() => "pendiente a los 15 s")]);
      view.destroy();
      return esperar(r.startsWith("rechaza"), `whenLayerView ${r}`);
    }),
    await intento("urls (deprecado en 5.1) sigue cargando", async () => {
      const l = new ParquetLayer({ urls: [url("/parquet/geoparquet-puntos.parquet")] });
      const n = await l.queryFeatureCount();
      return esperar(n === 5, `count=${n} · data se llena solo: ${l.data ? "sí" : "no"}`);
    }),
  ];
}
