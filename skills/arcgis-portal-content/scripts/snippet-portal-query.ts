// snippet-portal-query.ts — query items from a portal. Smoke-tested.
import Portal from "@arcgis/core/portal/Portal.js";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams.js";

export async function findWebmaps() {
  const portal = new Portal();
  await portal.load();
  const params = new PortalQueryParams({
    query: 'type:"Web Map" AND owner:esri',
    num: 10,
    sortField: "modified",
  });
  const result = await portal.queryItems(params);
  return result.results.map((item) => item.title);
}
