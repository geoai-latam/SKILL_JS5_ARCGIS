# Examples: Time & Animation

## Example 1: Time slider in a map

**Use case:** playback over a time-aware layer.

```html
<arcgis-map item-id="<time-aware-webmap>">
  <arcgis-time-slider position="bottom"></arcgis-time-slider>
</arcgis-map>
```

**Notes:**

- The slider drives `view.timeExtent`.
- The webmap should contain a time-aware layer.

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

- Build dates in UTC.
- All time-aware layers filter to this window.

---

## Example 3: Simple animation loop

**Use case:** advance a 1-month window each tick.

```typescript
let month = 0;
const id = setInterval(() => {
  view.timeExtent = new TimeExtent({
    start: new Date(Date.UTC(2020, month, 1)),
    end: new Date(Date.UTC(2020, month + 1, 1)),
  });
  month = (month + 1) % 12;
}, 500);
// clearInterval(id) to stop
```

**Notes:**

- Step `view.timeExtent`; don't re-query each frame.
- Clear the interval on cleanup.
