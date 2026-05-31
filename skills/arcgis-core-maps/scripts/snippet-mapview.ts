// snippet-mapview.ts — 2D MapView via the Core API. Smoke-tested with tsc --noEmit.
import esriConfig from "@arcgis/core/config.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;

const map = new Map({ basemap: "arcgis/topographic" });

const view = new MapView({
  container: "viewDiv",
  map,
  center: [-74.08, 4.6], // Bogotá (lon, lat)
  zoom: 11,
});

view.when(() => {
  console.log("MapView ready at zoom", view.zoom);
});

export { map, view };
