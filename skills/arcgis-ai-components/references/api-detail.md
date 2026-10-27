# API Reference: AI Components (Beta)

> SDK 5.1 ("latest"). Beta — API changes between releases. Pin the version.

## Table of Contents

- [arcgis-assistant](#arcgis-assistant)
- [Built-in agents](#built-in-agents)
- [arcgis-assistant-agent (custom agents)](#arcgis-assistant-agent-custom-agents)
- [agent-utils (5.1)](#agent-utils-51)
- [AgentRegistration (custom agent shape)](#agentregistration-custom-agent-shape)
- [Requirements & auth](#requirements--auth)
- [5.1 breaking change: structured contract](#51-breaking-change-structured-contract)
- [Notes](#notes)

---

## arcgis-assistant

`@arcgis/ai-components/components/arcgis-assistant`

Chat UI backed by an LLM **orchestrator** that routes prompts to registered agents. Requires **≥1
registered agent** (built-in or custom) as a child.

### Properties / attributes

| Property | Attribute | Type | Notes |
|---|---|---|---|
| `referenceElement` | `reference-element` | `ArcgisMap \| string \| null` | The map (or its `id`) the assistant acts on. **Only scoped to `arcgis-map` — no SceneView.** Required when ArcGIS built-in agents are registered. |
| `heading` | `heading` | `string \| undefined` | Title at the top |
| `description` | `description` | `string \| undefined` | Context text below the heading |
| `entryMessage` | `entry-message` | `string \| undefined` | Welcome/guidance message on load |
| `suggestedPrompts` | — | `string[]` | Initial prompt suggestions (2–3 recommended) |
| `keepSuggestedPrompts` | `keep-suggested-prompts` | `boolean` | Keep suggestions after first submit |
| `messages` | — | `Collection<ChatMessage>` | Chat history |
| `copyEnabled` | `copy-enabled` | `boolean` | Copy-to-clipboard on messages |
| `feedbackEnabled` | `feedback-enabled` | `boolean` | Thumbs up/down |
| `logEnabled` | `log-enabled` | `boolean` | Detailed log (debugging) |
| `assistantAvatarEnabled` | `assistant-avatar-enabled` | `boolean` | Toggle avatar (5.1+) |
| `streamingDisabled` | `streaming-disabled` | `boolean` | Disable progressive streaming (5.1+) |
| `awaitingResponse` | readonly | `boolean` | Processing indicator (5.1+) |
| `awaitingResponseStep` | readonly | `string` | Current status message (5.1+) |
| `interrupt` | readonly | `Interrupt \| null` | Active human-in-the-loop interrupt (5.1+) |

### Methods

- `submitMessage(message)` → `Promise` — submit a user message programmatically
- `clearChatHistory()` → `Promise` — clear all messages
- `componentOnReady()` → `Promise<this>` — resolves when loaded
- `submitInterrupt(response)` / `cancelInterrupt()` — human-in-the-loop (5.1+)

### Events

`arcgisReady`, `arcgisSubmit` (string), `arcgisResponse` (AssistantMessage, 5.1+), `arcgisError`
(Error), `arcgisCancel`, `arcgisFeedback` (AssistantMessage), `arcgisPromptSelect` (5.1+),
`arcgisInterrupt` / `arcgisInterruptSubmit` / `arcgisInterruptCancel` (5.1+), `arcgisSlottableRequest`
(5.1+).

### Slots

`header-actions-start` / `header-actions-end`, `message-starter`, `messages`, `message-loading`,
`entry-message`, `interrupt`, `chat-entry`, `entry-actions-start` / `entry-actions-end`,
`footer-content`.

---

## Built-in agents

| Component | Capability |
|---|---|
| `arcgis-assistant-navigation-agent` | Go to places / move the view |
| `arcgis-assistant-data-exploration-agent` | Query attributes, statistics (count/avg/min/max/sum, top-N), spatial proximity (intersect/within distance), **filter features** |
| `arcgis-assistant-help-agent` | In-app help |
| `arcgis-assistant-knowledge-agent` | Explore knowledge-graph data (services, maps, link charts) — **new in 5.1** |

**data-exploration limits:** 2D web maps + feature layers only. Cannot access external data or user
location, create charts/renderers/new layers, export results, or change symbology. Text responses +
feature filtering only. It CAN change map state by filtering.

> ⚠️ **No `layer-filter` agent exists.** Earlier drafts referenced one; filtering lives in
> data-exploration.

---

## arcgis-assistant-agent (custom agents)

`@arcgis/ai-components/components/arcgis-assistant-agent`

An **unrendered** wrapper that registers a custom agent to `arcgis-assistant`. Must be a child of the
assistant.

| Property | Type | Notes |
|---|---|---|
| `agent` | `AgentRegistration` | Required. The custom agent definition (must include a LangGraph `StateGraph`). |
| `context` | `TContext \| (() => Promise<TContext \| undefined>) \| undefined` | App/user context. Reaches tools via `config.configurable.context`. Static value or async resolver. |

Method: `componentOnReady()` → `Promise<this>`.

Register imperatively:

```javascript
const assistant = document.querySelector("arcgis-assistant");
const agentEl = document.createElement("arcgis-assistant-agent");
agentEl.agent = myCustomAgent;
assistant.appendChild(agentEl);
```

Or declaratively (React 19 / JSX):

```tsx
<arcgis-assistant-agent agent={myCustomAgent} context={{ map, view, graphicsLayer }} />
```

> Custom agents **cannot** be built via CDN — they need a bundler (npm/yarn).

---

## agent-utils (5.1)

`@arcgis/ai-components/agent-utils/<Class>.js`, all `@since 5.1`. They build the `StateGraph` and the
workspace for you; `.registration` is the `AgentRegistration` to pass to `arcgis-assistant-agent`.

| Class | Core logic | Key properties |
|---|---|---|
| `FunctionAgent` | your `execute(state, config)`; returns a string (chat reply) or an object (next step) | `name` (required; the `id` is derived from it in lowercase), `description`, `execute`, `inputSchema` / `outputSchema` (Zod, validated), `middlewares` |
| `LLMAgent` | a prompt template with `{variables}` taken from the state via `inputSchema` | `prompt`, `modelTier` (`"default" \| "advanced" \| "fast"`), `tools`, `outputSchema` (structured reply) |
| `WorkflowAgent` | composes agents with `SequentialWorkflow`, `ParallelWorkflow`, `RouterWorkflow`, `SwitchWorkflow`, `LoopWorkflow`, `ConditionalWorkflow` (`agent-utils/workflows/*.js`) | — |

Middlewares: `agent-utils/middlewares/humanInTheLoop.js` (pause for confirmation; pairs with
`submitInterrupt`) and `trace.js` (log steps). Measured on 5.1.27: a `FunctionAgent`'s compiled graph
runs without an LLM and its final state has `agentExecutionContext`, `outputMessage`, `summary`,
`status`. `LLMAgent` and the workflows were not run (they need Esri's model, i.e. a signed-in user).

---

## AgentRegistration (custom agent shape)

| Field | Type | Role |
|---|---|---|
| `id` | `string` | Unique id (snake-case) |
| `name` | `string` | Human-readable; may appear in tooling/output |
| `description` | `string` | **Critical for routing** — purpose, capabilities, example prompts, and explicit "do NOT use for…" clauses. Write in English. |
| `createGraph` | `() => StateGraph` | Returns an **uncompiled** LangGraph `StateGraph`. The orchestrator calls `createGraph().compile().invoke()`. Returning a compiled graph fails. |
| `workspace` | `AnnotationRoot` | LangGraph state schema. **Must expose `outputMessage`** — the orchestrator reads `state.outputMessage` to render the chat reply. |

Canonical two-node graph (`agentLLM → conditional → agentTools`):

```typescript
createGraph: () => new StateGraph(MyWorkspace)
  .addNode("agentLLM",   agentLLM)      // invokeToolPrompt() → decides tool calls
  .addNode("agentTools", agentTools)    // ToolNode(tools) → executes them
  .addEdge("__start__",  "agentLLM")
  .addConditionalEdges("agentLLM", hasToolCalls)  // "agentTools" | "__end__"
  .addEdge("agentTools", "__end__") as any
```

Tools are `tool()` fns from `@langchain/core/tools` with a Zod schema; they read the map via
`config?.configurable?.context` and return a **string** (shown in chat). Helpers live in
`@arcgis/ai-components/utils/index.js` (`invokeToolPrompt`, `sendTraceMessage`, `ChatHistory`, …).

Install (custom agents): `npm i @arcgis/ai-components @langchain/langgraph @langchain/core zod`
(tested: LangGraph 1.2, LangChainJS 1.3, Zod 4). With pnpm, install `@langchain/core@^1.3.0`
directly: `@arcgis/ai-components@5.1.27` let pnpm pair `langchain@1.5` (wants core ^1.3) with core
1.1, and Vite failed with `Missing "./utils/gateway" specifier in "@langchain/core"`.

You may use **your own LLM** only with a hand-written LangGraph agent and your own backend; built-in
agents and the `agent-utils` classes use Esri's hosted model. Model tiers: `default`, `advanced`, and
`fast` (new in 5.1, GPT-5.4-nano). The types warn that the model behind a tier can change outside
semver, so re-test prompts on every upgrade.

See the repo `CUSTOM_AGENTS_GUIDE.md` for the full pattern (workspace reducers, `ToolNode`,
`sendTraceMessage`, layer fuzzy-matching, geometry-operator `load()`).

---

## Requirements & auth

- Signed-in **named user** of an ArcGIS Online org (no trial/public accounts). Sign-in required even
  for public web maps.
- Org admin must enable AI assistants (*Organization Settings → AI assistants*); disable *Block Esri
  apps while in beta* if blocked.
- **API keys cannot** enable AI components in public apps → use OAuth2 named-user sign-in.
- **ArcGIS Enterprise: not supported yet** (planned ~12.2, late 2026). The orchestrator/LLM runs via
  ArcGIS Online.
- **Free during beta**; pricing TBD before GA.
- Built-in agents need a **web map** (`item-id`). Measured: on a map with only `basemap=`, the
  assistant emits `arcgisError("WebMap portal item is missing.")` and `submitMessage()` rejects with
  `Orchestrator not initialized yet.`
- Sign-in is asked on the **first message**, not on mount. Measured: an assistant with only a custom
  agent reaches `arcgisReady`; the first `submitMessage()` opens the sign-in dialog and stays pending.

---

## 5.1 breaking change: structured contract

The orchestrator↔agent contract moved from message-only exchanges to **structured inputs/outputs**.
Agents now read from **`agentExecutionContext`** and return a structured **`AgentResult`** (with
`status` and `summary`). 5.0 agents may break on upgrade — migrate accordingly. 5.1 also adds new
agent utility classes/functions and assistant primitives for richer structured responses.

---

## Notes

- The package is **beta** — pin the version and re-test on upgrades.
- The unified 5.x CDN includes `ai-components` (built-in agents only).
- `reference-element` accepts **`arcgis-map` only** — no `arcgis-scene`/SceneView. For 3D, drive a
  SceneView from a custom agent's tools (see SKILL Concept 4).
- Review what data/agents the assistant can access before shipping.
