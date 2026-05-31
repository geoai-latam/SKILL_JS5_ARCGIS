#!/usr/bin/env node
// lint-frontmatter.js — validates the frontmatter schema (Plan Maestro §5, 10 rules).
//
// Usage:
//   node scripts/lint-frontmatter.js
//   node scripts/lint-frontmatter.js --skill=<name>
//
// Exit code 1 on any error.
import semver from "semver";
import {
  listSkills,
  skillPath,
  fileExists,
  readMarkdown,
  estimateTokens,
  isIsoDate,
  toIsoDateString,
  isKebabCase,
  CATEGORIES,
  STATUSES,
  glyph,
  parseArgs,
} from "./lib/skill-utils.js";

/** Lint frontmatter of one markdown file. */
function lintFile(name, file) {
  const errors = [];
  const p = skillPath(name, file);
  if (!fileExists(p)) return errors; // missing-file handled by validate-skills
  const { data } = readMarkdown(p);

  // 1. name kebab-case + matches directory.
  if (!isKebabCase(data.name)) errors.push(`${file}: name "${data.name}" is not kebab-case`);
  if (data.name !== name) errors.push(`${file}: name "${data.name}" != directory "${name}"`);

  // 2. description 50-200 tokens.
  const tokens = estimateTokens(data.description);
  if (tokens < 50 || tokens > 200) {
    errors.push(`${file}: description ~${tokens} tokens (must be 50-200)`);
  }

  // 3. lang en|es (must match the file).
  const expectedLang = file === "SKILL.es.md" ? "es" : "en";
  if (data.lang !== expectedLang) {
    errors.push(`${file}: lang "${data.lang}" should be "${expectedLang}"`);
  }

  // 4. version is semver.
  if (!semver.valid(data.version)) errors.push(`${file}: version "${data.version}" is not semver`);

  // 5. status enum.
  if (!STATUSES.includes(data.status)) {
    errors.push(`${file}: status "${data.status}" not in ${STATUSES.join("|")}`);
  }

  // 6. sdk_version is a valid semver range.
  if (!data.sdk_version || semver.validRange(String(data.sdk_version)) === null) {
    errors.push(`${file}: sdk_version "${data.sdk_version}" is not a valid semver range`);
  }

  // 7. category enum.
  if (!CATEGORIES.includes(data.category)) {
    errors.push(`${file}: category "${data.category}" not in ${CATEGORIES.join("|")}`);
  }

  // 8. tags >= 3.
  if (!Array.isArray(data.tags) || data.tags.length < 3) {
    errors.push(`${file}: tags must have >= 3 entries (got ${data.tags?.length ?? 0})`);
  }

  // 9. created & updated valid ISO dates.
  if (!isIsoDate(data.created)) errors.push(`${file}: created "${data.created}" is not ISO YYYY-MM-DD`);
  if (!isIsoDate(data.updated)) errors.push(`${file}: updated "${data.updated}" is not ISO YYYY-MM-DD`);

  // 10. updated >= created (compare normalized YYYY-MM-DD strings).
  const created = toIsoDateString(data.created);
  const updated = toIsoDateString(data.updated);
  if (created && updated && updated < created) {
    errors.push(`${file}: updated (${updated}) is before created (${created})`);
  }

  return errors;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const only = args.flags.skill;
  let skills = listSkills();
  if (only) skills = skills.filter((s) => s === only);

  if (skills.length === 0) {
    console.log("No skills to lint.");
    return;
  }

  let totalErrors = 0;
  for (const name of skills) {
    const errors = [...lintFile(name, "SKILL.md"), ...lintFile(name, "SKILL.es.md")];
    totalErrors += errors.length;
    console.log(`${errors.length ? glyph.err : glyph.ok} ${name}`);
    for (const e of errors) console.log(`    ${glyph.err} ${e}`);
  }

  console.log(`\n${skills.length} skill(s) · ${totalErrors} frontmatter error(s)`);
  if (totalErrors > 0) process.exit(1);
}

main();
