import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-feature-table";
import "@arcgis/map-components/components/arcgis-feature-form";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import RelationshipQuery from "@arcgis/core/rest/support/RelationshipQuery.js";
import FormTemplate from "@arcgis/core/form/FormTemplate.js";
import FieldElement from "@arcgis/core/form/elements/FieldElement.js";
import { intento } from "./_util.ts";

// Public sample services. Nothing here writes to them: forms are read back, never applied.
const SOLICITUDES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0";
const CIUDADES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0";
const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
type Tabla = HTMLArcgisFeatureTableElement;
type Forma = HTMLArcgisFeatureFormElement;

async function tabla(container: HTMLElement, layer: FeatureLayer, conMapa = false) {
  container.innerHTML = conMapa
    ? `<arcgis-map id="m" basemap="osm" center="-117.2,32.8" zoom="10" style="display:block;height:250px"></arcgis-map><arcgis-feature-table reference-element="#m" style="display:block;height:300px"></arcgis-feature-table>`
    : `<arcgis-feature-table style="display:block;height:300px"></arcgis-feature-table>`;
  if (conMapa) { const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement; await m.viewOnReady(); m.view.map?.add(layer); }
  const t = container.querySelector("arcgis-feature-table") as Tabla;
  t.layer = layer;
  await t.componentOnReady();
  const t0 = performance.now();
  while ((t.size === 0 || t.isQueryingOrSyncing) && performance.now() - t0 < 20000) await tick(200);
  return t;
}
// Deep search through open shadow roots.
function todos(n: ParentNode, sel: string, out: Element[] = []): Element[] {
  n.querySelectorAll(sel).forEach((e) => out.push(e));
  n.querySelectorAll("*").forEach((e) => { if (e.shadowRoot) todos(e.shadowRoot, sel, out); });
  return out;
}

