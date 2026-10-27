# Extended Pitfalls: Core Maps

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Zero-height container

### Anti-pattern

```html
<arcgis-map basemap="arcgis/topographic"></arcgis-map>
<!-- no CSS height -->
```

### Correct

```html
<style>html, body, arcgis-map { margin: 0; height: 100%; }</style>
<arcgis-map basemap="arcgis/topographic"></arcgis-map>
```

### Impact

The map collapses to 0 px and appears blank. Measured with 5.1.27: the view never becomes ready
(`view.height` is 0, `when()` still pending after 10 s), so code awaiting it hangs too.

### Diagnosis

Inspect the element in dev tools — height is 0. Add a height rule.

---

## Pitfall 2: Swapped center coordinates

### Anti-pattern

```typescript
const view = new MapView({ map, center: [4.6, -74.08] }); // lat, lon — wrong
```

### Correct

```typescript
const view = new MapView({ map, center: [-74.08, 4.6] }); // lon, lat
```

### Impact

The map centers in the wrong place (often the ocean).

### Diagnosis

Measured: `[4.6, -74.08]` centers at latitude -74 (Antarctica). Off the coast of Africa means `[0, 0]`.

---

## Pitfall 3: Destroying a view without cleanup (SPA route changes)

### Anti-pattern

```typescript
// Re-creating a MapView on every route change without destroying the old one.
```

### Correct

```typescript
view.destroy(); // call before removing the container / leaving the route
```

### Impact

Memory leaks and WebGL context exhaustion ("Too many active WebGL contexts").

### Diagnosis

Watch the browser console for WebGL context warnings after several navigations.

---

## Pitfall 4: Setting `map` after the view renders without awaiting load

### Anti-pattern

```typescript
view.map = new Map({ basemap: "arcgis/imagery" });
console.log(view.map.basemap.baseLayers.length); // may be 0, not loaded yet
```

### Correct

```typescript
view.map = new Map({ basemap: "arcgis/imagery" });
await view.map.basemap.load();
```

### Impact

Reading basemap sub-properties returns empty until the resource loads.

### Diagnosis

Properties populate after `await ...load()`; before that they are empty/partial.

---

## Pitfall 5: Mixing 4.x `esri/` AMD paths with 5.0 ESM

### Anti-pattern

```javascript
require(["esri/Map", "esri/views/MapView"], (Map, MapView) => { /* 4.x */ });
```

### Correct

```typescript
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
```

### Impact

`require is not defined` or unresolved modules under the 5.x CDN/bundler.

### Diagnosis

Any `require([...])` or `esri/` path is legacy 4.x — migrate to `@arcgis/core/*.js` ESM.
