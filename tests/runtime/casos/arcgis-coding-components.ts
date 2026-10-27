import "@arcgis/coding-components/components/arcgis-arcade-editor";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import { intento } from "./_util.ts";

const STATES = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2";
type Diag = { message?: string; severity?: number };

/** Mounts an editor, sets profile + script, and returns the diagnostics it settles on. */
async function diagnosticos(container: HTMLElement, profile: unknown, script: string, ms = 12000) {
  container.innerHTML = "";
  const el = document.createElement("arcgis-arcade-editor") as HTMLArcgisArcadeEditorElement;
  el.style.cssText = "display:block;width:700px;height:400px";
  el.disableAssistant = true;
  let ultimo: Diag[] | undefined;
  let eventos = 0;
  el.addEventListener("arcgisDiagnosticsChange", (e) => { eventos++; ultimo = (e as CustomEvent<Diag[]>).detail; });
  container.appendChild(el);
  if (profile) el.profile = profile as never;
  el.script = script;
  await new Promise((ok) => setTimeout(ok, ms));
  const msgs = (ultimo ?? []).map((d) => d.message).join(" | ");
  return `eventos=${eventos} · diagnósticos=${ultimo?.length ?? "ninguno"}${msgs ? " · " + msgs.slice(0, 160) : ""}`;
}

export async function run(container: HTMLElement) {
  const layer = new FeatureLayer({ url: STATES });
  await layer.load();
  const popup = { id: "popup", definitions: { $feature: layer, $map: undefined } };
  return [
    await intento("Perfil popup + capa: $feature.state_name (campo real)", () => diagnosticos(container, popup, "$feature.state_name")),
    await intento("Perfil popup + capa: $feature.NO_EXISTE", () => diagnosticos(container, popup, "$feature.NO_EXISTE")),
    await intento("Perfil popup: error de sintaxis «1 +»", () => diagnosticos(container, popup, "1 +")),
    await intento("Sin perfil: $feature.state_name", () => diagnosticos(container, undefined, "$feature.state_name")),
    await intento("Sin perfil: $feature.NO_EXISTE", () => diagnosticos(container, undefined, "$feature.NO_EXISTE")),
    await intento("Perfil equivocado (labeling) con $map, que solo existe en popup", () =>
      diagnosticos(container, { id: "labeling", definitions: { $feature: layer } }, "Count(FeatureSetByName($map, \"x\"))")),
    await intento("Mismo script en perfil popup", () => diagnosticos(container, popup, "Count(FeatureSetByName($map, \"x\"))")),
  ];
}
