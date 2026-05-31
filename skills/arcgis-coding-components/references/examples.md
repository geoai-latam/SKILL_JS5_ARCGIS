# Examples: Coding Components

## Example 1: Arcade editor

**Use case:** let users author a popup expression.

```typescript
import "@arcgis/coding-components/dist/components/arcgis-arcade-editor";

const editor = document.querySelector("arcgis-arcade-editor") as { script?: string; profile?: unknown };
editor.script = "Round($feature.POP / 1000)";
editor.profile = { variables: [{ name: "$feature", type: "feature" }] };
```

**Notes:**

- Match the profile to the runtime context.
- Read `arcgisChange` to capture edits.

---

## Example 2: SQL where editor

**Use case:** build a definition expression interactively.

```typescript
import "@arcgis/coding-components/dist/components/arcgis-sql-expression-editor";

const sqlEditor = document.querySelector("arcgis-sql-expression-editor") as { layer?: unknown };
sqlEditor.layer = featureLayer; // fields power autocomplete
```

**Notes:**

- The editor suggests field names from the layer.
- Validate before applying as `definitionExpression`.

---

## Example 3: Validate before applying

**Use case:** only apply valid expressions.

```typescript
const editor = document.querySelector("arcgis-arcade-editor");
editor?.addEventListener("arcgisChange", (e) => {
  // inspect validity/diagnostics on the event/element before using the script
  console.log("script changed", (e as CustomEvent).detail);
});
```

**Notes:**

- Gate `applyExpression` on the editor's validity.
- Show diagnostics to the user.
