// snippet-coding.ts — an Arcade editor that reports whether the script is valid. Smoke-tested.
import "@arcgis/coding-components/components/arcgis-arcade-editor";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

export function arcadeEditor(editor: HTMLArcgisArcadeEditorElement, layer: FeatureLayer, onValid: (script: string) => void) {
  editor.profile = { id: "popup", definitions: { $feature: layer } };
  editor.disableAssistant = true;
  let errores = 0;
  editor.addEventListener("arcgisDiagnosticsChange", (e) => { errores = e.detail.length; });
  editor.addEventListener("arcgisScriptChange", (e) => { if (errores === 0) onValid(e.detail); });
}
