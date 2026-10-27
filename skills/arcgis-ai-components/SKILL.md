---
name: arcgis-ai-components
description: >
  Build agentic mapping experiences with the ArcGIS Maps SDK for JavaScript 5.x AI
  Components (BETA): the arcgis-assistant component and its built-in agents
  (navigation, data-exploration, help, knowledge) plus custom agents built with
  LangGraph for natural-language map interaction. Use this skill whenever the user
  adds a conversational AI assistant to a map or builds natural-language data
  exploration. Note: the assistant binds to 2D arcgis-map only (no SceneView), built-in
  agents need a web map (item-id), and 5.1 custom agents can use agent-utils
  (FunctionAgent, LLMAgent) instead of a hand-written LangGraph graph.
lang: en
version: 0.3.0
status: beta
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: new-in-5.0
tags:
  - ai
  - assistant
  - agents
  - langgraph
  - natural-language
  - beta
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/ai-components@5.1.27"
  - "@arcgis/map-components@^5.1"
  # Custom agents only (must use a bundler — not available via CDN):
  - "@langchain/langgraph"
  - "@langchain/core@^1.3.0"
  - "zod"
maintainer: "GeoAI LATAM"
license: MIT
---

# AI Components (Beta)

> **When to use:** Activate this skill whenever the user adds a conversational AI assistant to a map
> or builds natural-language data exploration. This package is **beta**.

## Overview

AI Components add a conversational assistant whose agents act on the map via natural language.

- **Problem it solves:** letting users explore, navigate, and analyze maps by chatting.
- **Who it serves:** developers building assistive, agentic map UIs.
- **Pattern it teaches:** drop `arcgis-assistant`, register agents, bind to the map.
- **What it does NOT cover:** the underlying map (see `arcgis-core-maps`) or charts (see `arcgis-charts`).

> ⚠️ **Beta:** the AI Components API changes between 5.x releases (5.1 broke the orchestrator↔agent
> contract — see below). Pin versions and re-test on upgrade.
>
> ⚠️ **2D only:** `arcgis-assistant` binds to `arcgis-map` (MapView) — **not** `arcgis-scene`
> (SceneView). For 3D, see *Concept 4*.
>
> ⚠️ **ArcGIS Online only:** the assistant needs a signed-in **named user** of an ArcGIS Online org.
> Enterprise is not supported yet (planned ~12.2, late 2026). API keys can't enable it in public apps.

## Quick Start

```typescript
import "@arcgis/ai-components/components/arcgis-assistant";
import "@arcgis/ai-components/components/arcgis-assistant-navigation-agent";
// <arcgis-map id="myMap" item-id="<webmap-id>"></arcgis-map>
// <arcgis-assistant reference-element="#myMap">
//   <arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent>
// </arcgis-assistant>
```

The assistant needs **at least one registered agent** (built-in or custom) to function.

## Decision Tree

1. **Want an out-of-the-box chat assistant on a 2D web map?**
   - Yes → `arcgis-assistant` + built-in agents.

2. **Which built-in capabilities?**
   - Navigation (go to places / move the view), data-exploration (query, statistics, filter),
     help (in-app help), knowledge (explore knowledge-graph data — 5.1+).

3. **Domain-specific behavior, custom tools, or a 3D scene?**
   - Yes → build a **custom agent** with LangGraph (`AgentRegistration` + `createGraph`).

**Default:** `arcgis-assistant` + built-in agents bound to a 2D map. Add custom agents for domain logic.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/ai-components/components/arcgis-assistant";
import "@arcgis/ai-components/components/arcgis-assistant-data-exploration-agent";
```

### Dynamic Imports (CDN) — built-in agents only

```javascript
// The unified 5.x CDN includes ai-components; reference the custom elements directly.
const script = "https://js.arcgis.com/5.1/";
// ⚠️ Custom agents CANNOT be built via CDN — they need a bundler (npm/yarn).
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: The assistant + agents (orchestrator pattern)

