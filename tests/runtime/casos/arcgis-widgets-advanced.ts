import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-print";
import "@arcgis/map-components/components/arcgis-bookmarks";
import "@arcgis/map-components/components/arcgis-compass";
import "@arcgis/map-components/components/arcgis-daylight";
import "@arcgis/map-components/components/arcgis-elevation-profile";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import { intento } from "./_util.ts";

const tick = (ms = 50) => new Promise((ok) => setTimeout(ok, ms));
type El = HTMLElement & { componentOnReady(): Promise<unknown> };
const caja = (el: Element, ref: Element) => { const a = el.getBoundingClientRect(), b = ref.getBoundingClientRect(); return `x=${Math.round(a.left - b.left)} y=${Math.round(a.top - b.top)} ${Math.round(a.width)}×${Math.round(a.height)}`; };

async function perfil(container: HTMLElement, ground: string) {
  const linea = new Polyline({ paths: [[[-74.4, 4.65], [-73.8, 4.65]]], spatialReference: { wkid: 4326 } });
  container.innerHTML = `<arcgis-map basemap="osm" ${ground} center="-74.1,4.65" zoom="9" style="display:block;width:600px;height:400px"><arcgis-elevation-profile slot="bottom-right"></arcgis-elevation-profile></arcgis-map>`;
  const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
  await m.viewOnReady();
  const e = container.querySelector("arcgis-elevation-profile") as HTMLArcgisElevationProfileElement;
  await e.componentOnReady();
  e.geometry = linea;
  const t0 = performance.now();
  while ((e.progress ?? 0) < 1 && performance.now() - t0 < 15000) await tick(300);
  const vieja = e.profiles.toArray().map((p) => `${p.type}.statistics=${String((p as unknown as { statistics?: unknown }).statistics)}`);
  const av = await m.whenAnalysisView(e.analysis!) as unknown as { progress: number; error?: unknown; statistics?: { maxElevation?: number; minElevation?: number }; results: Array<{ profile: { type: string }; available: boolean; statistics?: { maxElevation?: number } }> };
  const t1 = performance.now();
  while ((av.progress ?? 0) < 1 && performance.now() - t1 < 12000) await tick(300);
  const rs = av.results.map((r) => `${r.profile.type}: disponible=${r.available}, máx=${Math.round(r.statistics?.maxElevation ?? NaN)} m`);
  return `componente progress=${e.progress} · línea (forma 4.x): ${vieja.join(", ")} · analysisView: progress=${av.progress}, error=${String(av.error ?? "ninguno")}, ${rs.join(", ")}`;
}

export async function run(container: HTMLElement) {
  return [
    await intento("position=\"top-right\" (lo que usaba la skill) frente a slot=\"top-right\"", async () => {
      container.innerHTML = `<arcgis-map basemap="osm" center="-74,4.6" zoom="5" style="display:block;width:600px;height:400px"><arcgis-compass position="top-right" id="a"></arcgis-compass><arcgis-compass slot="top-right" id="b"></arcgis-compass></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady(); await tick(1500);
      const a = container.querySelector("#a") as El, b = container.querySelector("#b") as El;
      return `position: slot asignado=${a.assignedSlot?.name || "(por defecto)"}, caja ${caja(a, m)} · slot: slot asignado=${b.assignedSlot?.name}, caja ${caja(b, m)}`;
    }),
    await intento("arcgis-compass en un mapa 2D rotado", async () => {
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      const c = container.querySelector("#b") as HTMLArcgisCompassElement;
      const antes = c.orientation?.z;
      m.view.rotation = 45; await tick(800);
      return `orientation.z sin rotar=${antes} · con view.rotation=45: ${c.orientation?.z} · state=${c.state}`;
    }),
    await intento("arcgis-print sin printServiceUrl ni API key", async () => {
      container.innerHTML = `<arcgis-map basemap="osm" center="-74,4.6" zoom="5" style="display:block;width:600px;height:400px"><arcgis-print slot="top-right"></arcgis-print></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      const p = container.querySelector("arcgis-print") as HTMLArcgisPrintElement;
      await p.componentOnReady();
      const t0 = performance.now();
      while (p.state !== "ready" && p.state !== "error" && performance.now() - t0 < 20000) await tick(250);
      const dialogos = document.querySelectorAll("calcite-dialog").length;
      return `printServiceUrl=${p.printServiceUrl} · state=${p.state} a los ${Math.round((performance.now() - t0) / 1000)} s · layouts=${JSON.stringify(p.allowedLayouts)} · diálogos de sesión=${dialogos}`;
    }),
    await intento("arcgis-bookmarks en un mapa sin web map", async () => {
      container.innerHTML = `<arcgis-map basemap="osm" center="-74,4.6" zoom="5" style="display:block;width:600px;height:400px"><arcgis-bookmarks slot="top-right"></arcgis-bookmarks></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      const b = container.querySelector("arcgis-bookmarks") as HTMLArcgisBookmarksElement;
      await b.componentOnReady(); await tick(1000);
      return `bookmarks=${b.bookmarks?.length} · showAddBookmarkButton=${b.showAddBookmarkButton} · state=${b.state}`;
    }),
    await intento("arcgis-daylight en un mapa 2D frente a una escena", async () => {
      const errores: string[] = [];
      const orig = console.error, warn = console.warn;
      console.error = (...a: unknown[]) => { errores.push(String(a[0]).slice(0, 120)); orig(...a); };
      console.warn = (...a: unknown[]) => { errores.push(String(a[0]).slice(0, 120)); warn(...a); };
      container.innerHTML = `<arcgis-map basemap="osm" center="-74,4.6" zoom="5" style="display:block;width:600px;height:400px"><arcgis-daylight slot="top-right"></arcgis-daylight></arcgis-map>`;
      const m = container.querySelector("arcgis-map") as HTMLArcgisMapElement;
      await m.viewOnReady();
      const d = container.querySelector("arcgis-daylight") as HTMLArcgisDaylightElement;
      await d.componentOnReady(); await tick(1500);
      const en2d = `2D: view=${d.view?.type ?? "null"}, alto=${Math.round(d.getBoundingClientRect().height)} px, mensajes=${JSON.stringify(errores.filter((e) => /daylight|scene|3d/i.test(e)))}`;
      container.innerHTML = `<arcgis-scene basemap="osm" ground="world-elevation" camera-position="-74,4.6,20000" style="display:block;width:600px;height:400px"><arcgis-daylight slot="top-right"></arcgis-daylight></arcgis-scene>`;
      const s = container.querySelector("arcgis-scene") as HTMLArcgisSceneElement;
      await s.viewOnReady();
      const d3 = container.querySelector("arcgis-daylight") as HTMLArcgisDaylightElement;
      await d3.componentOnReady(); await tick(1500);
      console.error = orig; console.warn = warn;
      return `${en2d} · 3D: view=${d3.view?.type}, alto=${Math.round(d3.getBoundingClientRect().height)} px, localDate=${d3.localDateAsString}`;
    }),
    await intento("arcgis-elevation-profile: mapa 2D sin ground", async () => perfil(container, "")),
    await intento("arcgis-elevation-profile: mapa 2D con ground=\"world-elevation\"", async () => perfil(container, 'ground="world-elevation"')),
  ];
}
