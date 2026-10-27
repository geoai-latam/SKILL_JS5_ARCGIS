// snippet-map-component.ts — Map Components approach. The element is declared in HTML;
// here we register it and read the view once it is ready. Smoke-tested with tsc --noEmit.
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";

// <arcgis-map basemap="arcgis/topographic" center="-74.08,4.6" zoom="11"></arcgis-map>
const mapEl = document.querySelector("arcgis-map");

// The ready event carries no detail (it is null): read the view from the element.
mapEl?.addEventListener("arcgisViewReadyChange", () => {
  console.log("Component view ready", mapEl.view.zoom);
});

export {};
