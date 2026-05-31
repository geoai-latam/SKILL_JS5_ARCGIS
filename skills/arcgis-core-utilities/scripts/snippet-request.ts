// snippet-request.ts — esriRequest for arbitrary REST calls. Smoke-tested.
import esriRequest from "@arcgis/core/request.js";

export async function fetchJson(url: string) {
  const response = await esriRequest(url, {
    responseType: "json",
    query: { f: "json" },
  });
  return response.data;
}
