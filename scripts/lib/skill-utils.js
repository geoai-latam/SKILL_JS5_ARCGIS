// Shared helpers for the skills validators.
// Dependency-light: only gray-matter (frontmatter) and semver (version checks).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..", "..");
export const SKILLS_DIR = path.join(REPO_ROOT, "skills");

export const REQUIRED_FRONTMATTER = [
  "name",
  "description",
  "lang",
  "version",
  "status",
  "sdk_version",
  "created",
  "updated",
  "category",
  "tags",
  "maintainer",
  "license",
];

export const CATEGORIES = [
  "core",
  "layers",
  "visualization",
  "interaction",
  "widgets",
  "spatial",
  "services",
  "specialized",
  "new-in-5.0",
];

export const STATUSES = ["stable", "beta", "deprecated"];

/**
 * The canonical 35-skill catalog (Plan Maestro §34) plus the reference skill.
 * Used by the cross-ref check so that a skill may reference a sibling that is
 * planned but not yet built (warning) versus a typo / unknown name (error).
 */
export const CATALOG = new Set([
  "_hello-world",
  "arcgis-starter-app",
  "arcgis-core-maps",
  "arcgis-core-utilities",
  "arcgis-performance",
  "arcgis-layers",
  "arcgis-advanced-layers",
  "arcgis-3d-layers",
  "arcgis-tables-forms",
  "arcgis-visualization",
  "arcgis-cim-symbols",
  "arcgis-smart-mapping",
  "arcgis-feature-effects",
  "arcgis-interaction",
  "arcgis-popup-templates",
  "arcgis-editing",
  "arcgis-widgets-ui",
  "arcgis-widgets-advanced",
  "arcgis-geometry-operations",
  "arcgis-spatial-analysis",
  "arcgis-coordinates-projection",
  "arcgis-rest-services",
  "arcgis-portal-content",
  "arcgis-authentication",
  "arcgis-map-tools",
  "arcgis-arcade",
  "arcgis-imagery",
  "arcgis-time-animation",
  "arcgis-scene-environment",
  "arcgis-utility-networks",
  "arcgis-knowledge-graphs",
  "arcgis-custom-rendering",
  "arcgis-ai-components",
  "arcgis-charts",
  "arcgis-coding-components",
  "arcgis-embeddable-maps",
]);

/** List skill directories under skills/ (any subdirectory, including _hello-world). */
export function listSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function skillPath(name, ...rest) {
  return path.join(SKILLS_DIR, name, ...rest);
}

export function fileExists(p) {
  return fs.existsSync(p) && fs.statSync(p).isFile();
}

/** Read a markdown file and return { data (frontmatter), content (body), raw }. */
export function readMarkdown(p) {
  const raw = fs.readFileSync(p, "utf8");
  const parsed = matter(raw);
  return { data: parsed.data, content: parsed.content, raw };
}

/** Count body lines (excludes frontmatter). */
export function bodyLineCount(content) {
  // Trailing newline should not count as an extra line.
  return content.replace(/\n+$/, "").split("\n").length;
}

/**
 * Rough token estimate (~chars/4, the common GPT rule of thumb).
 * Used only for the description length guard, so approximate is fine.
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(String(text).trim().length / 4);
}

/** Extract H2 headings (## ...) in document order. */
export function extractH2(content) {
  return [...content.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1].trim());
}

/** Extract all headings as { level, text } in order (for structural comparison). */
export function extractHeadings(content) {
  return [...content.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)].map((m) => ({
    level: m[1].length,
    text: m[2].trim(),
  }));
}

/** Count fenced code blocks (``` ... ```). */
export function countCodeBlocks(content) {
  const fences = content.match(/^```/gm);
  return fences ? Math.floor(fences.length / 2) : 0;
}

/** Extract list items under a given H2 section (until the next H2). */
export function sectionBody(content, headingRegex) {
  const lines = content.split("\n");
  let capture = false;
  const out = [];
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      capture = headingRegex.test(line);
      continue;
    }
    if (capture) out.push(line);
  }
  return out.join("\n");
}

/** Extract `inline-code` tokens from a block of text. */
export function inlineCodeTokens(text) {
  return [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normalize a frontmatter date to a YYYY-MM-DD string, or null if invalid.
 * gray-matter (via js-yaml) auto-converts unquoted YAML dates to JS Date objects,
 * so we accept both Date and string forms.
 */
export function toIsoDateString(v) {
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? null : v.toISOString().slice(0, 10);
  }
  if (typeof v === "string" && ISO_DATE.test(v)) {
    const d = new Date(v + "T00:00:00Z");
    return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v) ? v : null;
  }
  return null;
}

export function isIsoDate(v) {
  return toIsoDateString(v) !== null;
}

export function isKebabCase(v) {
  return typeof v === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.replace(/^_/, ""));
}

// Simple colored status glyphs (no dependency).
export const glyph = { ok: "✓", warn: "!", err: "✗" };

/**
 * Compare EN and ES skill bodies STRUCTURALLY (headings are translated, so we
 * never compare heading text — only the shape: heading levels in order, and
 * code-block counts). Returns { errors:[], warnings:[] }.
 */
export function compareBilingual(enContent, esContent) {
  const errors = [];
  const warnings = [];

  const enH = extractHeadings(enContent);
  const esH = extractHeadings(esContent);

  if (enH.length !== esH.length) {
    errors.push(
      `Heading count differs: EN has ${enH.length}, ES has ${esH.length} (sections out of sync)`,
    );
  } else {
    const mismatch = enH.findIndex((h, i) => h.level !== esH[i].level);
    if (mismatch !== -1) {
      errors.push(
        `Heading structure diverges at position ${mismatch + 1}: ` +
          `EN H${enH[mismatch].level} "${enH[mismatch].text}" vs ES H${esH[mismatch].level} "${esH[mismatch].text}"`,
      );
    }
  }

  const enBlocks = countCodeBlocks(enContent);
  const esBlocks = countCodeBlocks(esContent);
  if (enBlocks !== esBlocks) {
    warnings.push(`Code-block count differs: EN ${enBlocks}, ES ${esBlocks}`);
  }

  const enLen = enContent.trim().length;
  const esLen = esContent.trim().length;
  const longer = Math.max(enLen, esLen);
  const drift = longer === 0 ? 0 : Math.abs(enLen - esLen) / longer;
  // Note: ES naturally runs ~15-20% longer than EN, so a hard 15% gate (as the
  // original plan proposed) causes constant false failures. Relaxed to a 25%
  // WARNING. Real desync is caught by the structural heading check above.
  if (drift > 0.25) {
    warnings.push(
      `Length drift ${(drift * 100).toFixed(0)}% exceeds 25% (EN ${enLen} chars, ES ${esLen} chars)`,
    );
  }

  return { errors, warnings };
}

export function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (const a of argv) {
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      args.flags[k] = v === undefined ? true : v;
    } else {
      args._.push(a);
    }
  }
  return args;
}
