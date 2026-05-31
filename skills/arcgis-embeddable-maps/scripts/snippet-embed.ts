// snippet-embed.ts — Embeddable Maps are CDN-only (no npm package). You load the unified
// 5.0 script and place the custom element; there is nothing to import via npm.
// This snippet documents the element wiring in a type-safe, import-free way. Smoke-tested.

// In index.html:
//   <script type="module" src="https://js.arcgis.com/5.0/"></script>
//   <arcgis-embedded-map item-id="<webmap-item-id>"></arcgis-embedded-map>

// In code you interact with it as a DOM custom element:
const embed = document.querySelector("arcgis-embedded-map");
embed?.setAttribute("theme", "dark");

export {};
