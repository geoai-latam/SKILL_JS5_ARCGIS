// snippet-portal-query.ts — query and page items from a portal. Smoke-tested (SDK 5.1).
import Portal from "@arcgis/core/portal/Portal.js";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams.js";

export async function findWebmaps(max = 300) {
  const portal = new Portal();
  await portal.load();
  const titles: string[] = [];
  let page = await portal.queryItems(new PortalQueryParams({
    query: 'type:"Web Map" AND owner:esri',
    num: 100, // the server caps it at 100
    sortField: "modified",
    sortOrder: "desc", // asc (oldest first) by default
  }));
  titles.push(...page.results.map((item) => item.title ?? ""));
  // nextQueryParams is always present; start === -1 marks the last page
  while (page.nextQueryParams && page.nextQueryParams.start !== -1 && titles.length < max) {
    page = await portal.queryItems(page.nextQueryParams);
    titles.push(...page.results.map((item) => item.title ?? ""));
  }
  return titles;
}
