# API Reference: Coding Components

## Table of Contents

- [Editor components](#editor-components)
- [arcgis-arcade-editor](#arcgis-arcade-editor)
- [SQL & code editors](#sql--code-editors)

---

## Editor components

| Component | Import | Purpose |
|---|---|---|
| `arcgis-arcade-editor` | `dist/components/arcgis-arcade-editor` | Author Arcade with assistance |
| `arcgis-sql-expression-editor` | `dist/components/arcgis-sql-expression-editor` | Build SQL where clauses |
| `arcgis-code-editor` | `dist/components/arcgis-code-editor` | Generic code editing |
| `arcgis-arcade-coding-assistant` | `dist/components/arcgis-arcade-coding-assistant` | AI assist for Arcade |

---

## arcgis-arcade-editor

| Property | Description |
|---|---|
| `script` | The Arcade expression being edited |
| `profile` | Variable/function context (matches runtime) |
| `testData` | Optional feature for live results |

| Event | Description |
|---|---|
| `arcgisChange` | Fires as the script changes |

---

## SQL & code editors

| Editor | Key inputs |
|---|---|
| `arcgis-sql-expression-editor` | layer fields, current `where` |
| `arcgis-code-editor` | language, value |
