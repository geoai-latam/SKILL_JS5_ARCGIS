---
name: arcgis-embeddable-maps
description: >
  Embed a saved ArcGIS WebMap into any website with the ArcGIS Maps SDK for
  JavaScript 5.0 Embeddable Map — a CDN-only custom element (no npm package). Add
  the unified 5.0 script and an arcgis-embedded-map element with an item id; it
  ships default tools (zoom, legend, bookmarks). Use this skill whenever the user
  wants to quickly embed or share a map with minimal code.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
- **Pattern it teaches:** CDN script + `arcgis-embedded-map` with an `item-id`.
- **What it does NOT cover:** custom app logic (see `arcgis-core-maps`) or content discovery (`arcgis-portal-content`).

## Quick Start

```html
<script type="module" src="https://js.arcgis.com/5.0/"></script>
<arcgis-embedded-map item-id="<webmap-item-id>"></arcgis-embedded-map>
```

## Decision Tree

1. **Just need a saved map on a page?**
   - Yes → Embeddable Map (CDN script + element).

2. **Need custom layers/logic/interactions?**
   - Yes → build with Map Components / Core API instead (see `arcgis-core-maps`).

3. **No build tooling available?**
   - Yes → Embeddable Map is ideal (pure HTML/CDN).

**Default:** Embeddable Map for share/embed; the full SDK for custom apps.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```text
Not applicable — Embeddable Maps are CDN-only; there is no npm package to import.
```

### Dynamic Imports (CDN)

```html
<script type="module" src="https://js.arcgis.com/5.0/"></script>
```

### Map Components (recommended for new projects)

```text
For full apps use @arcgis/map-components (arcgis-map). Embeddable Maps are for quick embeds.
```

## Key Concepts

### Concept 1: CDN-only delivery

There is no `@arcgis/embeddable-components` on npm. You load the unified 5.0 script tag and use the
custom element directly — no bundler required.

### Concept 2: item-id drives everything

The `item-id` points to a saved WebMap; the element renders its basemap, layers, and popups, plus
default tools (zoom, legend, bookmarks).

### Concept 3: Attributes for tools/theme

Attributes toggle UI (e.g. legend, bookmarks) and theme. Configure the embed declaratively rather
than in code.

## Common Pitfalls (Top 3)

### Pitfall 1: Trying to npm install it

```bash
# ❌ Anti-pattern
pnpm add @arcgis/embeddable-components   # 404 — not on npm
```

```html
<!-- ✅ Correct -->
<script type="module" src="https://js.arcgis.com/5.0/"></script>
```

**Impact:** the install fails; Embeddable Maps ship only via CDN.

### Pitfall 2: Private webmap without access

```html
<!-- ❌ Anti-pattern -->
<arcgis-embedded-map item-id="<private-item>"></arcgis-embedded-map>
```

```html
<!-- ✅ Correct -->
<!-- Share the item publicly, or embed where the viewer is signed in. -->
```

**Impact:** the map fails to load for anonymous viewers.

### Pitfall 3: Expecting deep customization

```html
<!-- ❌ Anti-pattern -->
<!-- Trying to add custom layers/handlers to the embedded map -->
```

```html
<!-- ✅ Correct -->
<!-- Use @arcgis/map-components for custom apps; keep embeds simple. -->
```

**Impact:** you hit the embed's intentional limits; switch to the full SDK.

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

- **0.1.0** (2026-05-31): Initial release.
