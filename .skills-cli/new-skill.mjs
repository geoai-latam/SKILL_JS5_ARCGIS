#!/usr/bin/env node
// new-skill.mjs — scaffold a bilingual skill skeleton that passes validate-skills
// out of the box.
//
// Usage:
//   pnpm new-skill <kebab-name> [--category=<cat>] [--display="Display Name"]
//
// Example:
//   pnpm new-skill arcgis-time-animation --category=specialized
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const TEMPLATES = path.join(__dirname, "templates");
const SKILLS_DIR = path.join(REPO_ROOT, "skills");
const EVALS_DIR = path.join(REPO_ROOT, "tests", "evals");

const CATEGORIES = [
  "core", "layers", "visualization", "interaction", "widgets",
  "spatial", "services", "specialized", "new-in-5.0",
];

function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (const a of argv) {
    if (a.startsWith("--")) {
      const [k, ...rest] = a.slice(2).split("=");
      args.flags[k] = rest.length ? rest.join("=") : true;
    } else args._.push(a);
  }
  return args;
}

function isKebab(v) {
  return /^_?[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
}

function toDisplay(name) {
  return name
    .replace(/^_/, "")
    .replace(/^arcgis-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function render(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : `{{${k}}}`));
}

function writeFromTemplate(tplRel, destAbs, vars) {
  const tpl = fs.readFileSync(path.join(TEMPLATES, tplRel), "utf8");
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  fs.writeFileSync(destAbs, render(tpl, vars), "utf8");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = args._[0];

  if (!name) {
    console.error("Usage: pnpm new-skill <kebab-name> [--category=<cat>] [--display=\"Name\"]");
    process.exit(1);
  }
  if (!isKebab(name)) {
    console.error(`✗ "${name}" is not kebab-case.`);
    process.exit(1);
  }

  const category = args.flags.category || "specialized";
  if (!CATEGORIES.includes(category)) {
    console.error(`✗ category "${category}" not in ${CATEGORIES.join("|")}`);
    process.exit(1);
  }

  const dir = path.join(SKILLS_DIR, name);
  if (fs.existsSync(dir)) {
    console.error(`✗ skills/${name} already exists. Aborting.`);
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);
  const slug = name.replace(/^_/, "").replace(/^arcgis-/, "");
  const display = args.flags.display || toDisplay(name);
  const vars = { name, slug, date, category, display };

  writeFromTemplate("SKILL.md.tpl", path.join(dir, "SKILL.md"), vars);
  writeFromTemplate("SKILL.es.md.tpl", path.join(dir, "SKILL.es.md"), vars);
  writeFromTemplate("AGENTS.md.tpl", path.join(dir, "AGENTS.md"), vars);
  writeFromTemplate("references/api-detail.md.tpl", path.join(dir, "references", "api-detail.md"), vars);
  writeFromTemplate("references/examples.md.tpl", path.join(dir, "references", "examples.md"), vars);
  writeFromTemplate("references/pitfalls.md.tpl", path.join(dir, "references", "pitfalls.md"), vars);
  writeFromTemplate("eval.json.tpl", path.join(EVALS_DIR, `${name}.eval.json`), vars);

  console.log(`✓ Created skills/${name}/`);
  console.log(`  SKILL.md, SKILL.es.md, AGENTS.md, references/{api-detail,examples,pitfalls}.md`);
  console.log(`✓ Created tests/evals/${name}.eval.json`);
  console.log(`\nNext steps:`);
  console.log(`  1. Replace every TODO in skills/${name}/`);
  console.log(`  2. node scripts/validate-skills.js --skill=${name}`);
  console.log(`  3. (if it ships code) add scripts/snippet-*.ts and run: node scripts/smoke-test.mjs --skill=${name}`);
}

main();
