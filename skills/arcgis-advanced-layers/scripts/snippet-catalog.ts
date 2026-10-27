// snippet-catalog.ts — CatalogLayer (since 4.30): browse many datasets from one service.
// Smoke-tested.
import CatalogLayer from "@arcgis/core/layers/CatalogLayer.js";

const layer = new CatalogLayer({
  url: "https://services3.arcgis.com/TVDq0jswpjtt1Xia/arcgis/rest/services/PNW_Forest_Fuels_Inventory_Status/FeatureServer",
});

export async function loadCatalog() {
  await layer.load();
  return layer.title;
}

export { layer };
