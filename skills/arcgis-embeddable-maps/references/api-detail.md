# API Reference: Embeddable Maps

## Table of Contents

- [Delivery](#delivery)
- [arcgis-embedded-map](#arcgis-embedded-map)
- [Notes](#notes)

---

## Delivery

Embeddable Maps are **CDN-only**:

```html
<script type="module" src="https://js.arcgis.com/5.0/"></script>
```

There is no `@arcgis/embeddable-components` npm package.

---

## arcgis-embedded-map

| Attribute | Description |
|---|---|
| `item-id` | The saved WebMap portal item id |
| `theme` | `light` \| `dark` |
| `hide-legend` / `hide-bookmarks` / `hide-zoom` | Toggle default tools |
| `center` / `zoom` | Optional initial viewpoint overrides |

Default tools include zoom, legend, and bookmarks unless hidden.

---

## Notes

- For private items, the viewer must have access (public share or signed in).
- For custom layers/logic, use `@arcgis/map-components` / `@arcgis/core` instead.
