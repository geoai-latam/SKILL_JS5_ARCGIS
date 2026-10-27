// snippet-lazy-import.ts — defer heavy modules with dynamic import(). Smoke-tested.
import type Map from "@arcgis/core/Map.js";

// CSVLayer goes to its own chunk. Measured gain is small (the SDK already lazy-loads most of its code);
// use this for optional features, not as a fix for first-load time.
export async function addCsvLayer(map: Map, url: string) {
  const { default: CSVLayer } = await import("@arcgis/core/layers/CSVLayer.js");
  const layer = new CSVLayer({ url });
  map.add(layer);
  return layer;
}
