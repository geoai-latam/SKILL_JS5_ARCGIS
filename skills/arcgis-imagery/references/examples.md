# Examples: Imagery

## Example 1: NDVI on the fly

**Use case:** vegetation index from multispectral imagery.

```typescript
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
import * as rasterFunctionUtils from "@arcgis/core/layers/support/rasterFunctionUtils.js";

const ndvi = rasterFunctionUtils.bandArithmeticNDVI({ redBandId: 2, nirBandId: 3 }); // Blue, Green, Red, NIR
const layer = new ImageryLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Toronto/ImageServer",
  rasterFunction: rasterFunctionUtils.colormap({ colorRampName: "ndvi3", raster: ndvi }),
});
```

**Notes:**

- Band ids are 0-based: read the order from `layer.serviceRasterInfo` first.
- Measured: the NDVI alone returns 0.0148 over a park and -0.263 over water.

---

## Example 2: Cached tiles for fast display

**Use case:** a fixed elevation/hillshade tile service.

```typescript
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer.js";

const layer = new ImageryTileLayer({ url: "https://.../Terrain/ImageServer" });
```

**Notes:**

- Rendering and raster functions run in the browser.
- `rasterFunction` works here too (client side).

---

## Example 3: Mosaic rule by date

**Use case:** show the most recent image where they overlap.

```typescript
const layer = new ImageryLayer({
  url: "https://.../ImageServer",
  mosaicRule: { method: "esriMosaicAttribute", sortField: "AcquisitionDate", ascending: false },
});
```

**Notes:**

- Mosaic rules order overlapping rasters.
- Combine with `definitionExpression` to filter the mosaic.
