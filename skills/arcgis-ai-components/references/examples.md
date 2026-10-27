# Examples: AI Components (Beta)

## Example 1: Add the assistant (2D web map)

**Use case:** a chat assistant bound to a 2D web map.

```html
<arcgis-map id="myMap" item-id="<webmap-id>"></arcgis-map>
<arcgis-assistant reference-element="#myMap"
  heading="My Assistant"
  description="Explore and navigate this map using natural language">
  <arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent>
  <arcgis-assistant-data-exploration-agent></arcgis-assistant-data-exploration-agent>
</arcgis-assistant>
```

```typescript
import "@arcgis/ai-components/components/arcgis-assistant";
import "@arcgis/ai-components/components/arcgis-assistant-navigation-agent";
import "@arcgis/ai-components/components/arcgis-assistant-data-exploration-agent";
import "@arcgis/map-components/components/arcgis-map";
```

**Notes:**

- `reference-element` accepts only `arcgis-map` (2D). It's required when built-in agents are registered.
- The assistant needs ≥1 registered agent. Enable only the ones you need — fewer = more predictable.
- For data-exploration, generate AI vector embeddings on the web map's feature layers in ArcGIS Online.

---

## Example 2: The four built-in agents

**Use case:** enable navigation + data-exploration + help + knowledge.

```html
<arcgis-assistant reference-element="#myMap">
  <arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent>
  <arcgis-assistant-data-exploration-agent></arcgis-assistant-data-exploration-agent>
  <arcgis-assistant-help-agent></arcgis-assistant-help-agent>
  <arcgis-assistant-knowledge-agent></arcgis-assistant-knowledge-agent>
</arcgis-assistant>
```

**Notes:**

- `knowledge` (5.1+) explores knowledge-graph data. There is **no** `layer-filter` agent — filtering
  is done by data-exploration.

---

## Example 3: Register a custom agent (LangGraph)

**Use case:** add domain tools the built-in agents don't cover.

```tsx
// React 19 / JSX
<arcgis-assistant reference-element="#myMap">
  <arcgis-assistant-data-exploration-agent></arcgis-assistant-data-exploration-agent>
  <arcgis-assistant-agent agent={MyAgent} context={{ map, view, graphicsLayer }} />
</arcgis-assistant>
```

```typescript
// MyAgent.ts (shape only — see CUSTOM_AGENTS_GUIDE.md for the full graph)
import { StateGraph } from "@langchain/langgraph/web";

export const MyAgent = {
  id:          "my-agent",
  name:        "My Agent",
  description: "Executes X on map layers. Use ONLY for X. Do NOT use for attribute queries or navigation. " +
               "Examples: 'do X on the parcels layer'.",
  createGraph: () => new StateGraph(MyWorkspace)
    .addNode("agentLLM", agentLLM)
    .addNode("agentTools", agentTools)
    .addEdge("__start__", "agentLLM")
    .addConditionalEdges("agentLLM", hasToolCalls)
    .addEdge("agentTools", "__end__") as any,
  workspace: MyWorkspace, // AnnotationRoot exposing `messages` + `outputMessage`
};
```

**Notes:**

- `description` drives orchestrator routing — be specific, add examples and "do NOT use" clauses.
- `createGraph` returns an **uncompiled** graph. `workspace` must expose `outputMessage`.
- Needs a bundler + `@langchain/langgraph @langchain/core zod` (no CDN).

---

## Example 4: Custom agent driving a 3D scene (digital-twin pattern)

**Use case:** the assistant controls a `SceneView` (no built-in ArcGIS agents).

```tsx
<>
  <arcgis-scene id="myScene" item-id="<webscene-id>"></arcgis-scene>
  <arcgis-assistant heading="Digital Twin Assistant">
    {/* No reference-element and no built-in ArcGIS agents → 3D is possible */}
    <arcgis-assistant-agent agent={SceneAgent} context={{ scene, view: sceneView, graphicsLayer }} />
  </arcgis-assistant>
</>
```

**Notes:**

- The assistant won't bind a scene via `reference-element`, but a **custom agent's tools are your own
  code** — pass the `SceneView` in `context` and drive it (`view.goTo(...)`, filter `SceneLayer`s,
  toggle floors, set daylight/weather, highlight 3D objects).
- Register **only** custom agents so `reference-element` isn't required. Validate — beta, undocumented for 3D.

---

## Example 5: Pin the beta version

**Use case:** stable builds against a moving beta.

```jsonc
// package.json
{ "dependencies": { "@arcgis/ai-components": "5.1.27", "@langchain/core": "^1.3.0" } }
```

**Notes:**

- Avoid floating ranges for beta packages. Re-test when bumping — 5.1 changed the orchestrator↔agent contract.
- `@langchain/core` is only needed directly with pnpm: without it, pnpm paired `langchain@1.5` with
  core 1.1 and Vite failed (`Missing "./utils/gateway" specifier`).

---

## Example 6: A custom agent with `FunctionAgent` (5.1, no hand-written graph)

**Use case:** a deterministic action the assistant can route to, without writing LangGraph.

```typescript
import "@arcgis/ai-components/components/arcgis-assistant";
import "@arcgis/ai-components/components/arcgis-assistant-agent";
import { FunctionAgent } from "@arcgis/ai-components/agent-utils/FunctionAgent.js";

const mapEl = document.querySelector("arcgis-map")!;
await mapEl.viewOnReady();
const home = mapEl.view.viewpoint.clone(); // the view the app opened with

const zoomHome = new FunctionAgent({
  name: "ZoomHomeAgent",
  description: "Returns the map to its initial extent. Use it when users ask to go back or reset the view.",
  execute: async () => {
    await mapEl.view.goTo(home);
    return "Back to the initial view.";
  },
});

const assistant = document.querySelector("arcgis-assistant")!;
const agentEl = document.createElement("arcgis-assistant-agent");
agentEl.agent = zoomHome.registration;
assistant.appendChild(agentEl);
```

**Notes:**

- `execute` returning a string ends the turn with that reply; returning an object passes it to the next
  step of a workflow. Add `inputSchema` / `outputSchema` (Zod) to validate.
- The `id` is the name in lowercase (`zoomhomeagent`). The `description` drives routing, as with any agent.
- Still needs a signed-in named user: the orchestrator runs on Esri's model.
