#!/usr/bin/env node
// bilingual-sync.js — detects drift between SKILL.md (EN) and SKILL.es.md (ES).
// Plan Maestro §7. Compares STRUCTURE, never translated heading text.
//
// Errors (fail CI):  one file present without the other; heading structure desync.
// Warnings:          code-block count diff; length drift > 25%
//                    (relaxed from the plan's 15% — ES naturally runs longer).
//
// Usage:
//   node scripts/bilingual-sync.js
//   node scripts/bilingual-sync.js --skill=<name>
import {
  listSkills,
  skillPath,
  fileExists,
  readMarkdown,
  compareBilingual,
  glyph,
  parseArgs,
} from "./lib/skill-utils.js";

function checkSkill(name) {
  const errors = [];
  const warnings = [];
  const enPath = skillPath(name, "SKILL.md");
  const esPath = skillPath(name, "SKILL.es.md");
  const hasEn = fileExists(enPath);
  const hasEs = fileExists(esPath);

  if (hasEn && !hasEs) errors.push("SKILL.md exists but SKILL.es.md is missing");
  if (hasEs && !hasEn) errors.push("SKILL.es.md exists but SKILL.md is missing");
  if (!hasEn || !hasEs) return { errors, warnings };

  const cmp = compareBilingual(readMarkdown(enPath).content, readMarkdown(esPath).content);
  return { errors: cmp.errors, warnings: cmp.warnings };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const only = args.flags.skill;
  let skills = listSkills();
  if (only) skills = skills.filter((s) => s === only);

  if (skills.length === 0) {
    console.log("No skills to check.");
    return;
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  for (const name of skills) {
    const { errors, warnings } = checkSkill(name);
    totalErrors += errors.length;
    totalWarnings += warnings.length;
    const mark = errors.length ? glyph.err : warnings.length ? glyph.warn : glyph.ok;
    console.log(`${mark} ${name}`);
    for (const e of errors) console.log(`    ${glyph.err} ${e}`);
    for (const w of warnings) console.log(`    ${glyph.warn} ${w}`);
  }

  console.log(`\n${skills.length} skill(s) · ${totalErrors} error(s) · ${totalWarnings} warning(s)`);
  if (totalErrors > 0) process.exit(1);
}

main();
