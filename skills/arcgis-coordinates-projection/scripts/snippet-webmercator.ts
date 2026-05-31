// snippet-webmercator.ts — fast geographic <-> web mercator helpers. Smoke-tested.
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import Point from "@arcgis/core/geometry/Point.js";

const geographic = new Point({ longitude: -74.08, latitude: 4.6 });
const webMercator = webMercatorUtils.geographicToWebMercator(geographic);

export { geographic, webMercator };
