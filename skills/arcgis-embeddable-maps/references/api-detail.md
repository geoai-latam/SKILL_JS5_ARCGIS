# API Reference: Embeddable Maps

Checked against the Esri reference and in Chromium on 2026-10-27.

## Table of Contents

- [Delivery](#delivery)
- [arcgis-embedded-map](#arcgis-embedded-map)
- [Notes](#notes)

---

## Delivery

Embeddable Maps are **CDN-only**, with their own script (not the unified SDK script):

```html
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
```

There is no `@arcgis/embeddable-components` npm package. The 4.x path
`https://js.arcgis.com/embeddable-components/4.33/arcgis-embeddable-components.esm.js` still answers,
but `/embeddable-components/5.0/` and `/5.1/` under that pattern are 404.

---

## arcgis-embedded-map

| Attribute | Type | Default | Description |
|---|---|---|---|
| `item-id` | string | — | The saved WebMap portal item id |
| `portal-url` | string | `https://www.arcgis.com` | Portal (ArcGIS Enterprise) |
| `api-key` | string | `""` | API key for items/services that need one |
| `theme` | `light` \| `dark` | `light` | UI theme |
| `center` / `scale` / `extent` | — | from the WebMap | Initial view |
| `legend-enabled` | boolean | `false` | Legend panel |
| `bookmarks-enabled` | boolean | `false` | Bookmarks panel |
| `basemap-gallery-enabled` | boolean | `false` | Basemap gallery |
| `heading-enabled` | boolean | `false` | Title heading |
| `information-enabled` | boolean | `false` | Item information |
| `share-enabled` | boolean | `false` | Share button |
| `locate-enabled` / `track-enabled` | boolean | `false` | Geolocation (needs HTTPS) |
| `floor-filter-enabled` | boolean | `false` | Floor filter (indoor maps) |
| `time-zone-label-enabled` | boolean | `false` | Time zone label |
| `scroll-enabled` | boolean | `false` | Mouse-wheel zoom |
| `fullscreen-disabled` | boolean | `false` | Hide the fullscreen button |

Read-only in script: `el.webMap` (the loaded `WebMap`). Method: `componentOnReady()`.

---

## Notes

- For private items, the viewer needs access (public share, or an `api-key` that covers it).
- For custom layers/logic, use `@arcgis/map-components` / `@arcgis/core` instead.
