// snippet-popup-template.ts — fields-based PopupTemplate. Smoke-tested (SDK 5.1).
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

const template = new PopupTemplate({
  title: "{NAME}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        { fieldName: "POP", label: "Population", format: { digitSeparator: true, places: 0 } }, // none by default
        { fieldName: "AREA", label: "Area (km²)" },
      ],
    },
  ],
});

const layer = new FeatureLayer({ url: "https://.../FeatureServer/0", popupTemplate: template });

export { layer, template };
