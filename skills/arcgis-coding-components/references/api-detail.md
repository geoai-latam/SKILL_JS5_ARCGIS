# API Reference: Coding Components

## Table of Contents

- [Components and their status](#components-and-their-status)
- [arcgis-arcade-editor](#arcgis-arcade-editor)
- [Profiles](#profiles)

---

## Components and their status

Checked against the declarations of `@arcgis/coding-components` 5.1.27.

| Component | Status |
|---|---|
| `arcgis-arcade-editor` | Public |
| `arcgis-sql-expression-editor` | `@internal` |
| `arcgis-sql-layer-editor` | `@internal` |
| `arcgis-code-editor` | `@internal` |
| `arcgis-code-viewer` | `@internal` |

Import path: `@arcgis/coding-components/components/<tag>`. CDN: the core module script
`<script type="module" src="https://js.arcgis.com/5.1/">` already registers them.

---

## arcgis-arcade-editor

| Property | Type | Description |
|---|---|---|
| `script` | `string` | The expression |
| `profile` | `PredefinedProfile` \| `EditorProfileDefinition` | What is valid (see below) |
| `testData` | `{ profileVariableInstances, spatialReference?, timeZone? }` | Enables the Run UX; without it, hidden |
| `enableDebugger` | `boolean` | Breakpoints, stepping, console (5.1) |
| `disableAssistant` | `boolean` | Turns off the Arcade assistant (beta), on by default (5.1) |
| `hideSideBar` | `boolean` | Minimal layout |
| `editorOptions` | Monaco options | e.g. `{ fontSize: 16 }` |
| `suggestions` / `snippets` | arrays | Your own suggestions and snippets |

| Event | Detail |
|---|---|
| `arcgisScriptChange` | `string`: the new script |
| `arcgisDiagnosticsChange` | `Diagnostic[]`: empty when valid |

| Method | Description |
|---|---|
| `setFocus()` | Focus the editor |

There is no `arcgisChange` event, no `isValid` property and no `layer` property.

---

## Profiles

```typescript
// Predefined: the id of the place the expression runs + the definitions it needs
editor.profile = { id: "popup", definitions: { $feature: layer } };
```

Predefined ids (`ArcadeProfileId` in 5.1.27) include `"popup"`, `"popup-element"`, `"labeling"`,
`"visualization"`, `"field-calculation"`, `"form-calculation"`, `"form-constraint"`,
`"feature-z"`, `"popup-feature-reduction"`, `"measure-visualization"` and more. A definition for
`$feature` can be a layer instance, `{ fields }`, `{ url }` or `{ portalItem: { id }, layerId }`.
Custom profiles use `{ variables: ProfileVariable[], bundles? }`.
