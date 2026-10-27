import esriConfig from "@arcgis/core/config.js";
import IdentityManager from "@arcgis/core/identity/IdentityManager.js";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo.js";
import PointCloudLayer from "@arcgis/core/layers/PointCloudLayer.js";
import * as locator from "@arcgis/core/rest/locator.js";
import { intento } from "./_util.ts";

const SEGURA = "https://tiles.arcgis.com/tiles/Imiq6naek6ZWdour/arcgis/rest/services/PointCloud_urban/SceneServer";
const GEOCODE = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

export async function run() {
  return [
    await intento("OAuthInfo: flowType por defecto", async () => `flowType=${new OAuthInfo({ appId: "x" }).flowType}`),
    await intento("IdentityManager.checkSignInStatus sin sesión", async () =>
      IdentityManager.checkSignInStatus("https://www.arcgis.com/sharing").then(() => "hay sesión", (e: Error) => `rechaza: ${e.name ?? ""} ${e.message}`)),
    await intento("Geocodificar sin API key", async () => {
      esriConfig.apiKey = null as unknown as string;
      const r = await Promise.race([
        locator.addressToLocations(GEOCODE, { address: { SingleLine: "Bogotá" }, maxLocations: 1 }).then((x) => `responde: ${x.length}`, (e: Error) => `rechaza: ${e.message}`),
        new Promise<string>((ok) => setTimeout(() => ok("sigue esperando a los 8 s"), 8000)),
      ]);
      return `${r} · diálogo del SDK abierto: ${!!document.querySelector(".esri-identity-modal")}`;
    }),
    await intento("Capa segura sin OAuth registrado: ¿falla o abre un diálogo?", async () => {
      const l = new PointCloudLayer({ url: SEGURA });
      const r = await Promise.race([
        l.load().then(() => "cargó", (e: Error) => `rechaza: ${e.message}`),
        new Promise<string>((ok) => setTimeout(() => ok("sigue esperando a los 8 s"), 8000)),
      ]);
      const dialogo = document.querySelector("[class*=identity]");
      const texto = (dialogo?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 90);
      return `${r} · diálogo del SDK: ${dialogo ? `${dialogo.className} «${texto}»` : "no"}`;
    }),
    await intento("Geocodificar con una API key (legacy AAPK) inválida", async () => {
      esriConfig.apiKey = "AAPK0000000000000000000000000000";
      return locator.addressToLocations(GEOCODE, { address: { SingleLine: "Bogotá" }, maxLocations: 1 }).then((r) => `responde: ${r.length}`, (e: Error) => `rechaza: ${e.message} · details=${JSON.stringify((e as any).details?.messages ?? (e as any).details?.httpStatus)}`);
    }),
  ];
}
