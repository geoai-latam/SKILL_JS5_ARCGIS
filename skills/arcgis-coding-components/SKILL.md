---
name: arcgis-coding-components
description: >
  Embed an Arcade expression editor with the ArcGIS Maps SDK for JavaScript 5.1
  coding components: arcgis-arcade-editor with a profile (validation and
  autocomplete against real fields), diagnostics events, test data, the 5.1
  debugger and the Arcade assistant switch. Use this skill whenever the user
  builds an in-app editor for Arcade expressions (popups, labels, renderers).
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: new-in-5.0
tags:
  - coding
  - arcade-editor
  - code-editor
  - syntax-highlighting
  - components
requires:
  - arcgis-arcade
packages:
  - "@arcgis/coding-components@^5.1"
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Coding Components

> **When to use:** Activate this skill whenever the user builds an in-app editor for Arcade
> expressions (popups, labels, renderers, field calculation) with validation and autocomplete.

## Overview

`arcgis-arcade-editor` is a full Arcade editor: syntax highlighting, completion from a profile,
diagnostics, a test run against sample data, a debugger (5.1) and an AI assistant (beta).

- **Problem it solves:** letting users write Arcade in your app without breaking the map.
- **Who it serves:** developers building expression builders, admin tools and configurators.
- **Pattern it teaches:** editor `profile` = runtime profile; read `arcgisDiagnosticsChange`
  before applying `arcgisScriptChange`.
- **What it does NOT cover:** running Arcade (see `arcgis-arcade`) or SQL `where` clauses: the
  SQL editors of this package are internal (see Concept 4).

## Quick Start

```typescript
import "@arcgis/coding-components/components/arcgis-arcade-editor";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import type Graphic from "@arcgis/core/Graphic.js";

declare const layer: FeatureLayer; // loaded, so the editor knows its fields
declare const sample: Graphic;     // one feature to run the script against

const editor = document.querySelector("arcgis-arcade-editor")!;
editor.profile = { id: "popup", definitions: { $feature: layer } }; // same profile you run with
editor.testData = { profileVariableInstances: { $feature: sample } }; // shows the Run button
editor.script = "$feature.state_name";

let errores = 0;
editor.addEventListener("arcgisDiagnosticsChange", (e) => { errores = e.detail.length; });
editor.addEventListener("arcgisScriptChange", (e) => {
  if (errores === 0) saveExpression(e.detail); // only apply a script that validates
});
declare function saveExpression(script: string): void;
```

## Decision Tree

1. **Users write Arcade?**
   - Yes → `arcgis-arcade-editor` with the profile you will execute in.
2. **Users write a SQL `where` clause?**
   - The package's `arcgis-sql-expression-editor` and `arcgis-sql-layer-editor` are marked
     `@internal` in 5.1.27: not public API. Build the clause with your own UI and validate it with
     a `queryFeatureCount` on the layer.
3. **Generic code (JSON, CSS…)?**
   - `arcgis-code-editor` is also `@internal`; use Monaco or CodeMirror directly.

**Default:** `arcgis-arcade-editor`, always with a profile.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import "@arcgis/coding-components/components/arcgis-arcade-editor";
```

### Dynamic Imports (CDN)

```html
<!-- The core module script already registers the coding components (and charts, map, AI):
     a classic <script> without type="module" registers nothing -->
