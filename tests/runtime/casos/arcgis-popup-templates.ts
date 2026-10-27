import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import PopupTemplate from "@arcgis/core/PopupTemplate.js";
import type MapView from "@arcgis/core/views/MapView.js";
import "@arcgis/map-components/components/arcgis-map";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
const CIUDADES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0";
const BOG = new Point({ longitude: -74.08, latitude: 4.6 });

// Text of a subtree, entering open shadow roots (the popup is a web component).
function texto(n: Node): string {
  let s = "";
  if (n.nodeType === Node.TEXT_NODE) return n.textContent ?? "";
  const el = n as Element;
  if (el.shadowRoot) s += texto(el.shadowRoot);
  for (const c of Array.from(n.childNodes)) s += texto(c);
  if (el.tagName === "STYLE" || el.tagName === "SCRIPT") return "";
  return s;
}
function hay(n: Node, sel: string): boolean {
  const el = n as Element & { shadowRoot?: ShadowRoot | null };
  if ((el as Element).querySelector?.(sel)) return true;
  if (el.shadowRoot && hay(el.shadowRoot, sel)) return true;
  return Array.from((n as ParentNode).children ?? []).some((c) => hay(c, sel));
}

function capa(template: PopupTemplate, attrs: Record<string, unknown> = {}) {
  return new FeatureLayer({
    source: [new Graphic({ geometry: BOG, attributes: { OBJECTID: 1, NAME: "Bogotá", POP: 7900000, CREATED: Date.UTC(2026, 9, 27), NOTES: "nota", ...attrs } })],
    objectIdField: "OBJECTID", geometryType: "point", spatialReference: { wkid: 4326 },
    fields: [{ name: "OBJECTID", type: "oid" }, { name: "NAME", type: "string" }, { name: "POP", type: "integer" }, { name: "CREATED", type: "date" }, { name: "NOTES", type: "string" }],
    popupTemplate: template,
  });
}
async function mapa(container: HTMLElement, layer: FeatureLayer, centro: [number, number] = [-74.08, 4.6], zoom = 10) {
  container.innerHTML = "";
  const m = document.createElement("arcgis-map") as HTMLElement & { viewOnReady(): Promise<void>; view: MapView; basemap: string; center: unknown; zoom: number };
  m.style.cssText = "display:block;width:500px;height:400px";
  m.basemap = "osm"; m.center = centro; m.zoom = zoom;
  container.appendChild(m);
  await m.viewOnReady();
  m.view.map?.add(layer);
  await m.view.whenLayerView(layer);
  await tick(500);
  return m;
}
async function abrir(container: HTMLElement, template: PopupTemplate, attrs: Record<string, unknown> = {}) {
  const l = capa(template, attrs);
  const m = await mapa(container, l);
  const { features } = await l.queryFeatures();
  m.view.openPopup({ features, location: BOG });
  await tick(1500);
  return { m, t: texto(m).replace(/\s+/g, " ") };
}

