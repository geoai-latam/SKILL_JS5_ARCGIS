// snippet-main.ts — the entry point scaffold.sh generates. Smoke-tested with tsc --noEmit (SDK 5.1).
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@esri/calcite-components/dist/components/calcite-shell";
import esriConfig from "@arcgis/core/config.js";

const apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string | undefined;
if (apiKey) esriConfig.apiKey = apiKey;
else console.warn("VITE_ARCGIS_API_KEY is empty: arcgis/* basemaps will ask for sign-in. Use basemap=\"osm\" or add .env.");

const mapEl = document.querySelector("arcgis-map");
if (mapEl) {
  // The arcgisViewReadyChange event has no detail (it is null): wait for the element instead.
  await mapEl.viewOnReady();
  console.log("View ready:", mapEl.view.type);
}

export {};
