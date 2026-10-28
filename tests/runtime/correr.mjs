#!/usr/bin/env node
// Runs runtime casos in a real Chromium (WebGL via ANGLE/SwiftShader) against the
// installed SDK, so a skill's claim is checked by executing it, not only type-checked.
// Needs network (the casos load public Esri services). Playwright is NOT a dependency
// of this repo: pass its path with PLAYWRIGHT=<dir with node_modules/playwright>.
//
// Usage: PLAYWRIGHT=../GeoAI_LATAM/video node tests/runtime/correr.mjs <caso> [<caso>…]
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const req = createRequire(path.resolve(process.env.PLAYWRIGHT ?? ".", "package.json"));
const { chromium } = req("playwright");

const casos = process.argv.slice(2);
// Hosts that are not a plain static server, for the casos that need them (arcgis-parquet).
// <f> is a file under public/:
//   /sin-rango/<f>  answers every GET with 200 and the whole file (ignores Range);
//   /sin-head/<f>   answers HEAD with 405 and serves GET normally (with Range).
const hostsRaros = {
  name: "hosts-raros",
  configureServer(sv) {
    sv.middlewares.use((req, res, next) => {
      const m = req.url?.match(/^\/(sin-rango|sin-head)\/([\w./-]+)$/);
      if (!m || m[2].includes("..") || !fs.existsSync(path.join(here, "public", m[2]))) return next();
      if (m[1] === "sin-head") {
        if (req.method === "HEAD") { res.statusCode = 405; return res.end(); }
        req.url = `/${m[2]}`;
        return next();
      }
      const buf = fs.readFileSync(path.join(here, "public", m[2]));
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Length", buf.length);
      res.end(req.method === "HEAD" ? undefined : buf);
    });
  },
};
const server = await createServer({ root: here, logLevel: "error", server: { port: 5199 }, plugins: [hostsRaros] });
await server.listen();
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let fallos = 0;
for (const caso of casos) {
  const page = await browser.newPage();
  const consola = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) consola.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => consola.push(`pageerror: ${e.message}`));
  await page.goto(`http://localhost:5199/?caso=${caso}`);
  const res = await page.waitForFunction(() => window.__result, null, { timeout: 400000 }).then((h) => h.jsonValue()).catch((e) => ({ ok: false, error: String(e) }));
  console.log(`\n== ${caso}`);
  if (!res.ok) { fallos++; console.log(`✗ ${res.error}`); }
  for (const c of res.checks ?? []) { if (!c.ok) fallos++; console.log(`${c.ok ? "✓" : "✗"} ${c.check}${c.detail ? ` — ${c.detail}` : ""}`); }
  for (const l of consola.slice(0, 15)) console.log(`  · ${l.slice(0, 300)}`);
  await page.close();
}
await browser.close();
await server.close();
process.exit(fallos ? 1 : 0);
