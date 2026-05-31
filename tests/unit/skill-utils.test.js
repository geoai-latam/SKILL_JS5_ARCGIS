import { describe, it, expect } from "vitest";
import {
  estimateTokens,
  isIsoDate,
  toIsoDateString,
  isKebabCase,
  extractH2,
  extractHeadings,
  countCodeBlocks,
  compareBilingual,
  CATEGORIES,
  STATUSES,
  CATALOG,
} from "../../scripts/lib/skill-utils.js";

describe("estimateTokens", () => {
  it("returns 0 for empty", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens(null)).toBe(0);
  });
  it("approximates chars/4", () => {
    expect(estimateTokens("a".repeat(400))).toBe(100);
  });
});

describe("isIsoDate / toIsoDateString", () => {
  it("accepts ISO date strings", () => {
    expect(isIsoDate("2026-05-31")).toBe(true);
    expect(toIsoDateString("2026-05-31")).toBe("2026-05-31");
  });
  it("accepts Date objects (YAML auto-converts unquoted dates)", () => {
    expect(isIsoDate(new Date("2026-05-31T00:00:00Z"))).toBe(true);
    expect(toIsoDateString(new Date("2026-05-31T00:00:00Z"))).toBe("2026-05-31");
  });
  it("rejects invalid forms", () => {
    expect(isIsoDate("2026/05/31")).toBe(false);
    expect(isIsoDate("not-a-date")).toBe(false);
    expect(isIsoDate("2026-13-40")).toBe(false);
    expect(toIsoDateString(123)).toBe(null);
  });
});

describe("isKebabCase", () => {
  it("accepts kebab-case names", () => {
    expect(isKebabCase("arcgis-core-maps")).toBe(true);
    expect(isKebabCase("hello-world")).toBe(true);
  });
  it("rejects camelCase / spaces / trailing dash / leading underscore (spec)", () => {
    expect(isKebabCase("arcgisCoreMaps")).toBe(false);
    expect(isKebabCase("arcgis maps")).toBe(false);
    expect(isKebabCase("arcgis-")).toBe(false);
    expect(isKebabCase("_hello-world")).toBe(false);
  });
});

describe("extractHeadings / extractH2 / countCodeBlocks", () => {
  const md = [
    "# Title",
    "## Overview",
    "text",
    "### Sub",
    "```ts",
    "const x = 1;",
    "```",
    "## End",
  ].join("\n");
  it("extracts headings with levels in order", () => {
    expect(extractHeadings(md)).toEqual([
      { level: 1, text: "Title" },
      { level: 2, text: "Overview" },
      { level: 3, text: "Sub" },
      { level: 2, text: "End" },
    ]);
  });
  it("extracts H2 only", () => {
    expect(extractH2(md)).toEqual(["Overview", "End"]);
  });
  it("counts fenced code blocks", () => {
    expect(countCodeBlocks(md)).toBe(1);
  });
});

describe("compareBilingual (structural, translation-aware)", () => {
  const en = "# A\n## Overview\n```ts\n1\n```\n## End\n";
  it("passes when structure matches even with translated headings", () => {
    const es = "# A\n## Resumen\n```ts\n1\n```\n## Fin\n";
    const { errors } = compareBilingual(en, es);
    expect(errors).toHaveLength(0);
  });
  it("errors when heading counts differ", () => {
    const es = "# A\n## Resumen\n```ts\n1\n```\n";
    const { errors } = compareBilingual(en, es);
    expect(errors.length).toBeGreaterThan(0);
  });
  it("errors when heading levels diverge", () => {
    const es = "# A\n### Resumen\n```ts\n1\n```\n## Fin\n";
    const { errors } = compareBilingual(en, es);
    expect(errors.length).toBeGreaterThan(0);
  });
  it("warns on code-block count mismatch", () => {
    const es = "# A\n## Resumen\ntext\n## Fin\n";
    const { warnings } = compareBilingual(en, es);
    expect(warnings.some((w) => w.includes("Code-block"))).toBe(true);
  });
});

describe("enumerations", () => {
  it("has the 9 categories", () => {
    expect(CATEGORIES).toHaveLength(9);
    expect(CATEGORIES).toContain("new-in-5.0");
  });
  it("has the 3 statuses", () => {
    expect(STATUSES).toEqual(["stable", "beta", "deprecated"]);
  });
  it("catalog has 35 skills + hello-world", () => {
    expect(CATALOG.size).toBe(36);
    expect(CATALOG.has("arcgis-embeddable-maps")).toBe(true);
  });
});
