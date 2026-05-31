// snippet-catalog.ts — CatalogLayer (new in 5.0): browse many datasets from one service.
// Smoke-tested.
import CatalogLayer from "@arcgis/core/layers/CatalogLayer.js";

const layer = new CatalogLayer({
  url: "https://example.com/arcgis/rest/services/MyCatalog/MapServer",
});

export async function loadCatalog() {
  await layer.load();
  return layer.title;
}

export { layer };
