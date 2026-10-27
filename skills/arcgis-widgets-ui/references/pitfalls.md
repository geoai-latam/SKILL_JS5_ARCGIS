# Extended Pitfalls: Widgets & UI

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis. Measured on SDK 5.1.27 with
> `tests/runtime/casos/arcgis-widgets-ui.ts`.

## Pitfall 1: Forgetting the side-effect import

### Anti-pattern

```html
<arcgis-legend slot="bottom-left"></arcgis-legend> <!-- never imported in JS -->
```

### Correct

```typescript
import "@arcgis/map-components/components/arcgis-legend";
```

### Impact

Measured: `customElements.get(...)` is `undefined` and the element stays at 0 px. A hyphenated tag is a valid unknown
element, so the browser raises nothing.

### Diagnosis

An invisible component; check `customElements.get("arcgis-legend")` in the console.

---

## Pitfall 2: An arcgis/* basemap without an API key

### Anti-pattern

```html
<arcgis-map basemap="arcgis/topographic"><arcgis-search slot="top-right"></arcgis-search></arcgis-map>
```

### Correct

```html
<arcgis-map basemap="osm"><arcgis-search slot="top-right"></arcgis-search></arcgis-map>
<!-- or set esriConfig.apiKey before the map loads to keep arcgis/topographic -->
```

### Impact

Measured in `arcgis-starter-app`: without a key the `arcgis/*` basemap opens a sign-in dialog and the view never gets
ready, so no UI component around it works. Search and the basemap gallery themselves worked without a key here.

### Diagnosis

A sign-in dialog on load; use `osm` while developing or set the key.
