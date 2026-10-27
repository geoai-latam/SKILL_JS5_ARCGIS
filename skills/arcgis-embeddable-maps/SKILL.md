---
name: arcgis-embeddable-maps
description: >
  Embed a saved ArcGIS WebMap in any site with the ArcGIS Maps SDK for JavaScript
  5.1 Embeddable Map: a CDN-only custom element (no npm package) loaded from its
  own script, js.arcgis.com/5.1/embeddable-components/ (the unified SDK script does
  not register it), plus an arcgis-embedded-map element with an item id. Tools are
  opt-in attributes (legend-enabled, bookmarks-enabled, ...). Use this skill
  whenever the user wants to embed or share a map with minimal code.
lang: en
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: new-in-5.0
tags:
  - embeddable
  - embed
  - webmap
  - share
  - cdn
requires:
  - arcgis-portal-content
packages: []
maintainer: "GeoAI LATAM"
license: MIT
---

# Embeddable Maps

> **When to use:** Activate this skill whenever the user wants to embed or share a saved WebMap with
> minimal code. Embeddable Maps are **CDN-only** — there is no npm package.

## Overview

The Embeddable Map renders a saved WebMap from one script tag and one custom element.

- **Problem it solves:** drop a configured map into any page without a build pipeline.
- **Who it serves:** content authors and developers embedding maps quickly.
- **Pattern it teaches:** the embeddable-components script + `arcgis-embedded-map` with an `item-id`.
- **What it does NOT cover:** custom app logic (see `arcgis-core-maps`) or content discovery (`arcgis-portal-content`).

## Quick Start

```html
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
<arcgis-embedded-map item-id="10f5128431d44f9180d9936834100ac5" legend-enabled></arcgis-embedded-map>
```

Measured with Chromium (2026-10-27): this registers the element and loads the public WebMap
("Educational Attainment and Household Size", 2 layers); `el.webMap.loadStatus === "loaded"`.

## Decision Tree

1. **Just need a saved map on a page?**
   - Yes → Embeddable Map (its own script + element).

2. **Need custom layers/logic/interactions?**
   - Yes → build with Map Components / Core API instead (see `arcgis-core-maps`).

3. **No build tooling available?**
   - Yes → Embeddable Map (pure HTML/CDN). The full SDK also works from the CDN
     (`https://js.arcgis.com/5.1/`), but that script does **not** include `arcgis-embedded-map`.

**Default:** Embeddable Map for share/embed; the full SDK for custom apps.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```text
Not applicable: @arcgis/embeddable-components is not on npm (404, checked 2026-10-27).
```

### Dynamic Imports (CDN)

```html
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
```

### Map Components (recommended for new projects)

```text
For full apps use @arcgis/map-components (arcgis-map). Embeddable Maps are for quick embeds.
```

## Key Concepts

### Concept 1: Its own CDN script

The embeddable components ship separately from the SDK:
`https://js.arcgis.com/5.1/embeddable-components/` (5.1). Measured: the unified
`https://js.arcgis.com/5.1/` script registers `arcgis-map`, charts and Calcite, but
`customElements.get("arcgis-embedded-map")` stays `undefined`: the tag renders as an empty
element, with no error. There is no npm package.

### Concept 2: item-id drives everything

The `item-id` points to a saved WebMap; the element renders its basemap, layers and popups. The
loaded `WebMap` is readable as `el.webMap`. `portal-url` points to ArcGIS Enterprise, and `api-key`
carries a key for items or services that need one.

### Concept 3: Tools are opt-in

Every tool attribute is a boolean that defaults to `false`: `legend-enabled`, `bookmarks-enabled`,
`basemap-gallery-enabled`, `heading-enabled`, `information-enabled`, `share-enabled`,
`locate-enabled`, `track-enabled`, `floor-filter-enabled`, `time-zone-label-enabled`,
`scroll-enabled` (mouse-wheel zoom). The only negative one is `fullscreen-disabled`. `theme` is
`light` or `dark`; `center`, `scale` and `extent` set the initial view.

## Common Pitfalls (Top 3)

### Pitfall 1: Loading the SDK script instead of the embeddable one

```html
<!-- ❌ Anti-pattern -->
<script type="module" src="https://js.arcgis.com/5.1/"></script>
<arcgis-embedded-map item-id="..."></arcgis-embedded-map>
```

```html
<!-- ✅ Correct -->
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
<arcgis-embedded-map item-id="..."></arcgis-embedded-map>
```

**Impact:** measured: the element is never defined, the page shows an empty box and the console
has no error. The same happens with `/5.0/`. Do not `npm install` it either: the package does not
exist.

### Pitfall 2: `hide-*` attributes

```html
<!-- ❌ Anti-pattern -->
<arcgis-embedded-map item-id="..." hide-bookmarks></arcgis-embedded-map>
```

```html
<!-- ✅ Correct -->
<arcgis-embedded-map item-id="..." legend-enabled></arcgis-embedded-map>
```

**Impact:** `hide-legend`, `hide-bookmarks` and `hide-zoom` are not attributes of the element
(not in its `observedAttributes`) and do nothing. The legend and bookmarks are already off: measured
`legendEnabled` and `bookmarksEnabled` are `false` unless you add the `*-enabled` attribute.

### Pitfall 3: Private webmap without access

```html
<!-- ❌ Anti-pattern -->
<arcgis-embedded-map item-id="<private-item>"></arcgis-embedded-map>
```

```html
<!-- ✅ Correct -->
<!-- Share the item publicly, or pass an api-key whose privileges cover it. -->
```

**Impact:** the map fails to load for anonymous viewers (not measured here: no private item was
used).

## When to Read references/

| If you need... | Read |
|---|---|
| Element attributes | `references/api-detail.md` |
| Embed / share examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-portal-content` — find the webmap item id
- `arcgis-core-maps` — build a custom app instead
- `arcgis-widgets-ui` — components for full apps

## Reference Samples

- [Embeddable components](https://developers.arcgis.com/javascript/latest/references/embeddable-components/)
- [Components overview](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. The skill did not work: the unified `js.arcgis.com/5.0/` script does not register
  `arcgis-embedded-map` (measured with 5.0 and 5.1: empty element, no error); the embeddable components have their
  own script, `js.arcgis.com/5.1/embeddable-components/`. The `hide-*` attributes do not exist: tools are opt-in
  `*-enabled` booleans, all `false` by default (legend and bookmarks were said to be on). The zero-height and
  duplicate-script pitfalls did not reproduce. Run in `tests/runtime/embebido.mjs`.
- **0.1.0** (2026-05-31): Initial release.