`arcgis-assistant` hosts a chat UI backed by an **LLM orchestrator**. On each prompt the orchestrator
detects intent and routes to one or more registered **agents**. It never runs tools itself — each
agent owns its own logic. Each agent = **system prompt + context + tools + output**.

Built-in agents (5.1):

| Component | Capability |
|---|---|
| `arcgis-assistant-navigation-agent` | Go to places / move the view |
| `arcgis-assistant-data-exploration-agent` | Query attributes, statistics, spatial proximity, **filter features** |
| `arcgis-assistant-help-agent` | In-app help |
| `arcgis-assistant-knowledge-agent` | Explore knowledge-graph data (services, maps, link charts) — **new in 5.1** |

> **There is no `layer-filter` agent.** Filtering is done by the **data-exploration** agent.

### Concept 2: Binding to the map (2D only)

Bind the assistant via `reference-element` (an `arcgis-map` / its `id`) so built-in agents can act on
its layers, view, and filters. It is **only scoped to `arcgis-map` elements** — no SceneView.
`reference-element` is **required when ArcGIS built-in agents are registered**.

For data-exploration to work, the web map's feature layers need **AI vector embeddings** generated in
ArcGIS Online (*Item → Settings → Manage AI vector embeddings → Generate embeddings*).

Built-in agents need a **web map** (`item-id`), not a map assembled in code. Measured on 5.1.27: with
a navigation agent on `<arcgis-map basemap="osm">`, the assistant emits
`arcgisError("WebMap portal item is missing.")` on mount and `submitMessage()` rejects with
`Orchestrator not initialized yet.` `reference-element` accepts `"myMap"` or `"#myMap"`.

### Concept 3: Custom agents (agent-utils or LangGraph)

**5.1 shortcut — `agent-utils`.** `FunctionAgent` (your function is the agent), `LLMAgent` (a prompt
template + model tier + optional tools and Zod schemas) and `WorkflowAgent` with sequential, parallel,
router, switch, loop and conditional workflows build the LangGraph graph for you. Their
`.registration` is the `AgentRegistration` the assistant expects:

```typescript
import { FunctionAgent } from "@arcgis/ai-components/agent-utils/FunctionAgent.js";

const layerCount = new FunctionAgent({
  name: "LayerCountAgent", // id is derived: "layercountagent"
  description: "Counts the layers in the map. Use it when users ask how many layers there are.",
  execute: async () => `The map has ${mapEl.map?.layers.length ?? 0} layers.`, // string → chat reply
});

agentEl.agent = layerCount.registration; // agentEl is an <arcgis-assistant-agent>
```

Measured: the compiled graph of a `FunctionAgent` runs with no LLM and returns `outputMessage`, and
`arcgis-assistant-agent` accepts `.registration`. As of 5.1 these classes only use Esri's hosted model.

**Hand-written LangGraph** (full control, or your own LLM behind your own backend). It is an
`AgentRegistration` object:

```typescript
import { StateGraph } from "@langchain/langgraph/web";

export const MyAgent = {
  id:          "my-agent",              // unique, snake-case
  name:        "My Agent",              // human-readable
  description: "…what it does + example prompts + when NOT to use…", // CRITICAL for routing
  createGraph: () => new StateGraph(MyWorkspace) /* …nodes/edges… */, // return UNCOMPILED graph
  workspace:   MyWorkspace,             // LangGraph AnnotationRoot (must expose outputMessage)
};
```

Register it (built-in agents optional):

```tsx
<arcgis-assistant-agent agent={MyAgent} context={{ map, view, graphicsLayer }} />
```

Tools reach the runtime map via `config?.configurable?.context`. Requires a bundler +
`@langchain/langgraph @langchain/core zod`. See `references/api-detail.md` and the repo's
`CUSTOM_AGENTS_GUIDE.md` for the full two-node graph pattern.

### Concept 4: 3D scenes — the workaround

The assistant will not bind to `arcgis-scene`. But a **custom agent's tools are your own code**, so
they can drive a `SceneView` you pass in via `context`. Pattern for a 3D/digital-twin demo:

