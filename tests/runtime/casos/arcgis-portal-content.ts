import Portal from "@arcgis/core/portal/Portal.js";
import PortalItem from "@arcgis/core/portal/PortalItem.js";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams.js";
import Layer from "@arcgis/core/layers/Layer.js";
import { intento } from "./_util.ts";

// Public ArcGIS Online content only: no sign-in.
const portal = new Portal();
const buscar = (p: ConstructorParameters<typeof PortalQueryParams>[0]) => portal.queryItems(new PortalQueryParams(p));
// Settles within ms or says it is still pending (a sign-in dialog never settles on its own).
const aTiempo = <T,>(p: Promise<T>, ms: number) => Promise.race([
  p.then((v) => ({ estado: "ok" as const, v }), (e: Error) => ({ estado: "error" as const, v: e })),
  new Promise<{ estado: "pendiente"; v: null }>((ok) => setTimeout(() => ok({ estado: "pendiente", v: null }), ms)),
]);

export async function run() {
  await portal.load();
  return [
    await intento("Portal sin sesión: url y user", async () => `url=${portal.url} · user=${portal.user} · name=${portal.name}`),
    await intento("Pitfall 1: title antes y después de load()", async () => {
      const { results } = await buscar({ query: 'type:"Web Map" AND owner:esri', num: 1 });
      const id = results[0].id;
      const item = new PortalItem({ id });
      const antes = `${item.title}/${item.type}`;
      await item.load();
      return `antes=${antes} · después=${item.title}/${item.type}`;
    }),
    await intento("Pitfall 3: queryItems sin num (tamaño de página y total)", async () => {
      const r = await buscar({ query: 'type:"Web Map" AND owner:esri' });
      return `results=${r.results.length} · total=${r.total} · nextQueryParams.start=${r.nextQueryParams?.start}`;
    }),
    await intento("num por encima de 100", async () => {
      const r = await buscar({ query: 'type:"Web Map" AND owner:esri', num: 250 }).catch((e: Error) => ({ error: e.message }));
      return "error" in r ? `error: ${r.error}` : `pidió 250 → llegaron ${r.results.length}`;
    }),
    await intento("Recorrer páginas con nextQueryParams hasta el final", async () => {
      let r = await buscar({ query: 'type:"Web Map" AND owner:esri', num: 100 });
      let n = r.results.length; const total = r.total; let paginas = 1;
      while (r.nextQueryParams && r.nextQueryParams.start > 0 && paginas < 20) { r = await portal.queryItems(r.nextQueryParams); n += r.results.length; paginas++; }
      return `total=${total} · recorridos=${n} en ${paginas} páginas · último nextQueryParams.start=${r.nextQueryParams?.start}`;
    }),
    await intento("start más allá de 10000", async () => {
      const r = await buscar({ query: "type:\"Feature Service\"", num: 10, start: 10001 }).catch((e: Error) => ({ error: e.message }));
      return "error" in r ? `error: ${r.error}` : `results=${r.results.length} · total=${r.total}`;
    }),
    await intento("type:\"Web Map\" ¿trae también Web Mapping Application?", async () => {
      const r = await buscar({ query: 'type:"Web Map" AND owner:esri', num: 100 });
      const tipos: Record<string, number> = {};
      r.results.forEach((i) => { tipos[i.type] = (tipos[i.type] ?? 0) + 1; });
      return JSON.stringify(tipos);
    }),
    await intento("sortField 'modified' sin sortOrder: ¿asc o desc?", async () => {
      const r = await buscar({ query: 'type:"Web Map" AND owner:esri', num: 5, sortField: "modified" });
      const f = r.results.map((i) => i.modified?.toISOString().slice(0, 10));
      const d = await buscar({ query: 'type:"Web Map" AND owner:esri', num: 5, sortField: "modified", sortOrder: "desc" });
      return `sin sortOrder: ${f.join(",")} · desc: ${d.results.map((i) => i.modified?.toISOString().slice(0, 10)).join(",")}`;
    }),
    await intento("Pitfall ext. 2: consulta amplia \"water\"", async () => {
      const a = await buscar({ query: "water", num: 1 });
      const b = await buscar({ query: 'water AND type:"Feature Service" AND owner:esri', num: 1 });
      return `"water" total=${a.total} · acotada total=${b.total}`;
    }),
    await intento("Pitfall ext. 3: item.url de un Web Map y Layer.fromPortalItem", async () => {
      const { results } = await buscar({ query: 'type:"Web Map" AND owner:esri', num: 1 });
      const wm = results[0];
      const capa = await Layer.fromPortalItem({ portalItem: wm }).then((l) => `capa ${l.type}`, (e: Error) => `error: ${e.message}`);
      const fs = (await buscar({ query: 'type:"Feature Service" AND owner:esri_dm', num: 1 })).results[0]
        ?? (await buscar({ query: 'type:"Feature Service" AND owner:esri', num: 1 })).results[0];
      const capaFs = await Layer.fromPortalItem({ portalItem: fs }).then(async (l) => { await l.load(); return `capa ${l.type}`; }, (e: Error) => `error: ${e.message}`);
      return `Web Map: url=${wm.url} · fromPortalItem → ${capa} || Feature Service: url=${fs.url?.slice(0, 60)} · fromPortalItem → ${capaFs}`;
    }),
    await intento("fetchData() de un Web Map", async () => {
      const { results } = await buscar({ query: 'type:"Web Map" AND owner:esri', num: 1 });
      const d = await results[0].fetchData() as { operationalLayers?: unknown[]; baseMap?: unknown };
      return `claves=${Object.keys(d).slice(0, 6).join(",")} · operationalLayers=${d.operationalLayers?.length}`;
    }),
    await intento("load() de un id que no existe", async () => {
      const r = await aTiempo(new PortalItem({ id: "f3c9a1e07b2d4e8f9a6c5b4d3e2f1a0b" }).load(), 15000);
      return `estado=${r.estado}${r.estado === "error" ? ` · ${(r.v as Error).name}: ${(r.v as Error).message}` : ""}`;
    }),
    await intento("Un id que no existe: loadStatus y loadError", async () => {
      const it = new PortalItem({ id: "f3c9a1e07b2d4e8f9a6c5b4d3e2f1a0b" });
      await it.load().catch(() => undefined);
      return `loadStatus=${it.loadStatus} · loaded=${it.loaded} · title=${it.title} · loadError=${it.loadError?.message}`;
    }),
    await intento("El bucle ingenuo: while (r.nextQueryParams)", async () => {
      let r = await buscar({ query: 'type:"Web Map" AND owner:esri', num: 100 });
      let n = r.results.length; let paginas = 1;
      while (r.nextQueryParams && paginas < 6) { r = await portal.queryItems(r.nextQueryParams); n += r.results.length; paginas++; }
      return `total=${r.total} · tras ${paginas} páginas (tope del test 6) llevaba ${n} resultados · último start=${r.nextQueryParams?.start}`;
    }),
    await intento("queryGroups público", async () => {
      const g = await portal.queryGroups(new PortalQueryParams({ query: "owner:esri", num: 3 }));
      const grupo = g.results[0];
      const items = grupo ? await grupo.queryItems(new PortalQueryParams({ num: 3 })) : null;
      return `grupos total=${g.total} · 1.º="${grupo?.title}" · sus items total=${items?.total}`;
    }),
  ];
}
