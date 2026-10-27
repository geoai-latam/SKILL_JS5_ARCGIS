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

`createArcadeProfile(name) => Profile` builds the profile of a context:
`"popup"`, `"popup-element"`, `"labeling"`, `"visualization"`, `"field-calculation"`,
`"form-calculation"`, `"form-constraint"`, `"aggregate-field"`, `"feature-z"`, and the
`-feature-reduction`, `-voxel` and `-imagery` popup variants.

| `ArcadeExecutor` member | Description |
|---|---|
| `execute(vars, ctx?)` | Synchronous; throws if `isAsync` |
| `executeAsync(vars, ctx?)` | Always works; required for FeatureSet functions |
| `executeAsyncBatch(items, toVars, ctx?)` | Many features at once (4.33) |
| `isAsync` | The script uses FeatureSet functions |
| `fieldsUsed` | Fields to request (`outFields`) |
| `geometryUsed` | The script reads geometry (`returnGeometry`) |
| `variablesUsed` | Profile variables the script touches (4.34) |

`ExecutorOptions`: `spatialReference`, `timeZone`, `cache` (5.0; `lruCache` is deprecated),
`services.portal` (for `GetUser()`).

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
