# Extended Pitfalls: AI Components (Beta)

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Built-in agents on a map that is not a web map

### Anti-pattern

```html
<arcgis-map id="myMap" basemap="osm" center="-74,4.6" zoom="5"></arcgis-map>
<arcgis-assistant reference-element="myMap">
  <arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent>
</arcgis-assistant>
```

### Correct

```html
<arcgis-map id="myMap" item-id="<webmap-id>"></arcgis-map>
<arcgis-assistant reference-element="myMap">
  <arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent>
</arcgis-assistant>
```

### Impact

Measured on 5.1.27: the assistant renders, emits `arcgisError("WebMap portal item is missing.")` on
mount, and every `submitMessage()` rejects with `Orchestrator not initialized yet.`

### Diagnosis

The chat UI looks fine but never answers → listen to `arcgisError`; load the map from a web map item
(with AI vector embeddings for data-exploration).

---

## Pitfall 2: Importing from `dist/components`

### Anti-pattern

```typescript
import "@arcgis/ai-components/dist/components/arcgis-assistant";
```

### Correct

```typescript
import "@arcgis/ai-components/components/arcgis-assistant";
```

### Impact

The `dist/...` path is not in the package's `exports`: Vite fails with `Missing
"./dist/components/arcgis-assistant" specifier` and Node with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
`tsc` resolves it by directory and reports nothing, so the error only shows at build time.

### Diagnosis

Type-checks but the dev server or build fails on the import → use `components/<tag>`.

---

## Pitfall 3: pnpm pairs incompatible LangChain packages

### Anti-pattern

```jsonc
// package.json — relying on @arcgis/ai-components' own ranges
{ "dependencies": { "@arcgis/ai-components": "5.1.27" } }
```

### Correct

```jsonc
{ "dependencies": { "@arcgis/ai-components": "5.1.27", "@langchain/core": "^1.3.0" } }
```

### Impact

With pnpm, `langchain@1.5.20` (wants `@langchain/core ^1.3.0`) was installed next to
`@langchain/core@1.1.48`; Vite failed with `Missing "./utils/gateway" specifier in "@langchain/core"`.

### Diagnosis

The error names `@langchain/core` from inside `langchain` → add `@langchain/core@^1.3.0` as a direct
dependency and reinstall.

---

## Pitfall 4: Expecting the assistant to work on a 3D scene

### Anti-pattern

```html
<!-- arcgis-scene is NOT a valid reference-element -->
<arcgis-assistant reference-element="#myScene"> … </arcgis-assistant>
```

### Correct

```tsx
<arcgis-assistant>
  {/* 3D: register ONLY custom agents; drive the SceneView from tools via context */}
  <arcgis-assistant-agent agent={SceneAgent} context={{ scene, view: sceneView }} />
</arcgis-assistant>
```

### Impact

`reference-element` is scoped to `arcgis-map` only; built-in agents silently do nothing on a scene.

### Diagnosis

Assistant loads but navigation/data-exploration never affect the 3D view → move logic into a custom
agent's tools (SKILL Concept 4).

---

## Pitfall 5: Wrong auth model (API key / public / Enterprise)

### Anti-pattern

```typescript
esriConfig.apiKey = "…"; // API keys do NOT enable AI components in public apps
// or pointing the app at an ArcGIS Enterprise portal
```

### Correct

```typescript
// OAuth2 named-user sign-in to an ArcGIS Online org with AI assistants enabled.
```

### Impact

The assistant fails to initialize or refuses to respond.

### Diagnosis

Works for map display but the assistant errors → check named-user sign-in, org AI-assistant setting,
and that you're on ArcGIS Online (not Enterprise — unsupported until ~12.2, late 2026). Sign-in is asked
on the **first message**, not on mount (measured: `arcgisReady` fires, the first `submitMessage()` opens
the sign-in dialog and stays pending), so anonymous visitors only find out when they type — keep a
non-AI path for essential tasks.

---

## Pitfall 6: Custom agent returns a blank chat reply

### Anti-pattern

```typescript
// workspace has no `outputMessage`, or graph nodes never set it
function respond(state: { messages: unknown[] }, response: { content?: unknown }) {
  return { messages: [...state.messages, response] };
}
```

### Correct

```typescript
function respond(state: { messages: unknown[] }, response: { content?: unknown }) {
  return { messages: [...state.messages, response], outputMessage: String(response.content ?? "") };
}
```

### Impact

The agent runs but the orchestrator renders an empty message (it reads `state.outputMessage`).

### Diagnosis

Tool executes / map updates but chat is blank → add `outputMessage` to the `AnnotationRoot` and set
it in every node. Also return the **uncompiled** graph from `createGraph` — or use a 5.1 `FunctionAgent` /
`LLMAgent`, which wire `outputMessage` for you.
