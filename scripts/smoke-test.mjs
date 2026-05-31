#!/usr/bin/env node
// smoke-test.mjs — type-checks every skill's scripts/snippet-*.ts with tsc.
//
// Rationale (deviation from plan §22): the plan proposed a per-skill Vite project
// + `vite build`. That installs the (very large) SDK once per skill and is too slow
// for per-PR CI. Instead we install the SDK ONCE at the repo root and run
// `tsc --noEmit` against the real type definitions. This verifies imports resolve
// and types are correct — a strong, fast signal. Full render verification lives in
// the Playwright integration tests (§23).
//
// Usage:
//   node scripts/smoke-test.mjs                 # all skills with snippets
//   node scripts/smoke-test.mjs --skill=<name>  # one skill
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { listSkills, skillPath, glyph, parseArgs, REPO_ROOT } from "./lib/skill-utils.js";

// Invoke the tsc JS entry directly with `node` (no shell) — avoids the .cmd
// shell wrapper and the DEP0190 deprecation warning, and is cross-platform.
const TSC = path.join(REPO_ROOT, "node_modules", "typescript", "bin", "tsc");

const TSC_FLAGS = [
  "--noEmit",
  "--strict",
  "--target",
  "ES2020",
  "--module",
  "ESNext",
  "--moduleResolution",
  "bundler",
  "--skipLibCheck",
  "--isolatedModules",
  "--lib",
  "ES2020,DOM,DOM.Iterable",
  // vite/client augments import.meta.env — the documented way to read the API key.
  "--types",
  "vite/client",
];

function snippetsFor(name) {
  const dir = skillPath(name, "scripts");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^snippet-.*\.ts$/.test(f))
    .map((f) => path.join(dir, f));
}

function typeCheck(file) {
  const res = spawnSync(process.execPath, [TSC, ...TSC_FLAGS, file], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return { ok: res.status === 0, output: (res.stdout || "") + (res.stderr || "") };
}

function main() {
  if (!fs.existsSync(TSC)) {
    console.error(`${glyph.err} tsc not found at ${TSC}. Run \`pnpm install\` first.`);
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));
  const only = args.flags.skill;
  let skills = listSkills();
  if (only) skills = skills.filter((s) => s === only);

  let checked = 0;
  let failed = 0;
  let skipped = 0;

  for (const name of skills) {
    const snippets = snippetsFor(name);
    if (snippets.length === 0) {
      skipped++;
      continue;
    }
    for (const file of snippets) {
      checked++;
      const rel = path.relative(REPO_ROOT, file);
      const { ok, output } = typeCheck(file);
      if (ok) {
        console.log(`${glyph.ok} ${rel}`);
      } else {
        failed++;
        console.log(`${glyph.err} ${rel}`);
        console.log(output.trim().split("\n").map((l) => `    ${l}`).join("\n"));
      }
    }
  }

  console.log(
    `\n${checked} snippet(s) checked · ${failed} failed · ${skipped} skill(s) without snippets`,
  );
  if (failed > 0) process.exit(1);
}

main();