export async function run(container: HTMLElement) {
  return [
    await intento("Pitfall 1: table.layer con una capa sin cargar", async () => {
      const l = new FeatureLayer({ url: SOLICITUDES });
      const antes = l.loaded;
      const t = await tabla(container, l);
      return `capa cargada antes=${antes} · después=${l.loaded} · columnas=${t.allColumns.length} · filas=${t.size} · pageSize=${t.pageSize}`;
    }),
    await intento("Pitfall ext. 1: sin reference-element vs con él", async () => {
      const a = await tabla(container, new FeatureLayer({ url: SOLICITUDES }));
      const sin = `view=${a.view ? a.view.type : "null"}`;
      const b = await tabla(container, new FeatureLayer({ url: SOLICITUDES }), true);
      return `sin reference-element: ${sin} · con reference-element="#m": view=${b.view?.type}`;
    }),
    await intento("Pitfall ext. 2: editingEnabled en una capa sin edición (MapServer)", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const t = await tabla(container, l);
      t.editingEnabled = true;
      await tick(500);
      const ops = (l.capabilities?.operations ?? {}) as Record<string, boolean>;
      return `editingEnabled=${t.editingEnabled} · supportsUpdate=${ops.supportsUpdate} · editingEnabled de la capa=${l.editingEnabled} · columnas editables=${t.fieldColumns.filter((c) => c.editable).length}/${t.fieldColumns.length}`;
    }),
    await intento("queryRelatedFeatures: clave del resultado, id correcto e incorrecto", async () => {
      const l = new FeatureLayer({ url: SOLICITUDES });
      await l.load();
      const rels = l.relationships?.map((r) => `${r.id}:${r.name}`).join(",");
      // A request that has comments: ask the related table for one comment and take its key.
      const ids = await l.queryObjectIds({ where: "1=1", num: 200 } as never);
      const q = new RelationshipQuery({ objectIds: ids.slice(0, 200) as number[], relationshipId: l.relationships![0].id, outFields: ["*"] });
      const res = await l.queryRelatedFeatures(q);
      const claves = Object.keys(res);
      const malo = await l.queryRelatedFeatures(new RelationshipQuery({ objectIds: ids.slice(0, 5) as number[], relationshipId: 7, outFields: ["*"] })).then((r) => `resolvió con ${Object.keys(r).length} claves`, (e: Error) => `error: ${e.message.slice(0, 80)}`);
      return `relaciones=${rels} · con id 0: ${claves.length} padres con relacionados (tipo de clave=${typeof claves[0]}, 1.º tiene ${claves[0] ? res[claves[0] as never].features.length : 0}) · con relationshipId 7: ${malo}`;
    }),
    await intento("Pitfall ext. 5: capa sin relaciones", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      await l.load();
      let r = "";
      try { r = String(l.relationships![0].id); } catch (e) { r = `lanza: ${(e as Error).message}`; }
      return `relationships=${JSON.stringify(l.relationships)} · relationships[0].id → ${r}`;
    }),
    await intento("Pitfall ext. 3: arcgis-feature-form: ¿getValues y feature reflejan lo escrito?", async () => {
      const l = new FeatureLayer({ url: SOLICITUDES, outFields: ["*"] });
      await l.load();
      const { features } = await l.queryFeatures({ where: "1=1", num: 1, outFields: ["*"], returnGeometry: true } as never);
      const f = features[0];
      container.innerHTML = `<arcgis-feature-form style="display:block;height:500px;width:400px"></arcgis-feature-form>`;
      const form = container.querySelector("arcgis-feature-form") as Forma;
      form.layer = l;
      form.formTemplate = new FormTemplate({ elements: [new FieldElement({ fieldName: "comments", label: "Comentarios" })] });
      form.feature = f;
      await form.componentOnReady();
      await tick(2500);
      const original = f.attributes.comments;
      const inputs = todos(form, "calcite-input-text, calcite-text-area, input, textarea");
      const campo = inputs.find((e) => e.tagName.toLowerCase().startsWith("calcite-text-area") || e.tagName.toLowerCase().startsWith("calcite-input-text")) as (HTMLElement & { value: string }) | undefined;
      let escrito = "sin campo";
      if (campo) {
        campo.value = "PRUEBA-skill";
        for (const ev of ["calciteInputTextInput", "calciteInputTextChange", "calciteTextAreaInput", "calciteTextAreaChange", "input", "change", "blur"]) campo.dispatchEvent(new CustomEvent(ev, { bubbles: true, composed: true }));
        escrito = campo.tagName.toLowerCase();
      }
      await tick(800);
      const v = await form.getValues();
      return `campos encontrados=${inputs.map((e) => e.tagName.toLowerCase()).join(",")} · escribí en=${escrito} · getValues().comments=${JSON.stringify(v?.comments)} · form.feature.attributes.comments=${JSON.stringify(form.feature?.attributes.comments)} · original=${JSON.stringify(original)} · state=${form.state}`;
    }),
    await intento("arcgis-feature-form: arcgisSubmit con submit()", async () => {
      const form = container.querySelector("arcgis-feature-form") as Forma;
      let detalle = "no se disparó";
      form.addEventListener("arcgisSubmit", (e) => { const d = (e as CustomEvent).detail; detalle = `claves=${Object.keys(d ?? {}).join(",")} · valid=${d?.valid} · values.comments=${JSON.stringify(d?.values?.comments)}`; });
      await form.submit();
      await tick(500);
      return detalle;
    }),
    await intento("Sin formTemplate: ¿qué campos muestra?", async () => {
      const l = new FeatureLayer({ url: SOLICITUDES, outFields: ["*"] });
      await l.load();
      const { features } = await l.queryFeatures({ where: "1=1", num: 1, outFields: ["*"] } as never);
      container.innerHTML = `<arcgis-feature-form style="display:block;height:500px;width:400px"></arcgis-feature-form>`;
      const form = container.querySelector("arcgis-feature-form") as Forma;
      form.layer = l; form.feature = features[0];
      await form.componentOnReady(); await tick(2500);
      const n = todos(form, "calcite-input-text, calcite-text-area, calcite-input-number, calcite-input-date-picker, calcite-select, calcite-combobox, calcite-input-time-picker").length;
      return `controles=${n} · campos editables de la capa=${l.fields.filter((x) => x.editable).length} de ${l.fields.length}`;
    }),
    await intento("Pitfall ext. 4: definitionExpression de la tabla vs de la capa; layerUrl", async () => {
      const l = new FeatureLayer({ url: CIUDADES });
      const t = await tabla(container, l);
      const total = t.size;
      t.definitionExpression = "st = 'CA'";
      const t0 = performance.now();
      while ((t.size === total || t.isQueryingOrSyncing) && performance.now() - t0 < 15000) await tick(200);
      const conFiltro = t.size;
      container.innerHTML = `<arcgis-feature-table layer-url="${CIUDADES}" style="display:block;height:300px"></arcgis-feature-table>`;
      const u = container.querySelector("arcgis-feature-table") as Tabla;
      await u.componentOnReady();
      const t1 = performance.now();
      while (u.size === 0 && performance.now() - t1 < 20000) await tick(200);
      return `filas=${total} · con table.definitionExpression="st = 'CA'": ${conFiltro} · layer.definitionExpression=${JSON.stringify(l.definitionExpression)} · con layer-url: filas=${u.size}, layer=${u.layer?.type}`;
    }),
  ];
}
