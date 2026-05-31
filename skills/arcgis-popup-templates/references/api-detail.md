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
| `outFields` | `string[]` | Fields the popup needs (besides the layer's) |
| `actions` | `ActionButton[]` | Custom action buttons |

---

## Content blocks

| `type` | Purpose | Key fields |
|---|---|---|
| `"fields"` | Attribute table | `fieldInfos` |
| `"text"` | HTML/text with placeholders | `text` |
| `"media"` | Charts / images | `mediaInfos` |
| `"attachments"` | Feature attachments | — |

A function `content` receives `{ graphic }` and returns `HTMLElement | string | Promise<...>`.

---

## FieldInfo format

`fieldInfos[].format`:

| Property | Type | Description |
|---|---|---|
| `digitSeparator` | `boolean` | Thousands separators |
| `places` | `number` | Decimal places |
| `dateFormat` | `string` | e.g. `"short-date"` |
