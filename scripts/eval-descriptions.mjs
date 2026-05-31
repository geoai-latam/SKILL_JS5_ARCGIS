#!/usr/bin/env node
// eval-descriptions.mjs — triggering evals for skill descriptions.
//
// Modes:
//   --structure-only   Validate that every built skill has a well-formed eval JSON
//                       (>=5 should_trigger, >=3 should_not_trigger). Used in PR CI.
//   (default)          Same structural check; live triggering via the Claude CLI is
//                       attempted only when ANTHROPIC_API_KEY + `claude` are available.
//                       Live results are reported but do not fail the build yet.
//
// Exit 1 only on structural errors.
import fs from "node:fs";
import path from "node:path";
import { listSkills, glyph, parseArgs, REPO_ROOT } from "./lib/skill-utils.js";

const EVALS_DIR = path.join(REPO_ROOT, "tests", "evals");
const MIN_TRIGGER = 5;
const MIN_NOT_TRIGGER = 3;

function loadEval(name) {
  const p = path.join(EVALS_DIR, `${name}.eval.json`);
  if (!fs.existsSync(p)) return { error: `missing tests/evals/${name}.eval.json` };
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    return { data };
  } catch (e) {
    return { error: `invalid JSON in ${name}.eval.json: ${e.message}` };
  }
}

function checkStructure(name, data) {
  const errors = [];
  if (data.skill_name !== name) errors.push(`skill_name "${data.skill_name}" != "${name}"`);
  const trig = Array.isArray(data.should_trigger) ? data.should_trigger : [];
  const notTrig = Array.isArray(data.should_not_trigger) ? data.should_not_trigger : [];
  if (trig.length < MIN_TRIGGER) errors.push(`only ${trig.length} should_trigger (need >=${MIN_TRIGGER})`);
  if (notTrig.length < MIN_NOT_TRIGGER) {
    errors.push(`only ${notTrig.length} should_not_trigger (need >=${MIN_NOT_TRIGGER})`);
  }
  return errors;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const skills = listSkills();
  let totalErrors = 0;

  for (const name of skills) {
    const { data, error } = loadEval(name);
    if (error) {
      totalErrors++;
      console.log(`${glyph.err} ${name}: ${error}`);
      continue;
    }
    const errors = checkStructure(name, data);
    totalErrors += errors.length;
    console.log(`${errors.length ? glyph.err : glyph.ok} ${name}`);
    for (const e of errors) console.log(`    ${glyph.err} ${e}`);
  }

  const liveAvailable = !!process.env.ANTHROPIC_API_KEY;
  if (!args.flags["structure-only"]) {
    console.log(
      `\n${liveAvailable ? glyph.warn + " Live triggering via Claude CLI not yet wired (structural check only)." : "Live triggering skipped (no ANTHROPIC_API_KEY)."}`,
    );
  }

  console.log(`\n${skills.length} eval file(s) · ${totalErrors} structural error(s)`);
  if (totalErrors > 0) process.exit(1);
}

main();
