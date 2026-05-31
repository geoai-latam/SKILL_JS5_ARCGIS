// snippet-geojson.ts — GeoJSONLayer from a URL. Smoke-tested.
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";

const layer = new GeoJSONLayer({
  url: "https://example.com/earthquakes.geojson",
  copyright: "USGS",
  popupTemplate: { title: "{place}", content: "Magnitude {mag}" },
});

export { layer };
