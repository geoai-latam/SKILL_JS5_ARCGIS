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

## Pitfall 3: High quality on weak GPUs

### Anti-pattern

```typescript
view.qualityProfile = "high"; // plus several heavy layers
```

### Correct

```typescript
view.qualityProfile = "medium";
```

### Impact

Frame drops and "context lost" errors on low-end GPUs.

### Diagnosis

WebGL context-lost warnings; reduce quality and concurrent heavy layers.

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
