// snippet-popup-custom.ts — custom HTML content via a content function. Smoke-tested.
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

const template = new PopupTemplate({
  title: "Custom content",
  content: (feature: { graphic: { attributes: Record<string, unknown> } }) => {
    const div = document.createElement("div");
    div.textContent = `Name: ${String(feature.graphic.attributes.NAME)}`;
    return div;
  },
});

export { template };
