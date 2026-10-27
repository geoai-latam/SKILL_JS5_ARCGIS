---
name: hello-world
description: >
  Reference skill and gold-standard template for the ArcGIS Maps SDK for
  JavaScript 5.0 skills library. It demonstrates the canonical file layout,
  bilingual EN/ES structure, frontmatter schema, progressive disclosure, and a
  type-checked snippet. Use this skill as the blueprint when authoring or
  reviewing any new arcgis-* skill, or when you need to understand how a skill
  in this repository is organized.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: core
tags:
  - reference
  - template
  - gold-standard
  - bilingual
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Hello World — Reference Skill

> **When to use:** Activate this skill whenever you need the canonical structure of a
> skill in this repository — as a blueprint for authoring a new `arcgis-*` skill or as
> the checklist for reviewing one.

## Overview

This is the gold-standard reference skill for the ArcGIS Maps SDK for JavaScript 5.0
skills library. It exists to be copied, not consumed by end users.

- **Problem it solves:** keeps every skill structurally identical so the validators,
  bilingual-sync, and smoke tests pass uniformly.
- **Who it serves:** skill authors and reviewers (human or agent).
- **Pattern it teaches:** progressive disclosure — a short `SKILL.md`, with depth pushed
  into `references/` and runnable code in `scripts/`.
- **What it does NOT cover:** real ArcGIS functionality. For actual maps, see
  `arcgis-core-maps`; for project scaffolding, see `arcgis-starter-app`.

## Quick Start

```typescript
// The minimal shape of a type-checked snippet. The smoke test runs `tsc --noEmit`
// against the real SDK types, so the import below must resolve.
import Map from "@arcgis/core/Map.js";

const map = new Map({ basemap: "topo-vector" });
export { map };
```

## Decision Tree

1. **Are you creating a brand-new skill?**
   - Yes → copy this folder via `pnpm new-skill <name>` and replace the content.
   - No → you probably want a real `arcgis-*` skill instead.

2. **Is your task in Spanish?**
   - Yes → the agent reads `SKILL.es.md`.
   - No → the agent reads `SKILL.md`.

**Default:** start from `pnpm new-skill`, never by hand-copying, so frontmatter stays valid.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import Map from "@arcgis/core/Map.js";
```

### Dynamic Imports (CDN)

```javascript
const Map = await $arcgis.import("@arcgis/core/Map.js");
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Progressive disclosure

The agent reads metadata first, then `SKILL.md`, and only opens `references/` on demand.
Keep `SKILL.md` under 300 lines; move API tables and long examples to `references/`.

### Concept 2: Bilingual mirroring

`SKILL.md` and `SKILL.es.md` must share the same heading structure (same levels, same
order) and the same number of code blocks. Headings are translated; code stays in English.

### Concept 3: Verifiable snippets

Every `scripts/snippet-*.ts` is type-checked in CI. If an import or type is wrong, the
smoke test fails — so examples never drift from the real SDK API.

## Common Pitfalls (Top 3)

### Pitfall 1: Omitting the `.js` extension in imports

```typescript
// ❌ Anti-pattern
import Map from "@arcgis/core/Map";
```

```typescript
// ✅ Correct
import Map from "@arcgis/core/Map.js";
```

**Impact:** the SDK 5.0 subpath exports fail to resolve and the build throws
"Cannot find module", so nothing renders.

### Pitfall 2: Editing only one language

```text
// ❌ Anti-pattern
Edit SKILL.md, ship the PR, leave SKILL.es.md stale.
```

```text
// ✅ Correct
Edit both files together; bilingual-sync fails CI on structural drift.
```

**Impact:** the Spanish-speaking user gets outdated guidance and CI blocks the merge.

### Pitfall 3: Hardcoding the API key

```typescript
// ❌ Anti-pattern
esriConfig.apiKey = "AAPK_real_key_pasted_here";
```

```typescript
// ✅ Correct
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

**Impact:** the secret leaks into git history and gitleaks blocks the commit.

## When to Read references/

| If you need... | Read |
|---|---|
| Full frontmatter field reference | `references/api-detail.md` |
| End-to-end authoring examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-starter-app` — scaffold a real project
- `arcgis-core-maps` — build an actual map or scene

## Reference Samples

- [intro-map-components](https://developers.arcgis.com/javascript/latest/sample-code/intro-map-components/)
- [intro-mapview](https://developers.arcgis.com/javascript/latest/sample-code/intro-mapview/)

## Changelog

- **0.1.0** (2026-05-31): Initial reference skill.
