# Extended Pitfalls: 3D Layers

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Using a MapView for 3D content

### Anti-pattern

```typescript
const view = new MapView({ map }); // 2D
```

### Correct

```typescript
import SceneView from "@arcgis/core/views/SceneView.js";
const view = new SceneView({ map });
```

### Impact

3D layers load but never render.

### Diagnosis

Layer `loaded` is true but nothing shows — you are in a 2D view.

---

## Pitfall 2: Missing ground elevation

### Anti-pattern

```typescript
const map = new Map({ basemap: "arcgis/imagery" });
```

### Correct

```typescript
const map = new Map({ basemap: "arcgis/imagery", ground: "world-elevation" });
```

### Impact

Meshes/objects float above or sink below terrain.

### Diagnosis

Visible vertical offset between data and terrain.

---

## Pitfall 3: Hard-coding the quality profile

### Anti-pattern

```typescript
view.qualityProfile = "high"; // fixed for every device, plus several heavy layers
```

### Correct

```typescript
// Do not set it: the SceneView evaluates it per device when it loads.
// If users need control, offer it as a setting:
qualitySelect.onchange = () => (view.qualityProfile = qualitySelect.value as "low" | "medium" | "high");
```

### Impact

A fixed profile is wrong for some GPU: too heavy on weak ones (frame drops, "context lost"), too
coarse on strong ones. The SDK's own guidance is to leave it automatic.

### Diagnosis

WebGL context-lost warnings; first remove the fixed profile, then defer heavy layers.

---

## Pitfall 4: Expecting 2D-style queries on mesh/point clouds

### Anti-pattern

```typescript
await integratedMesh.queryFeatures(); // not a feature layer
```

### Correct

```typescript
// Use hitTest on the SceneView to interrogate mesh/point-cloud content.
const result = await view.hitTest(screenPoint);
```

### Impact

No feature query API on mesh/point-cloud layers.

### Diagnosis

Method missing/throws; use `view.hitTest` instead.

---

## Pitfall 5: Loading everything at startup

### Anti-pattern

```typescript
map.addMany([scene, mesh, pointCloud, gaussianSplat]); // on first paint
```

### Correct

```typescript
map.add(scene);
button.onclick = () => map.add(gaussianSplat); // load heavy data on demand
```

### Impact

Slow first render and memory pressure.

### Diagnosis

Long initial load; defer heavy layers behind user intent.

---

## Pitfall 6: A splat layer that "loads" but shows nothing

### Anti-pattern

```typescript
const splat = new GaussianSplatLayer({ url: "https://example.com/site.ply" });
await splat.load(); // resolves: looks fine
```

### Correct

```typescript
const splat = new GaussianSplatLayer({ url: ".../3DTilesServer/tileset.json" });
await splat.load();
if (splat.fullExtent && splat.fullExtent.width >= 360) console.warn("splat source not read");
```

### Impact

Measured with SDK 5.1.27: a `.ply` (or unreachable) URL resolves `load()` with `loadError = null`
and a whole-world extent, so nothing errors and nothing draws. A 3D Tiles mesh given to
`IntegratedMeshLayer` instead of `IntegratedMesh3DTilesLayer` does reject (404 on `?f=json`).

### Diagnosis

Console shows CORS or 404 for the asset; `fullExtent` spans -180…180.
