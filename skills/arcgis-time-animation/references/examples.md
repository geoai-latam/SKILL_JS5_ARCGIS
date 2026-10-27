# Examples: Time & Animation

## Example 1: Time slider over a time-enabled layer

**Use case:** daily playback of the 2000 Atlantic hurricane season.

```html
<arcgis-map basemap="osm" center="-60,25" zoom="3">
  <arcgis-time-slider slot="bottom-left" loop></arcgis-time-slider>
</arcgis-map>
```

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-time-slider";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import TimeInterval from "@arcgis/core/time/TimeInterval.js";

const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
const hurricanes = new FeatureLayer({ url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer/0" });
mapEl.map?.add(hurricanes);
await hurricanes.load();

const slider = document.querySelector("arcgis-time-slider")!;
slider.fullTimeExtent = hurricanes.timeInfo!.fullTimeExtent;
slider.stops = { interval: new TimeInterval({ value: 1, unit: "days" }) };
slider.play();
```

**Notes:**

- The slider needs `fullTimeExtent`; it does not read it from the layer.
- In the map's slot it drives that map's `view.timeExtent`.

---

## Example 2: Filter by a TimeExtent

**Use case:** show only 2020 data.

```typescript
import TimeExtent from "@arcgis/core/time/TimeExtent.js";

view.timeExtent = new TimeExtent({
  start: new Date(Date.UTC(2020, 0, 1)),
  end: new Date(Date.UTC(2020, 11, 31)),
});
```

**Notes:**

- Build dates in UTC; `new Date(2020, 0, 1)` is local midnight.
- Every layer with `timeInfo` and `useViewTime` (the default) filters to this window.

---

## Example 3: Animation without the slider

**Use case:** advance a one-month window every half second.

```typescript
import TimeExtent from "@arcgis/core/time/TimeExtent.js";

let month = 0;
const id = setInterval(() => {
  view.timeExtent = new TimeExtent({
    start: new Date(Date.UTC(2020, month, 1)),
    end: new Date(Date.UTC(2020, month + 1, 1)),
  });
  month = (month + 1) % 12;
}, 500);
// clearInterval(id) on teardown
```

**Notes:**

- Each assignment re-filters in the client; there is no request per step.
- The slider's `play()` with `playRate` does the same with UI.
