# Examples: Embeddable Maps

## Example 1: Minimal embed

**Use case:** show a saved WebMap on a page.

```html
<script type="module" src="https://js.arcgis.com/5.1/embeddable-components/"></script>
<arcgis-embedded-map item-id="10f5128431d44f9180d9936834100ac5"></arcgis-embedded-map>
```

**Notes:**

- No build tooling or npm install needed.
- Every tool attribute (`*-enabled`) is off by default.

---

## Example 2: Dark embed with legend and wheel zoom

**Use case:** a dark embed that lets readers scroll-zoom and read the legend.

```html
<arcgis-embedded-map
  item-id="10f5128431d44f9180d9936834100ac5"
  theme="dark"
  legend-enabled
  scroll-enabled
  style="height: 600px"
></arcgis-embedded-map>
```

**Notes:**

- `scroll-enabled` is off by default so the page scrolls past the map; turn it on deliberately.
- Measured: the element is 400 px tall without a style; set the height you want.

---

## Example 3: Read the loaded WebMap from script

**Use case:** show the map title next to the embed.

```typescript
const embed = document.querySelector("arcgis-embedded-map") as HTMLElement & { webMap?: { portalItem?: { title?: string } }; componentOnReady(): Promise<unknown> };
await embed.componentOnReady();
console.log(embed.webMap?.portalItem?.title); // "Educational Attainment and Household Size"
```

**Notes:**

- It's a DOM custom element: use attributes/properties.
- For richer behavior, switch to the full SDK.