export async function run(container: HTMLElement) {
  return [
    await intento("Pitfall 1: {Name} cuando el campo es NAME", async () => {
      const { t } = await abrir(container, new PopupTemplate({ title: "T:{Name}|", content: "C:{name}|{NAME}|" }));
      return `título=${t.match(/T:[^|]*\|/)?.[0]} · contenido=${t.match(/C:[^|]*\|[^|]*\|/)?.[0]}`;
    }),
    await intento("Campo que no existe: {NOEXISTE}", async () => {
      const { t } = await abrir(container, new PopupTemplate({ title: "Lugar", content: "X:{NOEXISTE}|" }));
      return `se ve: ${t.match(/X:[^|]*\|/)?.[0] ?? "(nada)"}`;
    }),
    await intento("fields sin format: número y fecha", async () => {
      const { t } = await abrir(container, new PopupTemplate({ title: "Lugar", content: [{ type: "fields", fieldInfos: [{ fieldName: "POP", label: "Pob" }, { fieldName: "CREATED", label: "Creado" }] }] as never }));
      return `texto: ${t.slice(t.indexOf("Pob"), t.indexOf("Pob") + 80)}`;
    }),
    await intento("format: digitSeparator false y dateFormat", async () => {
      const { t } = await abrir(container, new PopupTemplate({ title: "Lugar", content: [{ type: "fields", fieldInfos: [{ fieldName: "POP", label: "Pob", format: { digitSeparator: false, places: 0 } }, { fieldName: "CREATED", label: "Creado", format: { dateFormat: "short-date" } }] }] as never }));
      return `texto: ${t.slice(t.indexOf("Pob"), t.indexOf("Pob") + 60)}`;
    }),
    await intento("Pitfall 3: función que devuelve un string con HTML hostil", async () => {
      (window as unknown as Record<string, unknown>).__xss = 0;
      const { m } = await abrir(container, new PopupTemplate({ title: "Lugar", content: () => `<div class="hostil">hola<img src="x" onerror="window.__xss=1"><script>window.__xss=2</script></div>` }));
      await tick(500);
      return `__xss=${(window as unknown as Record<string, unknown>).__xss} · ¿img con onerror en el DOM?=${hay(m, "img[onerror]")} · ¿div.hostil?=${hay(m, "div.hostil")} · ¿script?=${hay(m, "div.hostil script")}`;
    }),
    await intento("HTML dentro de un atributo usado en content de texto", async () => {
      (window as unknown as Record<string, unknown>).__xss = 0;
      const { m, t } = await abrir(container, new PopupTemplate({ title: "Lugar", content: "N:{NOTES}|" }), { NOTES: `<b class="negrita">x</b><img src="y" onerror="window.__xss=3">` });
      await tick(500);
      return `__xss=${(window as unknown as Record<string, unknown>).__xss} · ¿b.negrita en el DOM?=${hay(m, "b.negrita")} · ¿img[onerror]?=${hay(m, "img[onerror]")} · texto=${t.match(/N:[^|]*\|/)?.[0]}`;
    }),
    await intento("Función de contenido: qué recibe y async", async () => {
      let recibe = "";
      const { t } = await abrir(container, new PopupTemplate({ title: "Lugar", content: async (f: { graphic: Graphic }) => { recibe = Object.keys(f).join(","); await tick(200); const d = document.createElement("div"); d.textContent = `A:${f.graphic.attributes.NAME}|`; return d; } }));
      return `argumento con claves=${recibe} · se ve ${t.match(/A:[^|]*\|/)?.[0] ?? "(nada)"}`;
    }),
    await intento("Pitfall ext. 2: función que no devuelve nada", async () => {
      const { t } = await abrir(container, new PopupTemplate({ title: "Lugar", content: () => { void tick(10).then(() => "tarde"); } } as never));
      return `cuerpo después del título: "${t.slice(t.indexOf("Lugar") + 5, t.indexOf("Lugar") + 60).trim()}"`;
    }),
    await intento("Pitfall 2: outFields de la capa sin el campo del popup (servicio)", async () => {
      const l = new FeatureLayer({ url: CIUDADES, outFields: ["areaname"], definitionExpression: "areaname = 'New York'", popupTemplate: new PopupTemplate({ title: "{areaname}", content: "P:{pop2000}|" }) });
      const q = l.createQuery(); q.returnGeometry = true;
      const ny = (await l.queryFeatures(q)).features[0].geometry as Point;
      const m = await mapa(container, l, [ny.longitude!, ny.latitude!], 9);
      await tick(1500);
      const res = await m.view.hitTest(m.view.toScreen(ny)!, { include: [l] });
      const hit = res.results.find((r) => r.type === "graphic");
      const enGraphic = hit?.type === "graphic" ? Object.keys(hit.graphic.attributes).join(",") : "sin hit";
      m.view.openPopup({ location: ny, fetchFeatures: true } as never);
      await tick(4000);
      const t = texto(m).replace(/\s+/g, " ");
      return `atributos del graphic del hit=${enGraphic} · popup: ${t.match(/P:[^|]*\|/)?.[0] ?? "(no abrió)"}`;
    }),
    await intento("Pitfall ext. 4: función de contenido que lee un campo, con y sin template.outFields", async () => {
      const ver = async (outFields?: string[]) => {
        const l = new FeatureLayer({ url: CIUDADES, outFields: ["areaname"], definitionExpression: "areaname = 'New York'",
          popupTemplate: new PopupTemplate({ title: "{areaname}", outFields, content: (f: { graphic: Graphic }) => `F:${f.graphic.attributes.pop2000}|` }) });
        const q = l.createQuery(); q.returnGeometry = true;
        const ny = (await l.queryFeatures(q)).features[0].geometry as Point;
        const m = await mapa(container, l, [ny.longitude!, ny.latitude!], 9);
        await tick(1500);
        m.view.openPopup({ location: ny, fetchFeatures: true } as never);
        await tick(4000);
        return texto(m).replace(/\s+/g, " ").match(/F:[^|]*\|/)?.[0] ?? "(no abrió)";
      };
      return `sin outFields en el template: ${await ver()} · con outFields ["pop2000"]: ${await ver(["pop2000"])}`;
    }),
    await intento("Fecha a medianoche UTC: view.timeZone = 'UTC'", async () => {
      const l = capa(new PopupTemplate({ title: "Lugar", content: [{ type: "fields", fieldInfos: [{ fieldName: "POP", label: "Pob", format: { digitSeparator: true, places: 0 } }, { fieldName: "CREATED", label: "Creado", format: { dateFormat: "short-date" } }] }] as never }));
      const m = await mapa(container, l);
      const tz0 = m.view.timeZone;
      m.view.timeZone = "UTC";
      const { features } = await l.queryFeatures();
      m.view.openPopup({ features, location: BOG });
      await tick(1500);
      const t = texto(m).replace(/\s+/g, " ");
      return `timeZone por defecto=${tz0} · Intl=${Intl.DateTimeFormat().resolvedOptions().timeZone} · con UTC: ${t.slice(t.indexOf("Pob"), t.indexOf("Pob") + 40)}`;
    }),
    await intento("Pitfall ext. 1: popupEnabled false en la capa con openPopup({ location, fetchFeatures })", async () => {
      const l = capa(new PopupTemplate({ title: "Q:{NAME}|" }));
      l.popupEnabled = false;
      const m = await mapa(container, l);
      m.view.openPopup({ location: BOG, fetchFeatures: true } as never);
      await tick(2000);
      const t = texto(m).replace(/\s+/g, " ");
      return `se ve el título=${/Q:Bogotá/.test(t)}`;
    }),
  ];
}
