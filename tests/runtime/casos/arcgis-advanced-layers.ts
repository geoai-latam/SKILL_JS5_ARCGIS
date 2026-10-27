import CatalogLayer from "@arcgis/core/layers/CatalogLayer.js";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer.js";
import WFSLayer from "@arcgis/core/layers/WFSLayer.js";
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";
import OGCFeatureLayer from "@arcgis/core/layers/OGCFeatureLayer.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { intento, invertido } from "./_util.ts";

const CATALOGO = "https://services3.arcgis.com/TVDq0jswpjtt1Xia/arcgis/rest/services/PNW_Forest_Fuels_Inventory_Status/FeatureServer";
const USA = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer";

export async function run(container: HTMLElement) {
  return [
    await intento("CatalogLayer sobre un FeatureServer de catálogo carga y trae footprintLayer", async () => {
      const l = new CatalogLayer({ url: CATALOGO }); await l.load();
      return `${l.title} · footprint=${l.footprintLayer?.type} · dynamicGroup=${l.dynamicGroupLayer?.type}`;
    }),
    await invertido("CatalogLayer sobre un MapServer (lo que enseñaba la skill) — se espera rechazo", async () => {
      const l = new CatalogLayer({ url: USA }); await l.load(); return "cargó";
    }),
    await intento("MapImageLayer USA: findSublayerById(1) y toggle", async () => {
      const l = new MapImageLayer({ url: USA, sublayers: [{ id: 2, visible: true }, { id: 1, visible: false }] });
      await l.load(); const s = l.findSublayerById(1); if (!s) throw new Error("sin sublayer 1");
      s.visible = true;
      const todo = new MapImageLayer({ url: USA }); await todo.load();
      return `con sublayers declarados: ${l.sublayers?.length} · sin declararlos: ${todo.sublayers?.length} · 1.visible=${s.visible}`;
    }),
    await intento("MapImageLayer: ¿el servicio admite capas dinámicas (renderer por sublayer)?", async () => {
      const l = new MapImageLayer({ url: USA }); await l.load();
      return `capabilities.exportMap.supportsDynamicLayers=${l.capabilities?.exportMap?.supportsDynamicLayers}`;
    }),
    await intento("WFSLayer 2.0 + GeoJSON (MapServer demo, ms:cities) carga y consulta", async () => {
      const l = new WFSLayer({ url: "https://demo.mapserver.org/cgi-bin/wfs", name: "ms:cities" });
      await l.load(); const n = await l.queryFeatureCount(); return `${l.title} · ${n} features · sr=${l.spatialReference?.wkid}`;
    }),
    await intento("WFSLayer con nombre sin prefijo ('cities'): depende del servidor (MapServer lo acepta)", async () => {
      const l = new WFSLayer({ url: "https://demo.mapserver.org/cgi-bin/wfs", name: "cities" }); await l.load(); return `cargó: ${l.name}`;
    }),
    await intento("WMSLayer (MapServer demo, cities) carga y lista sublayers", async () => {
      const l = new WMSLayer({ url: "https://demo.mapserver.org/cgi-bin/wms", sublayers: [{ name: "cities" }] });
      await l.load(); return `${l.title} · version ${l.version} · ${l.allSublayers.length} sublayers · featureInfoFormat=${l.featureInfoFormat}`;
    }),
    await intento("WMSLayer sin sublayers declarados lista los nombres reales del GetCapabilities", async () => {
      const l = new WMSLayer({ url: "https://demo.mapserver.org/cgi-bin/wms" }); await l.load();
      return l.allSublayers.map((x) => x.name).join(", ");
    }),
    await intento("WMSLayer con un nombre que no existe: ¿avisa?", async () => {
      const l = new WMSLayer({ url: "https://demo.mapserver.org/cgi-bin/wms", sublayers: [{ name: "no_existe" }] });
      await l.load(); return `load() resuelve · sublayers=${l.sublayers?.map((x) => x.name).join(",")} · loadError=${l.loadError}`;
    }),
    await intento("OGCFeatureLayer (OGC API Features, pygeoapi lakes) carga y consulta", async () => {
      const l = new OGCFeatureLayer({ url: "https://demo.pygeoapi.io/master", collectionId: "lakes" });
      await l.load(); return `${l.title} · campos=${l.fields?.length} · geometría=${l.geometryType}`;
    }),
    await intento("OGCFeatureLayer: queryFeatures desde su layer view (lo que enseña la skill)", async () => {
      const lakes = new OGCFeatureLayer({ url: "https://demo.pygeoapi.io/master", collectionId: "lakes" });
      const view = new MapView({ map: new Map({ layers: [lakes] }), container, center: [0, 20], zoom: 1 });
      const lv = await view.whenLayerView(lakes);
      await reactiveUtils.whenOnce(() => !lv.updating);
      const n = (await lv.queryFeatures()).features.length; view.destroy(); return `${n} lagos desde el layer view`;
    }),
  ];
}
