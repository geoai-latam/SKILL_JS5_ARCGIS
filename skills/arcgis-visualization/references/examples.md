# Examples: Visualization

## Example 1: UniqueValueRenderer (categories)

**Use case:** color parcels by land-use type.

```typescript
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";

layer.renderer = new UniqueValueRenderer({
  field: "TYPE",
  uniqueValueInfos: [
    { value: "residential", symbol: new SimpleFillSymbol({ color: "blue" }) },
    { value: "commercial", symbol: new SimpleFillSymbol({ color: "red" }) },
  ],
  defaultSymbol: new SimpleFillSymbol({ color: "gray" }),
});
```

**Notes:**

- `defaultSymbol` styles values not in the list.
- Categories produce a clean, legible legend.

---

## Example 2: ClassBreaksRenderer (numeric ranges)

**Use case:** size cities by population.

```typescript
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";

layer.renderer = new ClassBreaksRenderer({
  field: "POP",
  classBreakInfos: [
    { minValue: 0, maxValue: 1000, symbol: new SimpleMarkerSymbol({ color: "yellow", size: 6 }) },
    { minValue: 1000, maxValue: 1000000, symbol: new SimpleMarkerSymbol({ color: "red", size: 16 }) },
  ],
});
```

**Notes:**

- Keep `minValue`/`maxValue` contiguous to avoid gaps.
- Add a `defaultSymbol` for out-of-range values.

---

## Example 3: Visual variables (continuous)

**Use case:** smoothly vary color and size by a numeric field.

```typescript
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import ColorVariable from "@arcgis/core/renderers/visualVariables/ColorVariable.js";

layer.renderer = new SimpleRenderer({
  symbol: new SimpleMarkerSymbol({ color: "gray" }),
  visualVariables: [
    new ColorVariable({ field: "POP", stops: [
      { value: 0, color: "white" },
      { value: 100000, color: "red" },
    ] }),
  ],
});
```

**Notes:**

- Visual variables interpolate between stops.
- Combine color + size for two-variable maps.
