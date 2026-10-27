// cdn.mjs — what the 5.1 CDN script really registers, with a module tag and with a classic tag.
// Usage: PLAYWRIGHT=../GeoAI_LATAM/video node tests/runtime/cdn.mjs
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(path.resolve(process.env.PLAYWRIGHT ?? ".", "package.json"));
const { chromium } = require("playwright");
const TAGS = ["arcgis-map", "arcgis-chart", "arcgis-arcade-editor", "arcgis-assistant", "calcite-button"];

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader"] });
for (const tipo of ["module", "classic"]) {
  const page = await browser.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message));
  const attr = tipo === "module" ? ' type="module"' : "";
  await page.setContent(`<!doctype html><html><head><script${attr} src="https://js.arcgis.com/5.1/"></script></head><body></body></html>`);
  await page.waitForTimeout(15000);
  const def = await page.evaluate((tags) => tags.map((t) => `${t}=${!!customElements.get(t)}`).join(" "), TAGS);
  const arcgis = await page.evaluate(() => typeof globalThis.$arcgis);
  console.log(`<script${attr}>: ${def} · $arcgis=${arcgis}${errores.length ? " · error: " + errores[0] : ""}`);
  await page.close();
}
await browser.close();
