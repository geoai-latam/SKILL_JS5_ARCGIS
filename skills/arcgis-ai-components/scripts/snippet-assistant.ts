// snippet-assistant.ts — register the AI Assistant component (BETA). Smoke-tested.
// Import from `components/<tag>`: `dist/components/<tag>` is not in the package's
// "exports", so Vite and Node reject it (tsc alone does not notice).
import "@arcgis/ai-components/components/arcgis-assistant";
import "@arcgis/ai-components/components/arcgis-assistant-navigation-agent";
import "@arcgis/map-components/components/arcgis-map";

// Built-in agents need a web map: on a map without `item-id` the assistant emits
// arcgisError("WebMap portal item is missing.") and submitMessage() rejects.
// <arcgis-map id="myMap" item-id="<webmap-id>"></arcgis-map>
// <arcgis-assistant reference-element="myMap">
//   <arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent>
// </arcgis-assistant>

export {};
