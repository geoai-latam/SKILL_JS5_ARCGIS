// snippet-main.ts — the entry point scaffold.sh generates. Smoke-tested with tsc --noEmit.
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@esri/calcite-components/dist/components/calcite-shell";
import esriConfig from "@arcgis/core/config.js";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;

const mapEl = document.querySelector("arcgis-map");
mapEl?.addEventListener("arcgisViewReadyChange", (e) => {
  console.log("View ready:", (e as CustomEvent).detail.view);
});

export {};
