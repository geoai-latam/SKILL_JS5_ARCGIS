// snippet-feature-table.ts — arcgis-feature-table component bound to a FeatureLayer and a map.
// Runtime-checked on SDK 5.1 (tests/runtime/casos/arcgis-tables-forms.ts).
import "@arcgis/map-components/components/arcgis-feature-table";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

// <arcgis-map id="map" ...></arcgis-map>
// <arcgis-feature-table reference-element="#map"></arcgis-feature-table>
const layer = new FeatureLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0",
});

const tableEl = document.querySelector("arcgis-feature-table");
if (tableEl) tableEl.layer = layer; // the table loads the layer itself

export { layer };
