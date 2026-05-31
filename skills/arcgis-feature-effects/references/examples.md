# Examples: Feature Effects

## Example 1: Layer-wide bloom

**Use case:** make a glowing nightlife layer pop.

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });
layer.effect = "bloom(1.8, 0.6px, 0.1)";
```

**Notes:**

- Chain effects with spaces, e.g. `"bloom(...) brightness(1.1)"`.
- Use units (`px`, `%`) on every value.

---

## Example 2: Emphasize a subset with featureEffect

**Use case:** highlight large cities, dim the rest.

```typescript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect.js";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter.js";

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });
layer.featureEffect = new FeatureEffect({
  filter: new FeatureFilter({ where: "POP > 1000000" }),
  includedEffect: "bloom(2, 1px, 0)",
  excludedEffect: "grayscale(100%) opacity(40%)",
});
```

**Notes:**

- Matched features glow; the rest fade.
- Swap the `where` at runtime to refocus.

---

## Example 3: Spatial focus with a geometry filter

**Use case:** emphasize features inside a drawn area.

```typescript
import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect.js";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter.js";

layer.featureEffect = new FeatureEffect({
  filter: new FeatureFilter({ geometry: areaPolygon, spatialRelationship: "intersects" }),
  excludedEffect: "opacity(20%)",
});
```

**Notes:**

- Drive the geometry from a Sketch interaction.
- `featureEffect` is visual only — combine with queries to act on the subset.
