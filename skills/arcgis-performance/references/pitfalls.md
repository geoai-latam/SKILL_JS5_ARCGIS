# Extended Pitfalls: Performance

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Barrel imports defeating tree-shaking

### Anti-pattern

```typescript
import { FeatureLayer, GraphicsLayer } from "@arcgis/core/layers";
```

### Correct

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
```

### Impact

Bundlers may pull the whole layers barrel, inflating the bundle.

### Diagnosis

Inspect the build's chunk report — unexpected modules indicate a barrel import.

---

## Pitfall 2: Watching high-frequency properties without debounce

### Anti-pattern

```typescript
reactiveUtils.watch(() => view.center, () => expensiveRecompute());
```

### Correct

```typescript
reactiveUtils.watch(() => view.stationary, (s) => { if (s) expensiveRecompute(); });
```

### Impact

`center` fires continuously while panning, starving the main thread.

### Diagnosis

Profiler shows the callback firing dozens of times per pan.

---

## Pitfall 3: Loading every component up front

### Anti-pattern

```typescript
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-print";
import "@arcgis/map-components/dist/components/arcgis-sketch"; // unused on this page
```

### Correct

```typescript
import "@arcgis/map-components/dist/components/arcgis-map"; // only what this page renders
```

### Impact

Unused components bloat the bundle.

### Diagnosis

Search the page for the element tags; remove imports for tags you don't use.

---

## Pitfall 4: Forgetting maxScale/minScale on detail layers

### Anti-pattern

```typescript
const parcels = new FeatureLayer({ url }); // draws at every zoom, even country level
```

### Correct

```typescript
const parcels = new FeatureLayer({ url, minScale: 50000 }); // only when zoomed in
```

### Impact

Heavy detail layers draw when invisible-to-useful, wasting cycles.

### Diagnosis

Frame drops at low zoom for layers that only matter up close.

---

## Pitfall 5: Recreating layers instead of toggling visibility

### Anti-pattern

```typescript
map.removeAll();
map.add(new FeatureLayer({ url })); // re-fetch + re-init on every toggle
```

### Correct

```typescript
layer.visible = !layer.visible; // keep the instance, just toggle
```

### Impact

Repeated network fetches and re-initialization stutter the UI.

### Diagnosis

Network tab shows the same service re-fetched on each toggle.
