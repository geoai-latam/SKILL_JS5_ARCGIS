# Examples: AI Components (Beta)

## Example 1: Add the assistant

**Use case:** a chat assistant bound to a map.

```html
<arcgis-map id="myMap" item-id="<webmap-id>"></arcgis-map>
<arcgis-assistant reference-element="#myMap"></arcgis-assistant>
```

```typescript
import "@arcgis/ai-components/dist/components/arcgis-assistant";
import "@arcgis/map-components/dist/components/arcgis-map";
```

**Notes:**

- `reference-element` lets agents act on the map.
- Beta — pin the package version.

---

## Example 2: Enable specific agents

**Use case:** only navigation + data exploration.

```html
<arcgis-assistant reference-element="#myMap">
  <arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent>
  <arcgis-assistant-data-exploration-agent></arcgis-assistant-data-exploration-agent>
</arcgis-assistant>
```

**Notes:**

- Enable only the agents you need.
- Fewer agents = tighter, more predictable behavior.

---

## Example 3: Pin the beta version

**Use case:** stable builds against a moving beta.

```jsonc
// package.json
{ "dependencies": { "@arcgis/ai-components": "5.0.19" } }
```

**Notes:**

- Avoid floating ranges for beta packages.
- Re-test when bumping the version.
