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

// Skills whose `view` is a SceneView unless a block says otherwise.
const SCENE_SKILLS = new Set(["arcgis-3d-layers", "arcgis-scene-environment"]);
// Skills whose free `layer` is not a FeatureLayer.
const LAYER_TYPE = { "arcgis-advanced-layers": "@arcgis/core/layers/MapImageLayer.js" };
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
  let heading = "";
  lines.forEach((line, i) => {
    const m = line.match(/^\s*```(\w*)/);
    if (!cur && /^#{1,6}\s/.test(line)) heading = line;
    if (m && !cur) {
      cur = { lang: m[1].toLowerCase(), start: i + 2, code: [] };
    } else if (m && cur) {
      const code = cur.code.join("\n");
      const antipattern = /anti-?patr[oó]n|anti-pattern/i.test(heading) || /❌|Anti-?patr[oó]n|Anti-pattern/i.test(code.split("\n")[0] ?? "");
      if (LANGS.has(cur.lang)) blocks.push({ ...cur, code, antipattern });
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
    // Fragments lean on context the prose gives ("a Map", "the SceneView"). Supply it on the
    // block's first line, so reported line numbers stay those of the markdown.
    const ctx = [];
    if (/\bnew Map\(/.test(b.code) && !/import\s+(type\s+)?Map\b/.test(b.code)) ctx.push('import Map from "@arcgis/core/Map.js";');
    const scene = SCENE_SKILLS.has(b.skill) || /SceneView|arcgis-scene/.test(b.code);
    if (scene && !/\b(const|let|var)\s+view\b/.test(b.code)) {
      ctx.push('import type __SV from "@arcgis/core/views/SceneView.js"; declare const view: __SV;');
    }
    if (LAYER_TYPE[b.skill] && !/\b(const|let|var)\s+layer\b/.test(b.code)) {
      ctx.push(`import type __L from "${LAYER_TYPE[b.skill]}"; declare const layer: __L;`);
    }
    fs.writeFileSync(f, ctx.join(" ") + " " + b.code + "\nexport {};\n");
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
  // Anti-pattern blocks are meant to be wrong: report them apart and do not fail on them.
  const real = all.filter((b) => !b.antipattern);
  const bad = all.filter((b) => b.errors.length || b.deprecated.length);
  if (args.flags.json) {
    console.log(JSON.stringify(all.map(({ code, ...b }) => ({ ...b, free: [...b.free] })), null, 2));
  } else {
    for (const b of bad) {
      const mark = b.antipattern ? "⊘" : "✗";
      for (const e of b.errors) console.log(`${mark} ${b.file}:${e.line} TS${e.code} ${e.msg}${b.antipattern ? " (anti-pattern block)" : ""}`);
      for (const d of b.deprecated) console.log(`⚠ ${b.file}:${d.line} deprecated: ${d.msg}${b.antipattern ? " (anti-pattern block)" : ""}`);
    }
    console.log(`\n${all.length} block(s) · ${real.filter((b) => b.errors.length).length} with errors · ${real.filter((b) => b.deprecated.length).length} with deprecated APIs · ${all.length - real.length} anti-pattern block(s)`);
  }
  process.exit(real.some((b) => b.errors.length) ? 1 : 0);
}

main();
