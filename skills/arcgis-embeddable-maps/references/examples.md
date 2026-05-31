# Examples: Embeddable Maps

## Example 1: Minimal embed

**Use case:** show a saved WebMap on a page.

```html
<script type="module" src="https://js.arcgis.com/5.0/"></script>
<arcgis-embedded-map item-id="<webmap-item-id>"></arcgis-embedded-map>
```

**Notes:**

- No build tooling or npm install needed.
- Default tools (zoom, legend, bookmarks) are included.

---

## Example 2: Themed embed with fewer tools

**Use case:** a dark, minimal embed.

```html
<arcgis-embedded-map
  item-id="<webmap-item-id>"
  theme="dark"
  hide-bookmarks
></arcgis-embedded-map>
```

**Notes:**

- Toggle tools via attributes.
- Style the surrounding container for sizing.

---

## Example 3: Tweak attributes from script

**Use case:** adjust the element after load.

```typescript
const embed = document.querySelector("arcgis-embedded-map");
embed?.setAttribute("theme", "light");
```

**Notes:**

- It's a DOM custom element — use attributes/properties.
- For richer behavior, switch to the full SDK.
