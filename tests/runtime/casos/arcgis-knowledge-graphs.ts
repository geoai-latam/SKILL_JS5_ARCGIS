import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
import GraphQuery from "@arcgis/core/rest/knowledgeGraph/GraphQuery.js";
import GraphQueryStreaming from "@arcgis/core/rest/knowledgeGraph/GraphQueryStreaming.js";
import Entity from "@arcgis/core/rest/knowledgeGraph/Entity.js";
import KnowledgeGraphLayer from "@arcgis/core/layers/KnowledgeGraphLayer.js";
import LinkChartLayer from "@arcgis/core/layers/LinkChartLayer.js";
import WebLinkChart from "@arcgis/core/WebLinkChart.js";
import Point from "@arcgis/core/geometry/Point.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import esriConfig from "@arcgis/core/config.js";
import "@arcgis/map-components/components/arcgis-link-chart";
import { intento } from "./_util.ts";

// Esri's public sample graph. Anonymous access answers 499 "Token Required" (checked with curl on 2026-10-27);
// we never sign in, so these checks only measure what happens without a token.
const KG = "https://sampleserver7.arcgisonline.com/server/rest/services/Hosted/SupplyChain/KnowledgeGraphServer";
const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
const conTope = <T,>(p: Promise<T>, ms: number) => Promise.race([p, tick(ms).then(() => { throw new Error(`sigue pendiente a los ${ms / 1000} s`); })]);

export async function run() {
  return [
    await intento("fetchKnowledgeGraph sobre un grafo protegido, sin sesión", async () => {
      const t = performance.now();
      try { await conTope(knowledgeGraphService.fetchKnowledgeGraph(KG), 15000); return "resolvió (?)"; }
      catch (e) { return `${(e as Error).message} · tras ${((performance.now() - t) / 1000).toFixed(1)} s · ¿diálogo de login en el DOM? ${!!document.querySelector(".esri-identity-modal, arcgis-identity, calcite-dialog, .esri-identity-form")}`; }
    }),
    await intento("Lo mismo con un AbortSignal (no existe en fetchKnowledgeGraph): KnowledgeGraphLayer.load()", async () => {
      const l = new KnowledgeGraphLayer({ url: KG });
      const ctl = new AbortController();
      setTimeout(() => ctl.abort(), 8000);
      try { await l.load({ signal: ctl.signal }); return `cargó: ${l.loadStatus}`; }
      catch (e) { return `${(e as Error).name}: ${(e as Error).message} · loadStatus=${l.loadStatus}`; }
    }),
    await intento("Entity: ¿dónde vive la geometría?", async () => {
      const e = new Entity({ typeName: "Supplier", id: "{1}", properties: { Name: "Proveedor", shape: new Point({ longitude: -74.08, latitude: 4.6 }) } });
      const j = e.toJSON() as Record<string, unknown>;
      return `"geometry" in e=${"geometry" in e} · e.properties.shape=${(e.properties.shape as Point)?.type} · toJSON keys=${Object.keys(j).join(",")}`;
    }),
    await intento("GraphQuery: objeto plano vs instancia", async () => {
      const q = new GraphQuery({ openCypherQuery: "MATCH (n) RETURN n LIMIT 10" });
      const plano = { openCypherQuery: "MATCH (n) RETURN n LIMIT 10" };
      return `instancia.declaredClass=${(q as unknown as { declaredClass: string }).declaredClass} · plano tiene declaredClass=${"declaredClass" in plano} (los tipos de 5.1 rechazan el plano; ver check-code-blocks)`;
    }),
    await intento("GraphQueryStreaming con bindParameters (geometría y lista)", async () => {
      const q = new GraphQueryStreaming({
        openCypherQuery: "MATCH (s:Supplier) WHERE s.Name IN $nombres OR esri.graph.ST_Intersects($zona, s.shape) RETURN s",
        bindParameters: { nombres: ["A", "B"], zona: new Polygon({ rings: [[[-75, 4], [-73, 4], [-73, 5], [-75, 5], [-75, 4]]], spatialReference: { wkid: 4326 } }) },
      });
      return `bindParameters=${Object.keys(q.bindParameters ?? {}).join(",")} · zona=${(q.bindParameters?.zona as Polygon)?.type} · outputSpatialReference=${q.outputSpatialReference?.wkid ?? "null"}`;
    }),
    await intento("executeQuery con un grafo sin cargar (graph = { url })", async () => {
      try {
        const r = await conTope(knowledgeGraphService.executeQuery({ url: KG } as never, new GraphQuery({ openCypherQuery: "MATCH (n) RETURN n LIMIT 1" })), 15000);
        return `resolvió: ${r.resultRows.length} filas`;
      } catch (e) { return `${(e as Error).message}`; }
    }),
    await intento("LinkChartLayer y WebLinkChart se construyen; arcgis-link-chart registrado", async () => {
      const lc = new LinkChartLayer({ url: KG } as never);
      const wlc = new WebLinkChart();
      return `LinkChartLayer.type=${lc.type} · WebLinkChart.declaredClass=${(wlc as unknown as { declaredClass: string }).declaredClass} · customElements arcgis-link-chart=${!!customElements.get("arcgis-link-chart")} · apiKey=${esriConfig.apiKey ? "sí" : "no"}`;
    }),
  ];
}
