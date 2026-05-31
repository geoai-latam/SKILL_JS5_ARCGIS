# Examples: Imagery

## Example 1: NDVI on the fly

**Use case:** vegetation index from multispectral imagery.

```typescript
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
import RasterFunction from "@arcgis/core/layers/support/RasterFunction.js";

const ndvi = new RasterFunction({
  functionName: "NDVI",
  functionArguments: { VisibleBandID: 2, InfraredBandID: 3 },
});
const layer = new ImageryLayer({ url: "https://.../Landsat/ImageServer", rasterFunction: ndvi });
```

**Notes:**

- Use the correct band ids for your sensor.
- ImageryLayer (not tile) supports raster functions.

---

## Example 2: Cached tiles for fast display

**Use case:** a fixed elevation/hillshade tile service.

```typescript
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer.js";

const layer = new ImageryTileLayer({ url: "https://.../Terrain/ImageServer" });
```

**Notes:**

- Fast pans/zooms; processing is fixed.
- No on-the-fly raster functions.

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
