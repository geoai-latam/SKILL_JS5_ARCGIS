// snippet-layer-effect.ts — a CSS-like layer effect applied to the whole layer. Smoke-tested.
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0" });

// Effects are CSS-like filter strings (bloom, blur, drop-shadow, brightness, ...).
layer.effect = "bloom(1.5, 0.5px, 0.1)";

export { layer };
