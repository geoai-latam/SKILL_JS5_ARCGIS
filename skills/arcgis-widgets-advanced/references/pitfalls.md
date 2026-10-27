# Extended Pitfalls: Advanced Widgets

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis. Measured on SDK 5.1.27 with
> `tests/runtime/casos/arcgis-widgets-advanced.ts`.

## Pitfall 1: Expecting bookmarks on a plain map

### Anti-pattern

```html
<arcgis-map basemap="osm"><arcgis-bookmarks slot="top-right"></arcgis-bookmarks></arcgis-map>
```

### Correct

```html
<arcgis-map item-id="YOUR_WEBMAP_ID">
  <arcgis-bookmarks slot="top-right" show-add-bookmark-button></arcgis-bookmarks>
</arcgis-map>
```

### Impact

Measured: on a basemap-only map the list had 0 bookmarks and the add button was off, so the panel stays empty and the
user cannot fill it.

### Diagnosis

An empty panel with no button; load a web map with bookmarks or turn on `show-add-bookmark-button`.

---

## Pitfall 2: Daylight in a 2D map

### Anti-pattern

```html
<arcgis-map basemap="osm"><arcgis-daylight slot="top-right"></arcgis-daylight></arcgis-map>
```

### Correct

```html
<arcgis-scene basemap="osm" ground="world-elevation"><arcgis-daylight slot="top-right"></arcgis-daylight></arcgis-scene>
```

### Impact

Measured: in `arcgis-map` the component bound to the 2D view, rendered a 127 px panel, and logged nothing, but there
is no sun lighting in 2D. In `arcgis-scene` it rendered its full 335 px panel with the date.

### Diagnosis

Controls that move but change nothing; use a scene.

---

## Pitfall 3: Importing from the dist folder or the deprecated widget

### Anti-pattern

```typescript
import Print from "@arcgis/core/widgets/Print.js"; // deprecated since 4.33
```

### Correct

```typescript
import "@arcgis/map-components/components/arcgis-print";
```

### Impact

The widget is on its way out (Compass 4.32, Print 4.33, Bookmarks and Daylight 4.34, ElevationProfile 5.0). Paths
under `@arcgis/map-components/dist/components/...` are internal; the package exports `components/<tag>`.

### Diagnosis

Deprecation warnings or unresolved imports; import the component by its public path.
