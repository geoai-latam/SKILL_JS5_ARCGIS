---
name: arcgis-ai-components
description: >
  Build agentic mapping experiences with the ArcGIS Maps SDK for JavaScript 5.0 AI
  Components (BETA): the arcgis-assistant component and its agents (navigation,
  data-exploration, help, layer-filter) plus custom agents for natural-language
  map interaction. Use this skill whenever the user adds a conversational AI
  assistant to a map or builds natural-language data exploration.
lang: en
version: 0.1.0
status: beta
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: new-in-5.0
tags:
  - ai
  - assistant
  - agents
  - natural-language
  - beta
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/ai-components@^5.0"
  - "@arcgis/map-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# AI Components (Beta)

> **When to use:** Activate this skill whenever the user adds a conversational AI assistant to a map
> or builds natural-language data exploration. This package is **beta**.

## Overview

AI Components add a conversational assistant whose agents act on the map via natural language.

- **Problem it solves:** letting users explore and navigate maps by chatting.
- **Who it serves:** developers building assistive, agentic map UIs.
- **Pattern it teaches:** drop `arcgis-assistant`, enable agents, bind to the map.
- **What it does NOT cover:** the underlying map (see `arcgis-core-maps`) or charts (see `arcgis-charts`).

> ⚠️ Beta: the AI Components API may change between 5.x releases. Pin versions and re-test on upgrade.

## Quick Start

```typescript
import "@arcgis/ai-components/dist/components/arcgis-assistant";
// <arcgis-map id="myMap"></arcgis-map>
// <arcgis-assistant reference-element="#myMap"></arcgis-assistant>
```

## Decision Tree

1. **Want an out-of-the-box chat assistant?**
   - Yes → `arcgis-assistant` with the built-in agents.

2. **Which capabilities?**
   - Navigation (go to places), data-exploration (query/filter), help, layer-filter.

3. **Domain-specific behavior?**
   - Yes → configure a custom agent.

**Default:** `arcgis-assistant` with the built-in agents bound to the map.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/ai-components/dist/components/arcgis-assistant";
```

### Dynamic Imports (CDN)

```javascript
// The unified 5.0 CDN includes ai-components; reference the custom element directly.
const script = "https://js.arcgis.com/5.0/";
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Key Concepts

### Concept 1: The assistant + agents

`arcgis-assistant` hosts a chat UI; agents (navigation, data-exploration, help, layer-filter) turn
prompts into map actions. Enable the agents your app needs.

### Concept 2: Binding to the map

Bind the assistant to a map via `reference-element` so agents can act on its layers, view, and
filters.

### Concept 3: Beta + custom agents

The API is beta and evolving. You can register custom agents for domain tasks; expect changes and
pin the package version.

## Common Pitfalls (Top 3)

### Pitfall 1: Treating beta as stable

```typescript
// ❌ Anti-pattern
"@arcgis/ai-components": "^5"  // floating across breaking beta changes
```

```typescript
// ✅ Correct
"@arcgis/ai-components": "5.0.x"  // pin and re-test on upgrade
```

**Impact:** breaking changes between beta releases surprise you.

### Pitfall 2: Assistant with no map binding

```typescript
// ❌ Anti-pattern
// <arcgis-assistant></arcgis-assistant> with no reference-element
```

```typescript
// ✅ Correct
// <arcgis-assistant reference-element="#myMap"></arcgis-assistant>
```

**Impact:** agents have nothing to act on.

### Pitfall 3: Exposing it without guardrails

```typescript
// ❌ Anti-pattern
// Shipping the assistant against sensitive data with no scoping
```

```typescript
// ✅ Correct
// Scope agents/data; review what the assistant can access.
```

**Impact:** the assistant surfaces data you didn't intend.

## When to Read references/

| If you need... | Read |
|---|---|
| Assistant / agent attributes | `references/api-detail.md` |
| Assistant setup examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-core-maps` — the map the assistant acts on
- `arcgis-layers` — the data it explores
- `arcgis-charts` — charts for data exploration

## Reference Samples

- [AI Components (beta)](https://www.esri.com/arcgis-blog/products/js-api-arcgis/developers/introducing-ai-components-beta-in-arcgis-maps-sdk-for-javascript)
- [Components overview](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.1.0** (2026-05-31): Initial release (beta).
