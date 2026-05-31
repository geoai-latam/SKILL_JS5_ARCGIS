// snippet-feature-effect.ts — emphasize features matching a filter with featureEffect.
// Smoke-tested.
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect.js";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter.js";

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });

layer.featureEffect = new FeatureEffect({
  filter: new FeatureFilter({ where: "POP > 100000" }),
  includedEffect: "bloom(2, 1px, 0)",
  excludedEffect: "grayscale(100%) opacity(40%)",
});

export { layer };
