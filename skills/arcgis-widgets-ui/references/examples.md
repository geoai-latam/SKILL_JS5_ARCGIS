# Examples: Widgets & UI

## Example 1: Legend nested in the map

**Use case:** show a legend bound automatically.

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="11">
  <arcgis-legend slot="bottom-left"></arcgis-legend>
</arcgis-map>
```

**Notes:**

- Nesting inside `<arcgis-map>` binds the component.
- The legend follows the current layers and renderers. `arcgis/*` basemaps need an API key; `osm` does not.

---

## Example 2: Search bound via reference-element

**Use case:** a search box outside the map element.

```html
<arcgis-search reference-element="#myMap"></arcgis-search>
<arcgis-map id="myMap" basemap="osm" center="-74.08,4.6" zoom="6"></arcgis-map>
```

**Notes:**

- Use `reference-element` when the component is not nested, with the map's exact id.
- Outside the map it sits where it is in the page; `slot` only applies inside the map.

---

## Example 3: Layer list + basemap gallery in Expands

**Use case:** collapse secondary UI to save space.

```html
<arcgis-map basemap="osm" center="-74.08,4.6" zoom="6">
  <arcgis-expand slot="top-left" group="ui">
    <arcgis-layer-list></arcgis-layer-list>
  </arcgis-expand>
  <arcgis-expand slot="top-left" group="ui">
    <arcgis-basemap-gallery></arcgis-basemap-gallery>
  </arcgis-expand>
</arcgis-map>
```

**Notes:**

- A component inside `arcgis-expand` still binds to the map.
- Expands in the same `group` close each other; the two stack in the `top-left` slot.
