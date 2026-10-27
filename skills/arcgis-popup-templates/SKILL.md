---
name: arcgis-popup-templates
description: >
  Configure popups with PopupTemplate in the ArcGIS Maps SDK for JavaScript 5.1:
  title and content templating with field placeholders, fieldInfos with
  formatting (digit separators, dates and the view's time zone), media and chart
  content, and content functions (which need template.outFields). Use this skill
  whenever the user customizes what appears when a feature is clicked, formats
  popup fields, or builds custom popup content.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
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
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Popup Templates

> **When to use:** Activate this skill whenever the user customizes popup title/content, formats
> fields, or builds custom HTML shown when a feature is clicked.

## Overview

A `PopupTemplate` declares what a layer's popup shows: a title, content blocks, and field formatting.

- **Problem it solves:** turning raw attributes into a readable, correctly formatted popup.
- **Who it serves:** developers presenting feature details on click.
- **Pattern it teaches:** placeholder templating + content blocks; functions only for bespoke layouts.
- **What it does NOT cover:** the click plumbing (see `arcgis-interaction`) or editing (see `arcgis-editing`).

## Quick Start

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

layer.popupTemplate = new PopupTemplate({
  title: "{NAME}",
  content: [{
    type: "fields",
    fieldInfos: [
      { fieldName: "POP", label: "Population", format: { digitSeparator: true, places: 0 } },
      { fieldName: "CREATED", label: "Created", format: { dateFormat: "short-date" } },
    ],
  }],
});
view.timeZone = "UTC"; // if your dates are stored as UTC midnights (see Pitfall 2)
```

Measured with 5.1.27: without `digitSeparator`, 7900000 shows as `7900000`; with it, `7.900.000` in an `es` locale.

## Decision Tree

1. **Just fields and a title?**
   - Yes → string `title` + a `fields` content block. Placeholders fetch their own fields.

2. **Need formatting (separators, dates, decimals)?**
   - Yes → `fieldInfos[].format`; for dates also decide the time zone (`view.timeZone`).

3. **Need bespoke HTML?**
   - Yes → a `content` function returning an element, **plus** `outFields` on the template for every field it reads.

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
// Set layer.popupTemplate; the arcgis-map component renders it in arcgis-popup.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: Placeholders fetch their own fields

`title` and text content take `{FIELD}` placeholders. Measured: they are **case-insensitive** (`{Name}` and `{name}`
both showed `Bogotá` for a `NAME` field), an unknown field renders as empty, and on a service layer with
`outFields: ["areaname"]` a `{pop2000}` placeholder still showed `8008278`: the popup requested the field when it
opened, even though the hit-test graphic only carried `areaname` and `objectid`.

### Concept 2: Content blocks

`content` can be an array of blocks: `fields` (table), `media` (charts/images), `text` (HTML with placeholders),
`attachments`, `expression` (Arcade) and `relationship`. They render top to bottom.

### Concept 3: Content functions

`content` may be a function `({ graphic }) => HTMLElement | string | Promise<...>` (measured: the argument had only
`graphic`; an async function rendered fine). The SDK cannot see which fields a function reads, so it does not fetch
them: list them in the template's `outFields`. Strings returned from functions and text content are sanitized:
measured, `<img onerror>` and `<script>` were stripped and nothing ran, while harmless tags such as `<b>` were kept,
even when they came from an attribute value.

## Common Pitfalls (Top 3)

### Pitfall 1: A content function reading a field nobody requested

```typescript
// ❌ Anti-pattern
new FeatureLayer({ url, outFields: ["areaname"], popupTemplate: new PopupTemplate({
  content: (f: { graphic: Graphic }) => `Population: ${f.graphic.attributes.pop2000}`,
}) });
```

```typescript
// ✅ Correct
new PopupTemplate({
  outFields: ["pop2000"],
  content: (f: { graphic: Graphic }) => `Population: ${f.graphic.attributes.pop2000}`,
});
```

**Impact:** measured on a public service: `Population: undefined`; with `outFields: ["pop2000"]` on the template,
`8008278`. Declarative placeholders do not have this problem.

### Pitfall 2: Dates that show the previous day

```typescript
// ❌ Anti-pattern
{ fieldName: "CREATED", format: { dateFormat: "short-date" } } // stored as 2026-10-27T00:00Z
```

```typescript
// ✅ Correct
view.timeZone = "UTC"; // or the zone the data was captured in
```

**Impact:** measured in `America/Bogota`: the default `view.timeZone` is `"system"`, so a UTC midnight on 27/10/2026
showed `26/10/2026, 7:00 p. m.` (and `26/10/2026` with `short-date`). With `view.timeZone = "UTC"`: `27/10/2026`.

### Pitfall 3: Expecting thousands separators by default

```typescript
// ❌ Anti-pattern
{ fieldName: "POP", label: "Population" } // shows 7900000
```

```typescript
// ✅ Correct
const popInfo = { fieldName: "POP", label: "Population", format: { digitSeparator: true, places: 0 } };
```

**Impact:** measured: `7900000` without a format, `7.900.000` with `digitSeparator: true` (`es` locale).

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

- **0.2.0** (2026-10-27): SDK 5.1. Measured by opening real popups in `tests/runtime/casos/arcgis-popup-templates.ts`.
  All three old top pitfalls were false or overstated: placeholders are case-insensitive; the popup fetches the
  fields its placeholders use even if the layer's `outFields` lack them; and string HTML is sanitized (no script
  ran). New top pitfalls, measured: content functions do need `template.outFields` (`undefined` without it), UTC
  dates show the previous day under the default `view.timeZone` `"system"`, and numbers have no separators by
  default. Fixed two extended pitfalls that did not compile.
- **0.1.0** (2026-05-31): Initial release.
