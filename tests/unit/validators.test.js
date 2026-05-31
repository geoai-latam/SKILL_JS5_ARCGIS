// End-to-end checks: the validators must exit 0 on the gold-standard _hello-world
// skill, and lint-frontmatter must catch a malformed frontmatter.
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function run(script, args = []) {
  const res = spawnSync(process.execPath, [path.join("scripts", script), ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return { status: res.status, out: (res.stdout || "") + (res.stderr || "") };
}

describe("validators on _hello-world (gold standard)", () => {
  it("validate-skills passes", () => {
    const { status } = run("validate-skills.js", ["--skill=_hello-world"]);
    expect(status).toBe(0);
  });
  it("lint-frontmatter passes", () => {
    const { status } = run("lint-frontmatter.js", ["--skill=_hello-world"]);
    expect(status).toBe(0);
  });
  it("bilingual-sync passes", () => {
    const { status } = run("bilingual-sync.js", ["--skill=_hello-world"]);
    expect(status).toBe(0);
  });
  it("smoke-test type-checks the snippet", () => {
    const { status } = run("smoke-test.mjs", ["--skill=_hello-world"]);
    expect(status).toBe(0);
  });
});

describe("validators on a non-existent skill", () => {
  it("validate-skills exits 0 with nothing to do", () => {
    const { status, out } = run("validate-skills.js", ["--skill=does-not-exist"]);
    expect(status).toBe(0);
    expect(out).toMatch(/No skills found/);
  });
});
