// snippet-lazy-import.ts — defer heavy modules with dynamic import(). Smoke-tested.
import type Map from "@arcgis/core/Map.js";

// CSVLayer is only pulled into a chunk when this runs, keeping the initial bundle small.
export async function addCsvLayer(map: Map, url: string) {
  const { default: CSVLayer } = await import("@arcgis/core/layers/CSVLayer.js");
  const layer = new CSVLayer({ url });
  map.add(layer);
  return layer;
}
