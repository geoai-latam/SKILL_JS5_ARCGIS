import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-editor";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));

// Client-side layer: applyEdits runs in the browser, nothing is written to any service.
function capa(extra: Record<string, unknown> = {}) {
  return new FeatureLayer({
    source: [
      new Graphic({ geometry: new Point({ longitude: -74.08, latitude: 4.6 }), attributes: { OBJECTID: 1, STATUS: "open" } }),
      new Graphic({ geometry: new Point({ longitude: -75.57, latitude: 6.25 }), attributes: { OBJECTID: 2, STATUS: "open" } }),
    ],
    objectIdField: "OBJECTID",
    fields: [{ name: "OBJECTID", type: "oid" }, { name: "STATUS", type: "string" }],
    geometryType: "point",
    spatialReference: { wkid: 4326 },
    ...extra,
  });
}
const resumen = (rs: { objectId?: number | null; error?: { message?: string } | null }[]) =>
  rs.map((r) => (r.error ? `error(${r.error.message})` : `ok(${r.objectId})`)).join(", ") || "[]";

export async function run(container: HTMLElement) {
  return [
    await intento("Inicio Rápido: applyEdits({ addFeatures }) → addFeatureResults[0].objectId", async () => {
      const l = capa(); await l.load();
      const r = await l.applyEdits({ addFeatures: [new Graphic({ geometry: new Point({ longitude: -76.5, latitude: 3.4 }), attributes: { STATUS: "open" } })] });
      return `objectId=${r.addFeatureResults[0].objectId} · error=${r.addFeatureResults[0].error ?? null} · total=${await l.queryFeatureCount()}`;
    }),
    await intento("Pitfall 3: update sin OBJECTID", async () => {
      const l = capa(); await l.load();
      try {
        const r = await l.applyEdits({ updateFeatures: [new Graphic({ attributes: { STATUS: "done" } })] });
        const done = (await l.queryFeatures({ where: "STATUS='done'", outFields: ["*"] })).features.length;
        return `no lanza · updateFeatureResults: ${resumen(r.updateFeatureResults)} · filas 'done'=${done}`;
      } catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("Update con OBJECTID inexistente (9999) y delete de { objectId: 99 }", async () => {
      const l = capa(); await l.load();
      try {
        const r = await l.applyEdits({ updateFeatures: [new Graphic({ attributes: { OBJECTID: 9999, STATUS: "done" } })], deleteFeatures: [{ objectId: 99 }] });
        return `no lanza · update: ${resumen(r.updateFeatureResults)} · delete: ${resumen(r.deleteFeatureResults)}`;
      } catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("Lote mixto: un update válido + uno inexistente (¿transaccional?)", async () => {
      const l = capa(); await l.load();
      const r = await l.applyEdits({ updateFeatures: [new Graphic({ attributes: { OBJECTID: 1, STATUS: "done" } }), new Graphic({ attributes: { OBJECTID: 9999, STATUS: "done" } })] });
      const done = (await l.queryFeatures({ where: "STATUS='done'" })).features.length;
      return `update: ${resumen(r.updateFeatureResults)} · filas 'done' después=${done}`;
    }),
    await intento("Atributo con mayúsculas distintas: { status: 'done' } (el campo es STATUS)", async () => {
      const l = capa(); await l.load();
      const r = await l.applyEdits({ updateFeatures: [new Graphic({ attributes: { OBJECTID: 1, status: "done" } })] });
      const f = (await l.queryFeatures({ objectIds: [1], outFields: ["*"] })).features[0];
      return `update: ${resumen(r.updateFeatureResults)} · STATUS quedó=${f.attributes.STATUS}`;
    }),
    await intento("Campo que no existe: { ESTADO: 'x' }", async () => {
      const l = capa(); await l.load();
      const r = await l.applyEdits({ updateFeatures: [new Graphic({ attributes: { OBJECTID: 1, ESTADO: "x" } })] });
      const f = (await l.queryFeatures({ objectIds: [1], outFields: ["*"] })).features[0];
      return `update: ${resumen(r.updateFeatureResults)} · atributos=${JSON.stringify(f.attributes)}`;
    }),
    await intento("Pitfall ext. 1: add con geometría en Web Mercator a una capa 4326", async () => {
      const l = capa(); await l.load();
      const r = await l.applyEdits({ addFeatures: [new Graphic({ geometry: new Point({ x: -8246616, y: 512620, spatialReference: { wkid: 3857 } }), attributes: { STATUS: "wm" } })] });
      const f = (await l.queryFeatures({ where: "STATUS='wm'", returnGeometry: true })).features[0];
      const p = f?.geometry as Point | undefined;
      return `add: ${resumen(r.addFeatureResults)} · guardada en wkid ${p?.spatialReference.wkid}: ${p?.x.toFixed(4)}, ${p?.y.toFixed(4)}`;
    }),
    await intento("hasZ: add de un punto con z a una capa sin z", async () => {
      const l = capa(); await l.load();
      try {
        const r = await l.applyEdits({ addFeatures: [new Graphic({ geometry: new Point({ longitude: -74, latitude: 4.6, z: 2600 }), attributes: { STATUS: "z" } })] });
        return `no lanza · add: ${resumen(r.addFeatureResults)}`;
      } catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("Pitfall ext. 2: ¿hace falta refresh()? conteo en el layerView tras applyEdits", async () => {
      const div = document.createElement("div"); div.style.cssText = "width:400px;height:300px"; container.innerHTML = ""; container.appendChild(div);
      const l = capa();
      const view = new MapView({ container: div, map: new Map({ basemap: "osm", layers: [l] }), center: [-75, 5], zoom: 6 });
      const lv = await view.whenLayerView(l);
      while (lv.updating) await tick();
      const antes = await lv.queryFeatureCount();
      let evento = 0; l.on("edits", () => evento++);
      await l.applyEdits({ addFeatures: [new Graphic({ geometry: new Point({ longitude: -76.5, latitude: 3.4 }), attributes: { STATUS: "open" } })] });
      await tick(300); while (lv.updating) await tick();
      const despues = await lv.queryFeatureCount();
      view.destroy();
      return `layerView antes=${antes} · después (sin refresh)=${despues} · evento 'edits'=${evento}`;
    }),
    await intento("editingEnabled = false: applyEdits", async () => {
      const l = capa({ editingEnabled: false }); await l.load();
      try {
        const r = await l.applyEdits({ addFeatures: [new Graphic({ geometry: new Point({ longitude: -74, latitude: 4 }), attributes: {} })] });
        return `no lanza · ${resumen(r.addFeatureResults)}`;
      } catch (e) { return `lanza: ${(e as Error).message}`; }
    }),
    await intento("Pitfall 2: capabilities de un servicio de solo lectura (MapServer/2)", async () => {
      const l = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2" });
      await l.load();
      const o = l.capabilities?.operations;
      return `supportsAdd=${o?.supportsAdd} · supportsUpdate=${o?.supportsUpdate} · supportsEditing=${o?.supportsEditing} · editingEnabled=${l.editingEnabled}`;
    }),
    await intento("arcgis-editor con reference-element: monta y ve la capa editable", async () => {
      container.innerHTML = "";
      const map = document.createElement("arcgis-map") as HTMLArcgisMapElement;
      map.id = "m-edit"; map.style.cssText = "display:block;width:500px;height:400px"; map.basemap = "osm";
      const ed = document.createElement("arcgis-editor") as HTMLArcgisEditorElement;
      ed.referenceElement = "m-edit";
      map.appendChild(ed); container.appendChild(map);
      await map.viewOnReady();
      map.map!.add(capa());
      await ed.componentOnReady(); await tick(2500);
      const out = `editor.view=${ed.view ? "sí" : "no"} · state=${ed.state} · layerInfos=${ed.layerInfos ?? "null (todas las editables)"}`;
      container.innerHTML = "";
      return out;
    }),
  ];
}
