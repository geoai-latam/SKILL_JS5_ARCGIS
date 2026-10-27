# Agent Guide: arcgis-ai-components (BETA)

Quick-reference for AI Components. Read before adding an assistant. SDK 5.1.

## Quick Decision Tree

1. **Chat assistant on a 2D web map?** → `arcgis-assistant` + built-in agents.
2. **Capabilities?** → navigation / data-exploration / help / knowledge (5.1+). *(No `layer-filter` — filtering is in data-exploration.)*
3. **Domain logic, custom tools, or a 3D scene?** → custom agent: `agent-utils` (`FunctionAgent`,
   `LLMAgent`, workflows — 5.1) or a hand-written LangGraph graph.

## Setup Checklist

- [ ] Pin `@arcgis/ai-components` exactly (beta; 5.1 broke the orchestrator↔agent contract).
- [ ] Import from `@arcgis/ai-components/components/<tag>` — `dist/components/...` is not exported (Vite fails).
- [ ] Built-in agents need a **web map** (`item-id`): otherwise `WebMap portal item is missing.`
- [ ] With pnpm, add `@langchain/core@^1.3.0` directly (else `Missing "./utils/gateway" specifier`).
- [ ] Register **≥1 agent** (built-in or custom) — the assistant needs one to work.
- [ ] Bind built-in agents via `reference-element` → **`arcgis-map` only (2D, no SceneView)**.
- [ ] Auth: named-user OAuth sign-in to an **ArcGIS Online** org with AI assistants enabled. No API keys, no Enterprise yet.
- [ ] data-exploration needs **AI vector embeddings** generated on the web map's layers.
- [ ] Custom agents: bundler + `@langchain/langgraph @langchain/core zod`; `createGraph` returns an
  **uncompiled** graph; workspace exposes `outputMessage` (a 5.1 `FunctionAgent`/`LLMAgent` does both for you).
- [ ] Scope/guard the data the assistant can access.

## Anti-patterns (one-liner reminders)

- ❌ Expecting `arcgis-scene`/SceneView to work with `reference-element` (2D only).
- ❌ Floating beta versions (`^5`).
- ❌ `import "@arcgis/ai-components/dist/components/..."` (type-checks, fails in Vite/Node).
- ❌ Built-in agents on a map with only `basemap=` (no web map → orchestrator never initializes).
- ❌ Assistant with no registered agent.
- ❌ Assuming API keys / public accounts / Enterprise work for the assistant.
- ❌ Custom agent whose workspace/nodes don't set `outputMessage` (blank chat).

## 3D scenes (workaround)

The assistant won't bind a scene, but a **custom agent's tools are your own code**. Register only
custom agents (so `reference-element` isn't required), pass the `SceneView` in `context`, and drive
it from tools. See SKILL Concept 4 + `examples.md` Example 4.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — assistant / agents / custom-agent API
- `references/examples.md` — setup + custom-agent + 3D examples
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-assistant.ts`
- (repo) `CUSTOM_AGENTS_GUIDE.md` — deep LangGraph build guide
