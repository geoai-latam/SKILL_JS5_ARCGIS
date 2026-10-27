# Examples: 3D Layers

## Example 1: SceneLayer of buildings

**Use case:** load textured 3D buildings into a scene.

```typescript
import SceneLayer from "@arcgis/core/layers/SceneLayer.js";

const buildings = new SceneLayer({
  url: "https://tiles.arcgis.com/tiles/example/arcgis/rest/services/Buildings/SceneServer",
  popupEnabled: true,
});
scene.add(buildings); // scene is a Map bound to a SceneView
```

**Notes:**

- Render in a `SceneView`; nothing shows in 2D.
- `popupEnabled` lets users click objects for attributes.

---

## Example 2: IntegratedMeshLayer on terrain

**Use case:** drape a city photogrammetry mesh over elevation.

```typescript
import Map from "@arcgis/core/Map.js";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer.js";

const map = new Map({ basemap: "arcgis/imagery", ground: "world-elevation" });
map.add(new IntegratedMeshLayer({
  url: "https://tiles.arcgis.com/tiles/example/arcgis/rest/services/CityMesh/SceneServer",
}));
```

**Notes:**

- `ground: "world-elevation"` keeps the mesh aligned to terrain.
- Meshes stream progressively as the camera moves.

---

## Example 3: GaussianSplatLayer (new in 5.0)

**Use case:** photorealistic capture of a site.

```typescript
import GaussianSplatLayer from "@arcgis/core/layers/GaussianSplatLayer.js";

const splat = new GaussianSplatLayer({
  // Public Esri sample. A raw .ply/.splat URL does not work: publish it first.
  url: "https://tiles.arcgis.com/tiles/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Portcoast_industrial/3DTilesServer/tileset.json",
});
scene.add(splat);
await splat.load();
console.log(splat.fullExtent?.width); // the whole world here means the source never loaded
```

**Notes:**

- Load on demand rather than at app startup; leave `view.qualityProfile` to the SDK.
- Checked against SDK 5.1.27: this URL loads (`Portcoast industrial`, extent in WGS84).
