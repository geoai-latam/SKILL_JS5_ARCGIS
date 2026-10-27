# API Reference: Popup Templates

## Table of Contents

- [PopupTemplate](#popuptemplate)
- [Content blocks](#content-blocks)
- [FieldInfo format](#fieldinfo-format)

---

## PopupTemplate

`@arcgis/core/PopupTemplate.js`

| Property | Type | Description |
|---|---|---|
| `title` | `string \| function` | Template with `{FIELD}` placeholders |
| `content` | `string \| Content[] \| function` | Body of the popup |
| `outFields` | `string[]` | Fields a content **function** or expression reads (placeholders fetch their own) |
| `actions` | `ActionButton[]` | Custom action buttons |

---

## Content blocks

| `type` | Purpose | Key fields |
|---|---|---|
| `"fields"` | Attribute table | `fieldInfos` |
| `"text"` | HTML/text with placeholders | `text` |
| `"media"` | Charts / images | `mediaInfos` |
| `"attachments"` | Feature attachments | — |
| `"expression"` | Arcade-generated content | `expressionInfo` |
| `"relationship"` | Related records | `relationshipId` |

A function `content` receives `{ graphic }` and returns `HTMLElement | string | Promise<...>`. Returned strings are
sanitized (scripts and event handlers removed, measured).

---

## FieldInfo format

`fieldInfos[].format`:

| Property | Type | Description |
|---|---|---|
| `digitSeparator` | `boolean` | Thousands separators |
| `places` | `number` | Decimal places |
| `dateFormat` | `string` | e.g. `"short-date"`; shown in `view.timeZone` (default `"system"`) |

Without `format`, numbers show no thousands separator (measured: `7900000`).
