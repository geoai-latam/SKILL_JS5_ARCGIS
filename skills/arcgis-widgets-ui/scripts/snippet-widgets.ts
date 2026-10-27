// snippet-widgets.ts — core UI components (Map Components first).
// Runtime-checked on SDK 5.1 (tests/runtime/casos/arcgis-widgets-ui.ts).
// Nest each element in <arcgis-map> with slot="top-right" (never position=), or bind it from
// outside with reference-element="#mapId".
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-layer-list";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-basemap-gallery";
import "@arcgis/map-components/components/arcgis-expand";

// An unbound component renders empty and logs nothing: check its view after the map is ready.
export function isBound(el: HTMLArcgisLegendElement | HTMLArcgisSearchElement) {
  return el.view != null;
}
