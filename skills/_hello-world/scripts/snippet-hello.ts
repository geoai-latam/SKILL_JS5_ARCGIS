// snippet-hello.ts — the smoke test runs `tsc --noEmit` on this file against the
// real @arcgis/core types. If the import path or types are wrong, CI fails.
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";

const map = new Map({ basemap: "topo-vector" });

const view = new MapView({
  container: "viewDiv",
  map,
  center: [-74.08, 4.6],
  zoom: 10,
});

view.when(() => {
  console.log("Map ready");
});

export { map, view };
