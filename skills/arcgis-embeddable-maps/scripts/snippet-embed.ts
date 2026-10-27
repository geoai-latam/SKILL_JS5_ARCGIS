// snippet-embed.ts: Embeddable Maps are CDN-only (no npm package) and use their OWN script,
// not the unified SDK one (js.arcgis.com/5.1/ does not register arcgis-embedded-map; measured).

// In index.html:
//   <script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
//   <arcgis-embedded-map item-id="<webmap-item-id>" legend-enabled></arcgis-embedded-map>

// In code you interact with it as a DOM custom element:
const embed = document.querySelector("arcgis-embedded-map");
embed?.setAttribute("theme", "dark");
embed?.setAttribute("legend-enabled", ""); // tools are opt-in booleans; there are no hide-* attributes

export {};
