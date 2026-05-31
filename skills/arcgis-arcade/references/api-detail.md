# API Reference: Arcade

## Table of Contents

- [createArcadeExecutor](#createarcadeexecutor)
- [Profiles](#profiles)
- [Where expressions are declared](#where-expressions-are-declared)

---

## createArcadeExecutor

`@arcgis/core/arcade.js`

`createArcadeExecutor(script, profile, options?) => Promise<ArcadeExecutor>`

| Param | Type | Description |
|---|---|---|
| `script` | `string` | The Arcade expression |
| `profile` | `Profile` | Declares available variables |
| `options` | `ExecutorOptions` | e.g. spatial reference |

`ArcadeExecutor.execute(context)` runs the script for a given `{ $feature, ... }`.

---

## Profiles

A `Profile` lists `variables`, each `{ name, type }`:

| Variable | Typical type | Context |
|---|---|---|
| `$feature` | `feature` | Popups, labels, renderers |
| `$layer` | `featureSet` | Layer-scoped aggregates |
| `$map` | `featureSetCollection` | Map-scoped data |

---

## Where expressions are declared

| Consumer | Property |
|---|---|
| PopupTemplate | `expressionInfos` + `{expression/...}` in content |
| Renderer / VisualVariable | `valueExpression` |
| Labeling | `labelExpressionInfo.expression` |
