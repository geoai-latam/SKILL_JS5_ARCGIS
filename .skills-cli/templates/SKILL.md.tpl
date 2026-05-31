---
name: {{name}}
description: >
  TODO replace: one-paragraph description of {{name}} for the ArcGIS Maps SDK for
  JavaScript 5.0. Explain what the developer builds with it, which APIs or
  components it covers, and when an agent should activate it. Keep it between 50
  and 200 tokens. Use this skill when the user works on the {{name}} domain in a
  web mapping application.
lang: en
version: 0.1.0
status: beta
sdk_version: ">=5.0 <6.0"
created: {{date}}
updated: {{date}}
category: {{category}}
tags:
  - arcgis
  - sdk-5
  - {{slug}}
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# {{display}}

> **When to use:** Activate this skill whenever the user TODO describe the trigger context.

## Overview

TODO 2-3 paragraphs.

- What problem it solves.
- Which technical persona it serves.
- The fundamental pattern it teaches.
- What it does NOT cover (delegate to another skill if applicable).

## Quick Start

```typescript
// TODO minimal runnable snippet.
import Map from "@arcgis/core/Map.js";

const map = new Map({ basemap: "topo-vector" });
export { map };
```

## Decision Tree

1. **TODO branching question?**
   - Yes → option A (reason).
   - No → option B (reason).

**Default:** option A unless there is an explicit reason for B.

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
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: TODO

TODO 1-2 paragraphs.

### Concept 2: TODO

TODO 1-2 paragraphs.

### Concept 3: TODO

TODO 1-2 paragraphs.

## Common Pitfalls (Top 3)

### Pitfall 1: TODO

```typescript
// ❌ Anti-pattern
// TODO
```

```typescript
// ✅ Correct
// TODO
```

**Impact:** TODO observable symptom.

### Pitfall 2: TODO

```typescript
// ❌ Anti-pattern
// TODO
```

```typescript
// ✅ Correct
// TODO
```

**Impact:** TODO observable symptom.

### Pitfall 3: TODO

```typescript
// ❌ Anti-pattern
// TODO
```

```typescript
// ✅ Correct
// TODO
```

**Impact:** TODO observable symptom.

## When to Read references/

| If you need... | Read |
|---|---|
| Full API signatures | `references/api-detail.md` |
| End-to-end examples | `references/examples.md` |
| More pitfalls (5+) | `references/pitfalls.md` |

## Related Skills

- `arcgis-core-maps` — TODO why
- `arcgis-starter-app` — TODO why

## Reference Samples

- [intro-map-components](https://developers.arcgis.com/javascript/latest/sample-code/intro-map-components/)

## Changelog

- **0.1.0** ({{date}}): Initial draft.
