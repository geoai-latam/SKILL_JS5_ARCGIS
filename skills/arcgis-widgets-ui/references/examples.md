# Examples: Widgets & UI

## Example 1: Legend nested in the map

**Use case:** show a legend bound automatically.

```html
<arcgis-map basemap="arcgis/topographic" center="-74.08,4.6" zoom="11">
  <arcgis-legend position="bottom-left"></arcgis-legend>
</arcgis-map>
```

**Notes:**

- Nesting inside `<arcgis-map>` auto-binds the component.
- The legend reflects current layers/renderers.

---

## Example 2: Search bound via reference-element

**Use case:** a search box outside the map element.

```html
<arcgis-map id="myMap" item-id="<webmap-id>"></arcgis-map>
<arcgis-search reference-element="#myMap" position="top-right"></arcgis-search>
```

**Notes:**

- Use `reference-element` when the component is not nested.
- `position` places it relative to the map.

---

## Example 3: Layer list + basemap gallery in an Expand

**Use case:** collapse secondary UI to save space.

```html
<arcgis-map id="myMap">
  <arcgis-expand position="top-left">
    <arcgis-layer-list></arcgis-layer-list>
  </arcgis-expand>
  <arcgis-basemap-gallery position="top-right"></arcgis-basemap-gallery>
</arcgis-map>
```

**Notes:**

- `arcgis-expand` wraps any component to make it collapsible.
- Import each component you use as a side-effect.
