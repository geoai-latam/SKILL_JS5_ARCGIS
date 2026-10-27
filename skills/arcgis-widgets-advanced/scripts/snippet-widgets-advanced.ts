// snippet-widgets-advanced.ts — advanced UI components and the elevation profile's numbers.
// Runtime-checked on SDK 5.1 (tests/runtime/casos/arcgis-widgets-advanced.ts).
// Place nested components with slot="top-right", never position="top-right".
import "@arcgis/map-components/components/arcgis-print";
import "@arcgis/map-components/components/arcgis-bookmarks";
import "@arcgis/map-components/components/arcgis-compass";
import "@arcgis/map-components/components/arcgis-daylight";
import "@arcgis/map-components/components/arcgis-elevation-profile";

// The map needs a ground (e.g. ground="world-elevation"), or the profile stays at progress 0.
export async function maxElevation(mapEl: HTMLArcgisMapElement, profileEl: HTMLArcgisElevationProfileElement) {
  const analysisView = await mapEl.whenAnalysisView(profileEl.analysis!);
  // whenAnalysisView returns a union of analysis views; narrow it before reading statistics.
  if (analysisView.type !== "elevation-profile-view-2d") return null;
  return analysisView.statistics?.maxElevation ?? null; // results live on the analysis view in 5.x
}
