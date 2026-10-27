import Map from "@arcgis/core/Map.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import MapView from "@arcgis/core/views/MapView.js";
import Camera from "@arcgis/core/Camera.js";
import Point from "@arcgis/core/geometry/Point.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
async function escena(container: HTMLElement, props: Record<string, unknown> = {}) {
  container.innerHTML = "";
  const d = document.createElement("div"); d.style.cssText = "width:400px;height:300px"; container.appendChild(d);
  const v = new SceneView({ container: d, map: new Map({ basemap: "osm" }), camera: { position: { longitude: -74.08, latitude: 4.6, z: 3000 }, tilt: 60 }, ...props });
  await v.when();
  return v;
}

export async function run(container: HTMLElement) {
  return [
    await intento("Valores por defecto del environment", async () => {
      const v = await escena(container);
      const e = v.environment, l = e.lighting;
      const r = `lighting=${l.type} · date=${l.type === "sun" ? l.date.toISOString() : "-"} · directShadowsEnabled=${l.directShadowsEnabled} · cameraTrackingEnabled=${l.type === "sun" ? l.cameraTrackingEnabled : "-"} · weather=${e.weather.type} · atmosphereEnabled=${e.atmosphereEnabled} · starsEnabled=${e.starsEnabled} · qualityProfile=${v.qualityProfile}`;
      v.destroy();
      return r;
    }),
    await intento("Pitfall 2: environment en una MapView", async () => {
      container.innerHTML = "";
      const d = document.createElement("div"); d.style.cssText = "width:300px;height:200px"; container.appendChild(d);
      const v = new MapView({ container: d, map: new Map({ basemap: "osm" }), center: [-74.08, 4.6], zoom: 10, environment: { lighting: { type: "sun" } } } as never);
      await v.when();
      const env = (v as unknown as { environment?: { declaredClass?: string; lighting?: { type?: string } } }).environment;
      const r = `no lanzó · view.environment.declaredClass=${env?.declaredClass} · lighting=${env?.lighting?.type} · ¿"environment" en MapView.prototype?=${"environment" in MapView.prototype}`;
      v.destroy();
      return r;
    }),
    await intento("Pitfall ext. 1: new Date(\"2026-06-21\") ¿medianoche local o UTC?", async () => {
      const v = await escena(container, { environment: { lighting: { type: "sun", date: new Date("2026-06-21"), cameraTrackingEnabled: false } } });
      const l = v.environment.lighting;
      const r = `date guardada=${l.type === "sun" ? l.date.toISOString() : "-"} · new Date("2026-06-21T12:00") (sin zona)=${new Date("2026-06-21T12:00").toISOString()}`;
      v.destroy();
      return r;
    }),
    await intento("cameraTrackingEnabled: la fecha cambia al mover la cámara", async () => {
      const ver = async (tracking: boolean) => {
        const v = await escena(container, { environment: { lighting: { type: "sun", date: new Date(Date.UTC(2026, 5, 21, 17)), cameraTrackingEnabled: tracking } } });
        await v.goTo(new Camera({ position: new Point({ longitude: 139.7, latitude: 35.7, z: 3000 }), tilt: 60 }), { animate: false });
        await tick(500);
        const l = v.environment.lighting;
        const r = l.type === "sun" ? l.date.toISOString() : "-";
        v.destroy();
        return r;
      };
      return `fecha 2026-06-21T17:00Z, cámara de Bogotá a Tokio · tracking true → ${await ver(true)} · tracking false → ${await ver(false)}`;
    }),
    await intento("weather: lluvia en global bajo, global alto y escena local", async () => {
      const lluvia = { weather: { type: "rainy", cloudCover: 0.8, precipitation: 0.6 } };
      const v = await escena(container, { environment: lluvia });
      const bajo = `${v.environment.weather.type}/disponible=${v.environment.weatherAvailable}`;
      await v.goTo(new Camera({ position: new Point({ longitude: -74.08, latitude: 4.6, z: 3_000_000 }), tilt: 0 }), { animate: false }); await tick(800);
      const alto = `${v.environment.weatherAvailable}`;
      v.destroy();
      const loc = await escena(container, { viewingMode: "local", environment: lluvia });
      const local = `${loc.environment.weather.type}/disponible=${loc.environment.weatherAvailable}`;
      loc.destroy();
      return `global a 3 km: ${bajo} · global a 3000 km: disponible=${alto} · local: ${local}`;
    }),
    await intento("weather con parámetros fuera de rango y nieve", async () => {
      const v = await escena(container, { environment: { weather: { type: "snowy", precipitation: 3, snowCover: "enabled" } } });
      const w = v.environment.weather as unknown as { type: string; precipitation: number; snowCover: string; cloudCover: number };
      const r = `type=${w.type} · precipitation pedida 3 → ${w.precipitation} · cloudCover=${w.cloudCover} · snowCover=${w.snowCover}`;
      v.destroy();
      return r;
    }),
    await intento("Pitfall 3: qualityProfile después de crear la vista", async () => {
      const v = await escena(container);
      const antes = v.qualityProfile;
      let error = "";
      try { v.qualityProfile = "low"; } catch (e) { error = String(e); }
      await tick(200);
      const r = `antes=${antes} · tras asignar "low"=${v.qualityProfile}${error ? " · error=" + error : ""}`;
      v.destroy();
      const c = await escena(container, { qualityProfile: "low" });
      const r2 = `${r} · en el constructor="low" → ${c.qualityProfile}`;
      c.destroy();
      return r2;
    }),
    await intento("Cambiar lighting a virtual en caliente", async () => {
      const v = await escena(container);
      v.environment.lighting = { type: "virtual", directShadowsEnabled: true } as never;
      const l = v.environment.lighting;
      const r = `type=${l.type} · directShadowsEnabled=${l.directShadowsEnabled} · declaredClass=${(l as unknown as { declaredClass: string }).declaredClass}`;
      v.destroy();
      return r;
    }),
    await intento("Componentes arcgis-daylight y arcgis-weather", async () => {
      await import("@arcgis/map-components/components/arcgis-daylight");
      await import("@arcgis/map-components/components/arcgis-weather");
      return `daylight=${!!customElements.get("arcgis-daylight")} · weather=${!!customElements.get("arcgis-weather")}`;
    }),
  ];
}
