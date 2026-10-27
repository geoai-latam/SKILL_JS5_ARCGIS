// snippet-time.ts — drive a time-enabled layer with the time slider component.
// Runtime-checked on SDK 5.1 (tests/runtime/casos/arcgis-time-animation.ts).
import "@arcgis/map-components/components/arcgis-time-slider";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import TimeInterval from "@arcgis/core/time/TimeInterval.js";
import TimeExtent from "@arcgis/core/time/TimeExtent.js";

// Atlantic hurricanes of 2000, a public time-enabled layer.
const hurricanes = new FeatureLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer/0",
});

// UTC dates: new Date(2000, 7, 1) would be local midnight.
const august = new TimeExtent({
  start: new Date(Date.UTC(2000, 7, 1)),
  end: new Date(Date.UTC(2000, 8, 1)),
});

export async function bindSlider(slider: HTMLArcgisTimeSliderElement) {
  await hurricanes.load();
  slider.fullTimeExtent = hurricanes.timeInfo!.fullTimeExtent; // the slider does not read it from the layer
  slider.stops = { interval: new TimeInterval({ value: 1, unit: "days" }) };
}

export { hurricanes, august };
