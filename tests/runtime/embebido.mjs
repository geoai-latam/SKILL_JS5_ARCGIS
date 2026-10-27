// embebido.mjs — where arcgis-embedded-map really comes from in 5.1, and what it does.
// Usage: PLAYWRIGHT=../GeoAI_LATAM/video node tests/runtime/embebido.mjs
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(path.resolve(process.env.PLAYWRIGHT ?? ".", "package.json"));
const { chromium } = require("playwright");
const ITEM = "10f5128431d44f9180d9936834100ac5"; // public webmap used by Esri's own embeddable docs
const URLS = [
  "https://js.arcgis.com/5.1/",                     // what the skill taught (unified SDK script)
  "https://js.arcgis.com/5.1/embeddable-components/", // what Esri documents for 5.1
  "https://js.arcgis.com/embeddable-components/4.33/arcgis-embeddable-components.esm.js",
];
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader"] });

async function pagina(url, body) {
  const page = await browser.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message));
  await page.setContent(`<!doctype html><html><head><script type="module" src="${url}"></script></head><body>${body}</body></html>`);
  await page.waitForTimeout(20000);
  return { page, errores };
}

for (const url of URLS) {
  const r = await browser.newPage().then(async (p) => { const s = await p.request.get(url).then((x) => x.status()).catch((e) => e.message); await p.close(); return s; });
  const { page, errores } = await pagina(url, `<arcgis-embedded-map style="display:block;height:400px;width:600px" item-id="${ITEM}" legend-enabled></arcgis-embedded-map>`);
  const info = await page.evaluate(async () => {
    const C = customElements.get("arcgis-embedded-map");
    if (!C) return "arcgis-embedded-map NO registrado";
    const el = document.querySelector("arcgis-embedded-map");
    const wm = el.webMap;
    return `registrado · webMap=${wm ? `${wm.portalItem?.title ?? "?"} (${wm.loadStatus}, ${wm.layers?.length} capas)` : "undefined"} · scrollEnabled=${el.scrollEnabled} · legendEnabled=${el.legendEnabled} · bookmarksEnabled=${el.bookmarksEnabled} · alto=${el.getBoundingClientRect().height}px · hide-legend es atributo conocido=${(C.observedAttributes ?? []).includes("hide-legend")}`;
  });
  console.log(`${url} → HTTP ${r} · ${info}${errores.length ? " · error: " + errores[0].slice(0, 140) : ""}`);
  await page.close();
}

// Zero-height pitfall with the documented script.
{
  const { page } = await pagina(URLS[1], `<arcgis-embedded-map item-id="${ITEM}"></arcgis-embedded-map>`);
  const alto = await page.evaluate(() => document.querySelector("arcgis-embedded-map").getBoundingClientRect().height);
  console.log(`sin estilo de alto → ${alto}px`);
  await page.close();
}
// The 5.1 SDK script and the embeddable script on the same page.
{
  const page = await browser.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => { if (m.type() === "warning" || m.type() === "error") errores.push(m.text()); });
  await page.setContent(`<!doctype html><html><head><script type="module" src="${URLS[0]}"></script><script type="module" src="${URLS[1]}"></script></head><body><arcgis-embedded-map style="display:block;height:400px" item-id="${ITEM}"></arcgis-embedded-map></body></html>`);
  await page.waitForTimeout(20000);
  const ok = await page.evaluate(() => `map=${!!customElements.get("arcgis-map")} embedded=${!!customElements.get("arcgis-embedded-map")} webMap=${document.querySelector("arcgis-embedded-map").webMap?.loadStatus}`);
  console.log(`los dos scripts juntos → ${ok} · avisos/errores: ${errores.length}${errores.length ? " · " + errores.slice(0, 2).map((e) => e.slice(0, 120)).join(" | ") : ""}`);
  await page.close();
}
await browser.close();
