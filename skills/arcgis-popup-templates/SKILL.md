---
name: arcgis-popup-templates
description: >
  Configure popups with PopupTemplate in the ArcGIS Maps SDK for JavaScript 5.0:
  title and content templating with field placeholders, fieldInfos with
  formatting, media and chart content, and custom HTML via a content function.
  Use this skill whenever the user customizes what appears when a feature is
  clicked, formats popup fields, or builds custom popup content.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: interaction
tags:
  - popup
  - popuptemplate
  - fieldinfos
  - content
  - formatting
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Popup Templates

> **When to use:** Activate this skill whenever the user customizes popup title/content, formats
> fields, or builds custom HTML shown when a feature is clicked.

## Overview

A `PopupTemplate` declares what a layer's popup shows: a title, content blocks, and field formatting.

- **Problem it solves:** turning raw attributes into a readable, formatted popup.
- **Who it serves:** developers presenting feature details on click.
- **Pattern it teaches:** placeholder templating + content blocks (fields/media/text/custom).
- **What it does NOT cover:** the click plumbing (see `arcgis-interaction`) or editing (see `arcgis-editing`).

## Quick Start

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";
layer.popupTemplate = new PopupTemplate({
  title: "{NAME}",
  content: [{ type: "fields", fieldInfos: [{ fieldName: "POP", label: "Population" }] }],
});
```

## Decision Tree

1. **Just fields and a title?**
   - Yes → string `title` + a `fields` content block.

2. **Need formatting (separators, dates, currency)?**
   - Yes → set `fieldInfos[].format`.

3. **Need bespoke HTML/widgets?**
   - Yes → a `content` function returning an HTMLElement.

**Default:** declarative `fields` content; reach for a function only for custom HTML.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";
```

### Dynamic Imports (CDN)

```javascript
const PopupTemplate = await $arcgis.import("@arcgis/core/PopupTemplate.js");
```

### Map Components (recommended for new projects)

```typescript
// Set layer.popupTemplate; the arcgis-map component renders the popup.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Placeholders

`title` and text content support `{FIELD}` placeholders resolved per feature. Combine fields and
static text, e.g. `"{NAME} — {POP} people"`.

### Concept 2: Content blocks

`content` can be an array of blocks: `fields` (table), `media` (charts/images), `text` (HTML),
and `attachments`. They render top to bottom.

### Concept 3: Custom content function

`content` may be a function `(feature) => HTMLElement | string`. Use it for bespoke layouts; it
receives the clicked feature's graphic.

## Common Pitfalls (Top 3)

### Pitfall 1: Field placeholder typos

```typescript
// ❌ Anti-pattern
new PopupTemplate({ title: "{Name}" }); // field is NAME
```

```typescript
// ✅ Correct
new PopupTemplate({ title: "{NAME}" });
```

**Impact:** the popup shows the literal `{Name}` text instead of the value.

### Pitfall 2: Forgetting outFields needed by the popup

```typescript
// ❌ Anti-pattern
new FeatureLayer({ url, outFields: ["NAME"], popupTemplate }); // popup uses POP too
```

```typescript
// ✅ Correct
new FeatureLayer({ url, outFields: ["NAME", "POP"], popupTemplate });
```

**Impact:** popup fields render blank because the data was never fetched.

### Pitfall 3: Returning a string of unsanitized HTML

```typescript
// ❌ Anti-pattern
content: (f) => `<div>${f.graphic.attributes.NOTES}</div>`; // injection risk
```

```typescript
// ✅ Correct
content: (f) => { const d = document.createElement("div"); d.textContent = f.graphic.attributes.NOTES; return d; };
```

**Impact:** untrusted attribute values can inject markup/script.

## When to Read references/

| If you need... | Read |
|---|---|
| PopupTemplate / content signatures | `references/api-detail.md` |
| Fields / media / custom examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-interaction` — the click that opens the popup
- `arcgis-layers` — set `outFields` the popup needs
- `arcgis-arcade` — expressions for popup content

## Reference Samples

- [PopupTemplate](https://developers.arcgis.com/javascript/latest/sample-code/popuptemplate-function/)
- [Popup with media](https://developers.arcgis.com/javascript/latest/sample-code/popup-multipleelements/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
