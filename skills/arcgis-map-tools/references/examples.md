# Examples: Map Tools

## Example 1: Sketch toolbar

**Use case:** let users draw and edit shapes.

```html
<arcgis-map id="myMap">
  <arcgis-sketch position="top-right"></arcgis-sketch>
</arcgis-map>
```

**Notes:**

- Nesting binds the sketch to the map.
- Read drawn geometry from the create/update events.

---

## Example 2: 2D distance measurement

**Use case:** measure distance on a 2D map.

```html
<arcgis-map id="myMap">
  <arcgis-distance-measurement-2d position="top-left"></arcgis-distance-measurement-2d>
</arcgis-map>
```

**Notes:**

- Use 2d variants on a MapView.
- Switch to `arcgis-measurement` to toggle distance/area.

---

## Example 3: Snapping with sketch

**Use case:** snap to existing features while drawing.

```html
<arcgis-map id="myMap">
  <arcgis-sketch></arcgis-sketch>
  <arcgis-snapping-controls></arcgis-snapping-controls>
</arcgis-map>
```

**Notes:**

- Snapping controls wire to the active sketch.
- Configure snapping sources for feature targets.
