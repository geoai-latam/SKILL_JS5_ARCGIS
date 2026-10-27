// snippet-feature-table.ts — arcgis-feature-table component bound to a FeatureLayer.
// Smoke-tested. The element is placed in HTML; here we register it and the layer.
import "@arcgis/map-components/components/arcgis-feature-table";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

// <arcgis-feature-table reference-element="arcgis-map"></arcgis-feature-table>
const layer = new FeatureLayer({
  url: "https://services.arcgis.com/example/arcgis/rest/services/Inspections/FeatureServer/0",
});

const tableEl = document.querySelector("arcgis-feature-table") as
  | (HTMLElement & { layer?: FeatureLayer })
  | null;
if (tableEl) tableEl.layer = layer;

export { layer };
