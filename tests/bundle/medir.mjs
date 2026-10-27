#!/usr/bin/env node
// Measures what a dynamic import() of optional layers really saves from the initial bundle (Vite build).
// Writes its entries and builds into tests/bundle/.tmp (gitignored). Usage: node tests/bundle/medir.mjs
import { build } from "vite";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const tmp = path.join(path.dirname(fileURLToPath(import.meta.url)), ".tmp");
fs.mkdirSync(tmp, { recursive: true });
const base = `import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
const map = new Map({ layers: [new FeatureLayer({ url: "x" })] });
new MapView({ container: "v", map });
`;
const entradas = {
  "solo-base": base,
  "opcionales-estaticos": `${base}import CSVLayer from "@arcgis/core/layers/CSVLayer.js";
import KMLLayer from "@arcgis/core/layers/KMLLayer.js";
document.body.onclick = () => { map.add(new CSVLayer({ url: "y" })); map.add(new KMLLayer({ url: "z" })); };
`,
  "opcionales-dinamicos": `${base}document.body.onclick = async () => {
  const [{ default: CSVLayer }, { default: KMLLayer }] = await Promise.all([
    import("@arcgis/core/layers/CSVLayer.js"), import("@arcgis/core/layers/KMLLayer.js")]);
  map.add(new CSVLayer({ url: "y" })); map.add(new KMLLayer({ url: "z" }));
};
`,
};
for (const [nombre, codigo] of Object.entries(entradas)) {
  const entrada = path.join(tmp, `${nombre}.ts`);
  fs.writeFileSync(entrada, codigo);
  const r = await build({ logLevel: "silent", root: tmp, build: { outDir: path.join(tmp, `dist-${nombre}`), emptyOutDir: true, modulePreload: false, rollupOptions: { input: entrada } } });
  const chunks = (Array.isArray(r) ? r[0] : r).output.filter((o) => o.type === "chunk");
  const porNombre = Object.fromEntries(chunks.map((c) => [c.fileName, c]));
  const inicial = new Set();
  const pila = [chunks.find((c) => c.isEntry).fileName];
  while (pila.length) { const f = pila.pop(); if (inicial.has(f)) continue; inicial.add(f); pila.push(...porNombre[f].imports); }
  const kb = (fs_, gz) => ([...fs_].reduce((s, f) => s + (gz ? zlib.gzipSync(porNombre[f].code).length : Buffer.byteLength(porNombre[f].code)), 0) / 1024).toFixed(0);
  console.log(`${nombre}: inicial ${kb(inicial)} KB (${kb(inicial, true)} KB gzip) · ${chunks.length} chunks en total`);
}
