# Extended Pitfalls: Embeddable Maps

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Bundling it like an npm component

### Anti-pattern

```typescript
import "@arcgis/embeddable-components/dist/components/arcgis-embedded-map"; // 404
```

### Correct

```html
<script type="module" src="https://js.arcgis.com/5.0/"></script>
```

### Impact

Build fails resolving a non-existent package.

### Diagnosis

Module-not-found for embeddable; use the CDN script.

---

## Pitfall 2: Zero-height container

### Anti-pattern

```html
<arcgis-embedded-map item-id="..."></arcgis-embedded-map>
```

### Correct

```html
<style>arcgis-embedded-map { display:block; height: 400px; }</style>
```

### Impact

The embed collapses to no height.

### Diagnosis

Blank area; set a height.

---

## Pitfall 3: Wrong/duplicate SDK script

### Anti-pattern

```html
<!-- Loading both the CDN script and a bundled SDK build -->
```

### Correct

```html
<!-- Load the CDN script once; don't mix with a bundled app on the same page. -->
```

### Impact

Conflicting SDK instances.

### Diagnosis

Console warnings about multiple SDK loads; use one.

---

## Pitfall 4: Expecting events/APIs like the full element

### Anti-pattern

```typescript
embed.view.whenLayerView(...); // embeddable exposes a limited surface
```

### Correct

```typescript
// Use attributes; for programmatic APIs, use arcgis-map (full component).
```

### Impact

Missing methods on the embed.

### Diagnosis

Undefined APIs; switch to the full component.

---

## Pitfall 5: Sharing private maps unintentionally

### Anti-pattern

```html
<!-- Embedding a private item on a public page -->
```

### Correct

```html
<!-- Confirm the item's sharing level matches the audience. -->
```

### Impact

Map fails for anonymous users (or leaks if over-shared).

### Diagnosis

Load failures / access issues; check item sharing.
