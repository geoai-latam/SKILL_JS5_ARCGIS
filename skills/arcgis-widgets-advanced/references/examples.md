# Examples: Advanced Widgets

## Example 1: Bookmarks in a map

**Use case:** let users jump between saved viewpoints and add their own.

```html
<arcgis-map item-id="YOUR_WEBMAP_ID">
  <arcgis-bookmarks slot="top-right" show-add-bookmark-button></arcgis-bookmarks>
</arcgis-map>
```

**Notes:**

- A web map supplies its saved bookmarks; on a plain basemap the list is empty (measured: 0).
- The add button is off by default (`showAddBookmarkButton` is `false`).

---

## Example 2: Print/export

**Use case:** export the current map (restrict formats with `printEl.allowedFormats = ["pdf"]`).

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="11">
  <arcgis-print slot="top-left"></arcgis-print>
</arcgis-map>
```

**Notes:**

- With no `print-service-url`, the component uses ArcGIS Online's print service.
- Nested in the map, it needs no `reference-element`.

---

## Example 3: Daylight on a 3D scene

**Use case:** simulate sun position and shadows.

```html
<arcgis-scene basemap="osm" ground="world-elevation" camera-position="-74.05,4.6,4000">
  <arcgis-daylight slot="top-right"></arcgis-daylight>
</arcgis-scene>
```

**Notes:**

- In a 2D map the component renders and raises nothing, but there is no sun to move (measured).

---

## Example 4: Elevation profile with its numbers

**Use case:** the highest point along a line across the Eastern Cordillera.

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-elevation-profile";
import Polyline from "@arcgis/core/geometry/Polyline.js";

// <arcgis-map basemap="osm" ground="world-elevation" center="-74.1,4.65" zoom="9">
//   <arcgis-elevation-profile slot="bottom-right"></arcgis-elevation-profile>
// </arcgis-map>
const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
const profileEl = document.querySelector("arcgis-elevation-profile")!;
profileEl.geometry = new Polyline({ paths: [[[-74.4, 4.65], [-73.8, 4.65]]], spatialReference: { wkid: 4326 } });

const analysisView = await mapEl.whenAnalysisView(profileEl.analysis!);
// whenAnalysisView returns a union; narrow it to the profile's view
if (analysisView.type === "elevation-profile-view-2d") {
  // once analysisView.progress reaches 1:
  console.log(analysisView.statistics?.maxElevation); // measured: 3565 m
}
```

**Notes:**

- Without `ground` on the map, `progress` stays at 0.
- Watch `analysisView.progress` with `reactiveUtils.when` instead of polling.
