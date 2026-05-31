#!/usr/bin/env node
// validate-skills.js — structural & format validation for every skill.
// Implements the 15 rules from the Plan Maestro §21. Does NOT test functionality.
//
// Usage:
//   node scripts/validate-skills.js                 # validate all skills
//   node scripts/validate-skills.js --skill=<name>  # validate one skill
//   node scripts/validate-skills.js --check-links   # also verify Reference Sample URLs (network)
//
// Exit code 1 if any ERROR is found (warnings never fail the build).
import {
  listSkills,
  skillPath,
  fileExists,
  readMarkdown,
  bodyLineCount,
  extractH2,
  REQUIRED_FRONTMATTER,
  CATALOG,
  compareBilingual,
  glyph,
  parseArgs,
} from "./lib/skill-utils.js";

const REQUIRED_FILES = [
  "SKILL.md",
  "SKILL.es.md",
  "AGENTS.md",
  "references/api-detail.md",
  "references/examples.md",
  "references/pitfalls.md",
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.ok;
  } catch {
    return false;
  }
}

/** Validate a single skill. Returns { errors:[], warnings:[] }. */
async function validateSkill(name, { checkLinks }) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  // Rules 1-6: required files exist.
  for (const rel of REQUIRED_FILES) {
    if (!fileExists(skillPath(name, rel))) err(`Missing required file: ${rel}`);
  }

  const skillMdPath = skillPath(name, "SKILL.md");
  const skillEsPath = skillPath(name, "SKILL.es.md");
  if (!fileExists(skillMdPath)) return { errors, warnings }; // can't go further

  const en = readMarkdown(skillMdPath);

  // Rule 7: frontmatter has all required fields.
  for (const f of REQUIRED_FRONTMATTER) {
    if (en.data[f] === undefined || en.data[f] === null || en.data[f] === "") {
      err(`SKILL.md frontmatter missing field: ${f}`);
    }
  }

  // Rule 8: name matches directory.
  if (en.data.name && en.data.name !== name) {
    err(`frontmatter name "${en.data.name}" does not match directory "${name}"`);
  }

  // Rule 9: lang en in SKILL.md, lang es in SKILL.es.md.
  if (en.data.lang !== "en") err(`SKILL.md must have lang: en (got "${en.data.lang}")`);

  // Rules 10-11: line count.
  const lines = bodyLineCount(en.content);
  if (lines > 500) err(`SKILL.md body is ${lines} lines (hard limit 500)`);
  else if (lines > 300) warn(`SKILL.md body is ${lines} lines (soft limit 300)`);

  // Rule 12: Related Skills cross-refs. A reference is valid if the skill already
  // exists. If it is a known catalog skill that is not built yet, warn (incremental
  // development). If it is neither, error (likely a typo / unknown skill).
  const allSkills = new Set(listSkills());
  const relatedBody = sectionByHeading(en.content, /related skills/i);
  if (relatedBody) {
    const refs = [...relatedBody.matchAll(/`([a-z0-9_][a-z0-9-]+)`/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (!ref.startsWith("arcgis-") && ref !== "_hello-world") continue;
      if (allSkills.has(ref)) continue;
      if (CATALOG.has(ref)) warn(`Related skill "${ref}" is in the catalog but not built yet`);
      else err(`Related Skills references unknown skill: ${ref}`);
    }
  }

  // Rule 13: Reference Sample URLs respond 200 (warn; opt-in via --check-links).
  const samplesBody = sectionByHeading(en.content, /reference samples/i);
  if (samplesBody) {
    const urls = [...samplesBody.matchAll(/\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
    if (checkLinks) {
      for (const url of urls) {
        if (!(await checkUrl(url))) warn(`Reference Sample URL not reachable: ${url}`);
      }
    } else if (urls.length) {
      warn(`${urls.length} Reference Sample URL(s) not checked (use --check-links)`);
    }
  }

  // Rules 14-15 + ES lang: bilingual comparison (structural).
  if (fileExists(skillEsPath)) {
    const es = readMarkdown(skillEsPath);
    if (es.data.lang !== "es") err(`SKILL.es.md must have lang: es (got "${es.data.lang}")`);
    const cmp = compareBilingual(en.content, es.content);
    errors.push(...cmp.errors);
    warnings.push(...cmp.warnings);
  }

  return { errors, warnings };
}

function sectionByHeading(content, headingRegex) {
  const lines = content.split("\n");
  let capture = false;
  const out = [];
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      capture = headingRegex.test(line.replace(/^##\s+/, ""));
      continue;
    }
    if (capture) out.push(line);
  }
  return out.length ? out.join("\n") : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const only = args.flags.skill;
  const checkLinks = !!args.flags["check-links"];

  let skills = listSkills();
  if (only) skills = skills.filter((s) => s === only);

  if (skills.length === 0) {
    console.log(`No skills found${only ? ` matching "${only}"` : ""}. Nothing to validate.`);
    return;
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const name of skills) {
    const { errors, warnings } = await validateSkill(name, { checkLinks });
    totalErrors += errors.length;
    totalWarnings += warnings.length;

    const mark = errors.length ? glyph.err : warnings.length ? glyph.warn : glyph.ok;
    console.log(`${mark} ${name}`);
    for (const e of errors) console.log(`    ${glyph.err} ${e}`);
    for (const w of warnings) console.log(`    ${glyph.warn} ${w}`);
  }

  console.log(
    `\n${skills.length} skill(s) · ${totalErrors} error(s) · ${totalWarnings} warning(s)`,
  );
  if (totalErrors > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
