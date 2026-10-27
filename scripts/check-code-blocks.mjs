#!/usr/bin/env node
// check-code-blocks.mjs — type-checks the ```ts/js code blocks inside each skill's
// markdown (SKILL.md, AGENTS.md, references/*.md) against the installed SDK types.
//
// smoke-test.mjs only covers scripts/snippet-*.ts; the guides themselves are what an
// agent copies, so they get the same check here. Blocks are fragments, so a typed
// prelude declares the usual free names (map, view, layer…). Reported per block:
//   error       a module that does not resolve, a property/member that does not exist,
//               a wrong argument — anything except "cannot find name" in a fragment
//   deprecated  an API marked @deprecated in the installed .d.ts
//   free        undeclared names the prelude does not cover (informational)
//
// Usage: node scripts/check-code-blocks.mjs [--skill=<name>] [--json]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { listSkills, skillPath, parseArgs, REPO_ROOT } from "./lib/skill-utils.js";

const require = createRequire(import.meta.url);
const ts = require("typescript");

// Globals in a separate .d.ts, so a block that declares its own `layer` shadows them.
const PRELUDE_DTS = `
import type __Map from "@arcgis/core/Map.js";
import type __MapView from "@arcgis/core/views/MapView.js";
import type __SceneView from "@arcgis/core/views/SceneView.js";
import type __FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import type __Graphic from "@arcgis/core/Graphic.js";
declare global {
  var map: __Map;
  var webmap: __Map;
  var view: __MapView;
  var mapView: __MapView;
  var sceneView: __SceneView;
  var layer: __FeatureLayer;
  var featureLayer: __FeatureLayer;
  var graphic: __Graphic;
  var viewElement: HTMLArcgisMapElement;
  var mapElement: HTMLArcgisMapElement;
  var sceneElement: HTMLArcgisSceneElement;
}
export {};
`;

const LANGS = new Set(["ts", "typescript", "js", "javascript", "tsx", "jsx"]);
// Error codes that only mean "this is a fragment".
const FRAGMENT_CODES = new Set([2304, 2552, 2582, 1375, 1378, 2451, 2300, 2393, 7006, 7005, 7034, 7031, 18004]);

function markdownFiles(name) {
  const files = ["SKILL.md", "SKILL.es.md", "AGENTS.md"].map((f) => skillPath(name, f));
  const refs = skillPath(name, "references");
  if (fs.existsSync(refs)) {
    for (const f of fs.readdirSync(refs)) if (f.endsWith(".md")) files.push(path.join(refs, f));
  }
  return files.filter((f) => fs.existsSync(f));
}

function extractBlocks(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const blocks = [];
  let cur = null;
  lines.forEach((line, i) => {
    const m = line.match(/^\s*```(\w*)/);
    if (m && !cur) {
      cur = { lang: m[1].toLowerCase(), start: i + 2, code: [] };
    } else if (m && cur) {
      if (LANGS.has(cur.lang)) blocks.push({ ...cur, code: cur.code.join("\n") });
      cur = null;
    } else if (cur) cur.code.push(line);
  });
  return blocks;
}

function check(blocks) {
  const tmp = path.join(REPO_ROOT, "node_modules", ".cache", "check-code-blocks");
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const fileFor = new Map();
  const prelude = path.join(tmp, "prelude.d.ts");
  fs.writeFileSync(prelude, PRELUDE_DTS);
  blocks.forEach((b, i) => {
    // An `export {}` keeps each block a module so names do not collide across blocks.
    const f = path.join(tmp, `b${i}.ts`);
    fs.writeFileSync(f, b.code + "\nexport {};\n");
    fileFor.set(path.normalize(f), b);
  });
  const options = {
    noEmit: true,
    strict: false,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    allowJs: true,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
    types: ["vite/client", "@arcgis/map-components"],
    typeRoots: [path.join(REPO_ROOT, "node_modules")],
    baseUrl: REPO_ROOT,
  };
  const host = ts.createCompilerHost(options);
  const program = ts.createProgram([prelude, ...fileFor.keys()], options, host);
  const service = ts.createLanguageService(
    {
      getScriptFileNames: () => [prelude, ...fileFor.keys()],
      getScriptVersion: () => "1",
      getScriptSnapshot: (f) => (fs.existsSync(f) ? ts.ScriptSnapshot.fromString(fs.readFileSync(f, "utf8")) : undefined),
      getCurrentDirectory: () => REPO_ROOT,
      getCompilationSettings: () => options,
      getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
    },
    ts.createDocumentRegistry(),
  );
  for (const [f, b] of fileFor) {
    const sf = program.getSourceFile(f);
    b.errors = [];
    b.deprecated = [];
    b.free = new Set();
    const where = (d) => {
      const { line } = sf.getLineAndCharacterOfPosition(d.start ?? 0);
      return b.start + line;
    };
    for (const d of [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)]) {
      const msg = ts.flattenDiagnosticMessageText(d.messageText, " ");
      if (FRAGMENT_CODES.has(d.code)) {
        const m = msg.match(/name '([^']+)'/);
        if (m) b.free.add(m[1]);
        continue;
      }
      b.errors.push({ line: where(d), code: d.code, msg });
    }
    for (const d of service.getSuggestionDiagnostics(f)) {
      if (d.reportsDeprecated) b.deprecated.push({ line: where(d), msg: ts.flattenDiagnosticMessageText(d.messageText, " ") });
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let skills = listSkills();
  if (args.flags.skill) skills = skills.filter((s) => s === args.flags.skill);
  const all = [];
  for (const name of skills) {
    for (const file of markdownFiles(name)) {
      for (const b of extractBlocks(file)) all.push({ ...b, skill: name, file: path.relative(REPO_ROOT, file) });
    }
  }
  check(all);
  const bad = all.filter((b) => b.errors.length || b.deprecated.length);
  if (args.flags.json) {
    console.log(JSON.stringify(all.map(({ code, ...b }) => ({ ...b, free: [...b.free] })), null, 2));
  } else {
    for (const b of bad) {
      for (const e of b.errors) console.log(`✗ ${b.file}:${e.line} TS${e.code} ${e.msg}`);
      for (const d of b.deprecated) console.log(`⚠ ${b.file}:${d.line} deprecated: ${d.msg}`);
    }
    console.log(`\n${all.length} block(s) · ${all.filter((b) => b.errors.length).length} with errors · ${all.filter((b) => b.deprecated.length).length} with deprecated APIs`);
  }
  process.exit(all.some((b) => b.errors.length) ? 1 : 0);
}

main();
