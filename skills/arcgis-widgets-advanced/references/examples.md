# Examples: Advanced Widgets

## Example 1: Bookmarks in a map

**Use case:** let users jump between saved viewpoints.

```html
<arcgis-map item-id="<webmap-with-bookmarks>">
  <arcgis-bookmarks position="top-right"></arcgis-bookmarks>
</arcgis-map>
```

**Notes:**

- A webmap can supply saved bookmarks automatically.
- Allow runtime additions via the component's editing options.

---

## Example 2: Print/export

**Use case:** export the current map as a PDF.

```html
<arcgis-map id="myMap">
  <arcgis-print reference-element="#myMap" position="top-left"></arcgis-print>
</arcgis-map>
```

**Notes:**

- Requires a print service (ArcGIS Online default works with an API key).
- Configure allowed layouts/formats as needed.

---

## Example 3: Daylight on a 3D scene

**Use case:** simulate sun position and shadows.

```html
<arcgis-scene id="scene" ground="world-elevation">
  <arcgis-daylight reference-element="#scene" position="top-right"></arcgis-daylight>
</arcgis-scene>
```

**Notes:**

- Use a `SceneView` (`<arcgis-scene>`); daylight is 3D-only.
- Combine with shadows for realistic lighting.
