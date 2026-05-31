# API Reference: 3D Layers

## Table of Contents

- [SceneLayer](#scenelayer)
- [IntegratedMeshLayer / PointCloudLayer](#integratedmeshlayer--pointcloudlayer)
- [GaussianSplatLayer](#gaussiansplatlayer)

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
| `url` | `string` | Gaussian-splat asset URL |
| `opacity` | `number` | Layer opacity |

Photorealistic capture rendering; GPU-intensive. Render in a `SceneView`.