- Register **only** custom agent(s) (no built-in ArcGIS agents) → `reference-element` isn't required.
- Pass `{ scene, view: sceneView, graphicsLayer }` as `context`.
- Tools call `view.goTo(...)`, filter `SceneLayer`s, toggle floors, set environment/daylight, etc.

Validate in your build: this is beta and undocumented for 3D.

## Common Pitfalls (Top 3)

### Pitfall 1: Assuming 3D SceneView support

```typescript
// ❌ Anti-pattern
// <arcgis-assistant reference-element="#myScene"> … </arcgis-assistant>  // arcgis-scene NOT supported
```

```typescript
// ✅ Correct
// 2D: reference-element points to an arcgis-map.
// 3D: custom-agent-only; drive the SceneView from your tools via context (Concept 4).
```

**Impact:** built-in agents silently do nothing against a scene.

### Pitfall 2: Missing a registered agent (or the wrong version pin)

```typescript
// ❌ Anti-pattern
// <arcgis-assistant reference-element="#myMap"></arcgis-assistant>  // no agents
"@arcgis/ai-components": "^5"                                        // floats across breaking beta
```

```typescript
// ✅ Correct
// Register ≥1 agent; pin the exact version in package.json and re-test on upgrade:
// "@arcgis/ai-components": "5.1.27"
```

**Impact:** the assistant can't respond; beta bumps break the orchestrator↔agent contract.

### Pitfall 3: Exposing it without guardrails / auth assumptions

```typescript
// ❌ Anti-pattern
// Assuming API keys or public accounts work; shipping against sensitive data unscoped
```

```typescript
// ✅ Correct
// Named-user OAuth sign-in (Online org, AI assistants enabled); scope agents/data.
```

**Impact:** sign-in failures at runtime; the assistant surfaces data you didn't intend.

## When to Read references/

| If you need... | Read |
|---|---|
| Assistant / agent attributes, events, methods, custom-agent API | `references/api-detail.md` |
| Assistant + custom-agent setup examples | `references/examples.md` |
| More pitfalls (extended) | `references/pitfalls.md` |
| Deep custom-agent (LangGraph) build guide | repo `CUSTOM_AGENTS_GUIDE.md` |

## Related Skills

- `arcgis-core-maps` — the map the assistant acts on
- `arcgis-layers` — the data it explores
- `arcgis-knowledge-graphs` — data the knowledge agent explores
- `arcgis-3d-layers` / `arcgis-scene-environment` — 3D layers/environment a custom agent can drive
- `arcgis-charts` — charts for data exploration

## Reference Samples

- [AI components (beta) — reference](https://developers.arcgis.com/javascript/latest/references/ai-components/)
- [Intro to agentic mapping apps](https://developers.arcgis.com/javascript/latest/agentic-apps/ai-introduction/)
- [Custom agents](https://developers.arcgis.com/javascript/latest/agentic-apps/ai-custom-agents/)
- [AI Assistant sample](https://developers.arcgis.com/javascript/latest/sample-code/ai-assistant/)
- [FAQ](https://developers.arcgis.com/javascript/latest/agentic-apps/ai-faq/)

## Changelog

- **0.3.0** (2026-10-27): Validated against 5.1.27 (`tests/runtime/casos/arcgis-ai-components.ts`).
  Imports moved to `components/<tag>` (`dist/components` is not in the package's exports: Vite
  rejects it). Added the 5.1 `agent-utils` path, the web-map requirement of built-in agents and the
  `@langchain/core` pin; filler pitfalls replaced by measured ones.
- **0.2.0** (2026-07-15): Corrected agent list (removed non-existent `layer-filter`; added `knowledge`
  agent). Documented 2D-only `reference-element`, ArcGIS Online / named-user auth requirements, the
  5.1 structured orchestrator↔agent contract, the LangGraph custom-agent API, and the 3D-scene
  workaround.
- **0.1.0** (2026-05-31): Initial release (beta).
