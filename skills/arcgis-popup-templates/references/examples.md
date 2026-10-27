# Examples: Popup Templates

## Example 1: Fields with formatting

**Use case:** show population with thousands separators.

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

layer.popupTemplate = new PopupTemplate({
  title: "{NAME}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        { fieldName: "POP", label: "Population", format: { digitSeparator: true, places: 0 } },
      ],
    },
  ],
});
```

**Notes:**

- `format.digitSeparator` adds thousands separators.
- Placeholders and `fields` blocks fetch `POP` themselves when the popup opens (measured).

---

## Example 2: Text block with placeholders

**Use case:** a one-line sentence mixing fields and text.

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

layer.popupTemplate = new PopupTemplate({
  title: "{NAME}",
  content: "Population: {POP}. Area: {AREA} km².",
});
```

**Notes:**

- A string `content` supports placeholders directly.
- Keep placeholders matching the exact field names.

---

## Example 3: Custom HTML content function

**Use case:** a bespoke layout built safely with DOM APIs.

```typescript
import PopupTemplate from "@arcgis/core/PopupTemplate.js";

layer.popupTemplate = new PopupTemplate({
  title: "{NAME}",
  outFields: ["NOTES"], // a function's fields are not fetched for you
  content: (feature: { graphic: { attributes: Record<string, unknown> } }) => {
    const div = document.createElement("div");
    div.textContent = `Notes: ${String(feature.graphic.attributes.NOTES ?? "")}`;
    return div;
  },
});
```

**Notes:**

- Build nodes with the DOM API; avoid raw HTML strings.
- The function receives the clicked feature's graphic.
