---
name: arcgis-coding-components
description: >
  Embed code-editing UIs with the ArcGIS Maps SDK for JavaScript 5.0 coding
  components: arcgis-arcade-editor (Arcade authoring with syntax highlighting,
  suggestions, and live results) and arcgis-code-editor / sql-expression-editor.
  Use this skill whenever the user builds an in-app editor for Arcade, SQL, or
  code with autocomplete and validation.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: new-in-5.0
tags:
  - coding
  - arcade-editor
  - code-editor
  - syntax-highlighting
  - components
requires:
  - arcgis-arcade
packages:
  - "@arcgis/coding-components@^5.0"
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Coding Components

> **When to use:** Activate this skill whenever the user builds an in-app editor for Arcade, SQL, or
> code with highlighting, autocomplete, and validation.

## Overview

The coding components provide editor UIs (Arcade, SQL, generic code) with assistance built in.

- **Problem it solves:** letting end users author expressions/code safely in-app.
- **Who it serves:** developers building expression builders and admin tools.
- **Pattern it teaches:** drop the editor component, give it a script + context, read the result.
- **What it does NOT cover:** running Arcade (see `arcgis-arcade`) or chart configs (see `arcgis-charts`).

## Quick Start

```typescript
import "@arcgis/coding-components/dist/components/arcgis-arcade-editor";
// <arcgis-arcade-editor></arcgis-arcade-editor> — set .script and a profile
```

## Decision Tree

1. **Editing Arcade?**
   - Yes → `arcgis-arcade-editor` (with suggestions + live results).

2. **Editing SQL (where clauses)?**
   - Yes → `arcgis-sql-expression-editor`.

3. **Generic code editor?**
   - Yes → `arcgis-code-editor`.

**Default:** `arcgis-arcade-editor` for Arcade authoring.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/coding-components/dist/components/arcgis-arcade-editor";
```

### Dynamic Imports (CDN)

```javascript
// The unified 5.0 CDN includes coding-components; reference the custom element.
const script = "https://js.arcgis.com/5.0/";
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: Arcade editor

`arcgis-arcade-editor` edits an Arcade `script` with syntax highlighting, autocomplete from a
profile, and (optionally) live results against a test feature.

### Concept 2: Profiles drive suggestions

Like the Arcade runtime, the editor uses a profile to know which variables/functions are valid,
powering autocomplete and validation.

### Concept 3: SQL & generic editors

`arcgis-sql-expression-editor` assists building `where` clauses against a layer's fields;
`arcgis-code-editor` is a general code surface.

## Common Pitfalls (Top 3)

### Pitfall 1: No profile = no useful autocomplete

```typescript
// ❌ Anti-pattern
// arcgis-arcade-editor with no profile configured
```

```typescript
// ✅ Correct
// Provide the same profile your runtime uses (e.g. popup/renderer).
```

**Impact:** suggestions/validation are generic or wrong.

### Pitfall 2: Editing here but running with a different profile

```typescript
// ❌ Anti-pattern
// Author with profile A, execute with profile B
```

```typescript
// ✅ Correct
// Keep the editor and runtime profiles consistent.
```

**Impact:** scripts that validate in the editor fail at runtime.

### Pitfall 3: Not validating before applying

```typescript
// ❌ Anti-pattern
layer.renderer.valueExpression = editor.script; // even if invalid
```

```typescript
// ✅ Correct
// Check the editor's validity/diagnostics before applying.
```

**Impact:** broken expressions get pushed into renderers/popups.

## When to Read references/

| If you need... | Read |
|---|---|
| Editor component attributes | `references/api-detail.md` |
| Arcade / SQL editor examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-arcade` — run the authored expressions
- `arcgis-layers` — fields for SQL/where editors
- `arcgis-visualization` — apply valueExpression results

## Reference Samples

- [Coding components](https://developers.arcgis.com/javascript/latest/references/coding-components/)
- [Arcade editor](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
