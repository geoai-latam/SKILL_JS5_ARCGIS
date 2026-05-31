// snippet-time.ts — drive a time-aware layer with a TimeExtent + slider component.
// Smoke-tested.
import "@arcgis/map-components/dist/components/arcgis-time-slider";
import TimeExtent from "@arcgis/core/time/TimeExtent.js";

const extent = new TimeExtent({
  start: new Date(Date.UTC(2020, 0, 1)),
  end: new Date(Date.UTC(2020, 11, 31)),
});

export { extent };
