# API Reference: 3D Layers

## Table of Contents

- [SceneLayer](#scenelayer)
- [IntegratedMeshLayer / PointCloudLayer](#integratedmeshlayer--pointcloudlayer)
- [GaussianSplatLayer](#gaussiansplatlayer)
- [IntegratedMesh3DTilesLayer](#integratedmesh3dtileslayer)

---

## SceneLayer

`@arcgis/core/layers/SceneLayer.js` — i3s 3D objects / buildings.

| Property | Type | Description |
|---|---|---|
| `url` | `string` | i3s `SceneServer` URL |
| `popupEnabled` | `boolean` | Allow popups on 3D objects |
| `renderer` | `Renderer` | Symbolize 3D objects |
| `definitionExpression` | `string` | Filter the 3D features |

---

## IntegratedMeshLayer / PointCloudLayer

| Class | Module | Source |
|---|---|---|
| `IntegratedMeshLayer` | `layers/IntegratedMeshLayer.js` | Photogrammetry mesh (i3s) |
| `PointCloudLayer` | `layers/PointCloudLayer.js` | LiDAR point cloud (i3s) |

Both stream level-of-detail nodes from a `SceneServer`; `PointCloudLayer` supports point-cloud
renderers (e.g. by class or elevation).

---

## GaussianSplatLayer

`@arcgis/core/layers/GaussianSplatLayer.js` (new in 5.0)

| Property | Type | Description |
|---|---|---|
| `url` | `string` | Published `.../3DTilesServer/tileset.json` (not a `.ply`/`.splat` file) |
| `portalItem` | `PortalItem` | Alternative to `url` |
| `elevationInfo` | `ElevationInfo` | Only `absolute-height` affects splats |

`opacity` exists (inherited) but is not supported in a SceneView. Global or local scenes; the
`ESRI_CRS` extension lets a projected splat show in a WGS84 global scene.

---

## IntegratedMesh3DTilesLayer

`@arcgis/core/layers/IntegratedMesh3DTilesLayer.js` (4.29) — mesh delivered as OGC 3D Tiles.

| Property | Type | Description |
|---|---|---|
| `url` | `string` | `.../3DTilesServer/tileset.json` |
| `elevationInfo` | `ElevationInfo` | Always renders in front of the ground: negative offsets do not sink it |

Since 5.1 it loads in any spatial reference through the `Esri_crs` extension.