<script type="module" src="https://js.arcgis.com/5.1/"></script>
<arcgis-arcade-editor></arcgis-arcade-editor>
```

### Map Components (recommended for new projects)

```typescript
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/coding-components/components/arcgis-arcade-editor";
```

## Key Concepts

### Concept 1: The profile decides what is valid

`profile` is a predefined profile (`{ id: "popup" | "labeling" | "visualization" |
"field-calculation" | …, definitions: { $feature: layer } }`) or your own definition
(`{ variables: [...], bundles: [...] }`). With it, the editor knows the variables, the functions
and the layer's fields: measured with 5.1.27, `$feature.NO_EXISTE` is flagged with the list of real
field names. **Without a profile, even `$feature` is "not defined"**.

### Concept 2: Diagnostics are the validation

`arcgisDiagnosticsChange` sends the current list of diagnostics (empty when the script is valid);
`arcgisScriptChange` sends the text. There is no `isValid` property: keep the last diagnostics and
check them before applying the script. Syntax errors ("Unexpected end of Arcade expression"),
unknown fields and variables that the profile does not have all arrive this way.

### Concept 3: Test data, debugger and assistant

`testData = { profileVariableInstances: { $feature: graphic } }` shows the Run button; without
`testData` the run UX is hidden. `enableDebugger` (5.1) adds breakpoints and a console. The Arcade
assistant (beta) is **on by default** in 5.1 when the user is signed in to an ArcGIS Online org that
allows AI: set `disableAssistant = true` if your app must not offer it. `arcadeAssistant` is
deprecated in 5.1.

### Concept 4: Only the Arcade editor is public

In 5.1.27 the declarations mark `arcgis-sql-expression-editor`, `arcgis-sql-layer-editor`,
`arcgis-code-editor` and `arcgis-code-viewer` as `@internal`: they register and run, but they are
not documented API and can change in any release. The 5.1 `I*` type names (`IPredefinedProfile`,
`IEditorProfileDefinition`…) are deprecated in favour of the names without `I`.

## Common Pitfalls (Top 3)

### Pitfall 1: No profile

```typescript
// ❌ Anti-pattern
editor.script = "$feature.state_name"; // no profile set
```

```typescript
// ✅ Correct
editor.profile = { id: "popup", definitions: { $feature: layer } };
editor.script = "$feature.state_name";
```

**Impact:** measured with 5.1.27: without a profile a correct script gets "'$feature' is not
defined", and a wrong field name gets the same message: users cannot tell real errors apart.

### Pitfall 2: Editing with one profile, running with another

```typescript
// ❌ Anti-pattern: authored as a label, used in a popup (or the other way around)
editor.profile = { id: "labeling", definitions: { $feature: layer } };
```

```typescript
// ✅ Correct: the id of the place the expression will run
editor.profile = { id: "popup", definitions: { $feature: layer } };
```

**Impact:** measured: `Count(FeatureSetByName($map, "x"))` gets "'FeatureSetByName' is not
defined" and "'$map' is not defined" in `labeling`; the data-access bundle exists only in some
profiles. A script that validates in one place fails in the other.

### Pitfall 3: Applying the script without looking at the diagnostics

```typescript
// ❌ Anti-pattern
editor.addEventListener("arcgisScriptChange", (e) => { layer.labelingInfo[0].labelExpressionInfo.expression = e.detail; });
```

```typescript
// ✅ Correct
let errores = 0;
editor.addEventListener("arcgisDiagnosticsChange", (e) => { errores = e.detail.length; });
editor.addEventListener("arcgisScriptChange", (e) => {
  if (errores === 0) layer.labelingInfo[0].labelExpressionInfo.expression = e.detail;
});
```

**Impact:** every keystroke pushes a half-written expression into the map; there is no `isValid`
to rely on.

## When to Read references/

| If you need... | Read |
|---|---|
| Editor component attributes | `references/api-detail.md` |
| Arcade / SQL editor examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-arcade` — run the authored expressions
- `arcgis-layers` — the layer whose fields the profile exposes
- `arcgis-visualization` — where a renderer expression ends up

## Reference Samples

- [Coding components](https://developers.arcgis.com/javascript/latest/references/coding-components/)
- [Arcade editor](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Rewritten: the 0.1.0 guide had no working code (comments only).
  Real profile, `testData`, diagnostics and script events; measured what the editor flags with and without a
  profile; the SQL and code editors are `@internal` (no longer offered); assistant on by default and
  `disableAssistant`; `enableDebugger`; module CDN script. Run in `tests/runtime/casos/arcgis-coding-components.ts`.
- **0.1.0** (2026-05-31): Initial release.
