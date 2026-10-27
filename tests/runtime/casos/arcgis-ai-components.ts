import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/ai-components/components/arcgis-assistant";
import "@arcgis/ai-components/components/arcgis-assistant-navigation-agent";
import "@arcgis/ai-components/components/arcgis-assistant-agent";
import { FunctionAgent } from "@arcgis/ai-components/agent-utils/FunctionAgent.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
type Asistente = HTMLElement & {
  componentOnReady(): Promise<unknown>;
  referenceElement: unknown;
  messages: { length: number; toArray(): Array<{ role?: string; content?: unknown; errors?: unknown[] }> };
  submitMessage(m: string): Promise<void>;
};
const dialogos = () => {
  const ds = [...document.querySelectorAll("calcite-dialog")] as Array<HTMLElement & { open?: boolean; heading?: string }>;
  const abiertos = ds.filter((d) => d.open);
  return `${abiertos.length} abiertos${abiertos.length ? ` («${abiertos.map((d) => d.heading ?? d.textContent?.trim().slice(0, 60)).join("», «")}»)` : ""}`;
};
const limpiar = () => document.querySelectorAll("calcite-dialog").forEach((d) => d.remove());

async function montar(container: HTMLElement, ref: string) {
  container.innerHTML = `<arcgis-map id="myMap" basemap="osm" center="-74,4.6" zoom="5" style="display:block;width:500px;height:300px"></arcgis-map><arcgis-assistant reference-element="${ref}" style="display:block;width:360px;height:400px"><arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent></arcgis-assistant>`;
  const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
  await m.viewOnReady();
  const a = container.querySelector("arcgis-assistant") as Asistente;
  const eventos: string[] = [];
  for (const ev of ["arcgisReady", "arcgisError"]) a.addEventListener(ev, (e) => eventos.push(`${ev}${(e as CustomEvent).detail ? `(${String((e as CustomEvent).detail?.message ?? (e as CustomEvent).detail).slice(0, 120)})` : ""}`));
  await a.componentOnReady(); await tick(3000);
  return { m, a, eventos };
}

export async function run(container: HTMLElement) {
  return [
    await intento("reference-element=\"#myMap\" (la skill) frente a \"myMap\" (el ejemplo de los tipos)", async () => {
      const out: string[] = [];
      for (const ref of ["#myMap", "myMap"]) {
        const { a, eventos } = await montar(container, ref);
        const r = a.referenceElement as { tagName?: string } | string | null;
        out.push(`${ref}: referenceElement=${typeof r === "string" ? `"${r}"` : r?.tagName ?? "null"}, eventos=[${eventos.join(", ")}], alto=${Math.round(a.getBoundingClientRect().height)} px`);
      }
      return out.join(" · ");
    }),
    await intento("Sin sesión de ArcGIS Online: qué hace submitMessage", async () => {
      const { a, eventos } = await montar(container, "myMap");
      const r: string = await Promise.race([a.submitMessage("Llévame a Villa de Leyva").then(() => "resuelve", (e: Error) => `rechaza: ${e.message.slice(0, 160)}`), tick(15000).then(() => "pendiente 15 s")]);
      await tick(1500);
      const msgs = a.messages.toArray().map((x) => `${x.role}${x.errors?.length ? `[${x.errors.length} errores]` : ""}`).join(",");
      return `submitMessage: ${r} · mensajes=${msgs} · eventos=[${eventos.join(", ")}] · diálogos de sesión=${dialogos()}`;
    }),
    await intento("FunctionAgent (5.1): agente sin escribir LangGraph, su registration y su grafo corriendo sin LLM", async () => {
      const ag = new FunctionAgent({
        name: "ConteoAgent",
        description: "Cuenta las capas del mapa. Úsalo cuando pregunten cuántas capas hay.",
        execute: async () => "El mapa tiene 1 capa.",
      });
      const reg = ag.registration;
      const g = (reg.createGraph() as unknown as { compile(): { invoke(s: unknown): Promise<Record<string, unknown>> } }).compile();
      const res = await g.invoke({ messages: [] });
      return `id=${reg.id} · name=${reg.name} · workspace=${typeof reg.workspace} · claves del estado final=${Object.keys(res).join(",")} · outputMessage=${JSON.stringify(res.outputMessage)}`;
    }),
    await intento("FunctionAgent registrado con arcgis-assistant-agent (agent = .registration)", async () => {
      limpiar();
      container.innerHTML = `<arcgis-assistant style="display:block;width:360px;height:300px"></arcgis-assistant>`;
      const a = container.querySelector("arcgis-assistant") as Asistente;
      const el = document.createElement("arcgis-assistant-agent") as HTMLElement & { agent: unknown; componentOnReady(): Promise<unknown> };
      const ag = new FunctionAgent({ name: "EcoAgent", description: "Repite. Úsalo para probar.", execute: async () => "eco" });
      el.agent = ag.registration;
      a.appendChild(el);
      const eventos: string[] = [];
      for (const ev of ["arcgisReady", "arcgisError"]) a.addEventListener(ev, (e) => eventos.push(`${ev}${(e as CustomEvent).detail ? `(${String((e as CustomEvent).detail?.message ?? (e as CustomEvent).detail).slice(0, 120)})` : ""}`));
      await a.componentOnReady(); await el.componentOnReady(); await tick(4000);
      const r = await Promise.race([a.submitMessage("eco").then(() => "resuelve", (e: Error) => `rechaza: ${e.message.slice(0, 160)}`), tick(15000).then(() => "pendiente 15 s")]);
      return `assistant sin reference-element y solo agente propio: alto=${Math.round(a.getBoundingClientRect().height)} px, agent.id=${(el.agent as { id: string }).id}, eventos=[${eventos.join(", ")}], submitMessage: ${r}, diálogos de sesión=${dialogos()}`;
    }),
  ];
}
