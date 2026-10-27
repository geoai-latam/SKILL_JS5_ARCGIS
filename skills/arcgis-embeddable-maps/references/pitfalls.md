# Extended Pitfalls: Embeddable Maps

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Bundling it like an npm component

### Anti-pattern

```typescript
import "@arcgis/embeddable-components/dist/components/arcgis-embedded-map"; // package does not exist
```

### Correct

```html
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
```

### Impact

Build fails resolving a non-existent package (npm answers 404).

### Diagnosis

Module-not-found for embeddable; use the CDN script.

---

## Pitfall 2: Guessing the versioned 4.x path for 5.x

### Anti-pattern

```html
<script type="module" src="https://js.arcgis.com/embeddable-components/5.1/arcgis-embeddable-components.esm.js"></script>
```

### Correct

```html
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
```

### Impact

Measured: that URL is 404 (the pattern stopped at 4.33). The element is never defined.

### Diagnosis

A 404 for the script in the Network tab and an empty element.

---

## Pitfall 3: Forgetting that wheel zoom is off

### Anti-pattern

```html
<arcgis-embedded-map item-id="..."></arcgis-embedded-map>
<!-- "the map does not zoom with the mouse" -->
```

### Correct

```html
<arcgis-embedded-map item-id="..." scroll-enabled></arcgis-embedded-map>
```

### Impact

Measured: `scrollEnabled` is `false` by default, so the wheel scrolls the page, not the map. That is
deliberate for embeds inside articles; enable it only when the map is the page.

### Diagnosis

Zoom works with the buttons but not with the wheel.

---

## Pitfall 4: Expecting the full arcgis-map API

### Anti-pattern

```typescript
const el = document.querySelector("arcgis-embedded-map") as HTMLElement & { view?: unknown };
console.log(el.view); // not part of the documented surface
```

### Correct

```typescript
// Read el.webMap (the loaded WebMap) and set attributes; for a view, events or custom layers,
// use arcgis-map from @arcgis/map-components.
```

### Impact

The documented surface is the attributes, `webMap` and `componentOnReady()`.

### Diagnosis

Undefined APIs; switch to the full component.

---

## Pitfall 5: Sharing private maps unintentionally

### Anti-pattern

```html
<!-- Embedding an item with an api-key that grants more than the page should show -->
```

### Correct

```html
<!-- Embed only items meant to be public, or scope the api-key to exactly those items. -->
```

### Impact

Whatever the key can read, every visitor of the page can read: the key is in the HTML.

### Diagnosis

Review the key's privileges and the item's sharing before publishing the page.
