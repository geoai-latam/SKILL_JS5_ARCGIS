# Extended Pitfalls: Performance

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured with 5.1.27 in `tests/runtime/casos/arcgis-performance.ts` and `tests/bundle/medir.mjs`.

## Pitfall 1: Root or barrel imports

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

`@arcgis/core` has no root or folder index modules: these imports fail with TS2307 / "failed to resolve" at build
time. They do not bloat the bundle; they break it.

### Diagnosis

"Cannot find module '@arcgis/core/layers'"; import each class from its `.js` path.

---

## Pitfall 2: Expecting import() to fix a slow first load

### Anti-pattern

```typescript
const { default: CSVLayer } = await import("@arcgis/core/layers/CSVLayer.js"); // "this will shrink the bundle"
```

### Correct

```typescript
// Use import() for optional features, but find first-load time in what the page draws and fetches.
```

### Impact

Measured: moving CSVLayer and KMLLayer behind `import()` saved 24 KB (6 KB gzip) from a 1494 KB initial chunk; the SDK
already loads most of its code in ~748 lazy chunks.

### Diagnosis

A bundle report where the dynamic chunk is tiny compared to the entry chunk.

---

## Pitfall 3: Loading every component up front

### Anti-pattern

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-print";
import "@arcgis/map-components/components/arcgis-sketch"; // unused on this page
```

### Correct

```typescript
import "@arcgis/map-components/components/arcgis-map"; // only what this page renders
```

### Impact

Unused components add code (not measured here; the SDK's own lazy loading reduces but does not remove it).

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

Measured: with `minScale: 50000` at country scale the layer view was `suspended` with `visibleAtCurrentScale: false`,
so it fetched and drew nothing. Without it, every feature is requested and drawn at every zoom.

### Diagnosis

Frame drops and requests at low zoom for layers that only matter up close.

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

Measured: 3 visibility toggles made 0 requests to the service; 3 remove-and-recreate cycles made 24.

### Diagnosis

Network tab shows the same service re-fetched on each toggle.
