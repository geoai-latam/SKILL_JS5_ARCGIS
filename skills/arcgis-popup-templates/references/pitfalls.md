# Extended Pitfalls: Popup Templates

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.
> Measured with 5.1.27 in `tests/runtime/casos/arcgis-popup-templates.ts`.

## Pitfall 1: Setting popupTemplate but popups are disabled

### Anti-pattern

```typescript
layer.popupEnabled = false;
layer.popupTemplate = template; // never shows on click
```

### Correct

```typescript
layer.popupEnabled = true;
layer.popupTemplate = template;
```

### Impact

Measured: with `popupEnabled = false`, even `view.openPopup({ location, fetchFeatures: true })` did not show the
feature.

### Diagnosis

Clicking does nothing; check `layer.popupEnabled` and `view.popupEnabled`.

---

## Pitfall 2: A content function that returns nothing

### Anti-pattern

```typescript
const content = (f: { graphic: Graphic }) => { void fetchExtra(f).then(render); }; // returns undefined
```

### Correct

```typescript
const content = async (f: { graphic: Graphic }) => render(await fetchExtra(f)); // return the element (or a promise)
```

### Impact

Measured: the popup opened with the title and its buttons and an empty body. An async function that returns an
element rendered fine.

### Diagnosis

Empty popup body with async data; return the element or the promise.

---

## Pitfall 3: Attribute text with "<" shown as markup

### Anti-pattern

```typescript
new PopupTemplate({ content: "Notes: {NOTES}" }); // NOTES may contain user-typed "<b>" or "<"
```

### Correct

```typescript
new PopupTemplate({
  outFields: ["NOTES"],
  content: (f: { graphic: Graphic }) => {
    const p = document.createElement("p");
    p.textContent = `Notes: ${String(f.graphic.attributes.NOTES ?? "")}`; // shown literally
    return p;
  },
});
```

### Impact

Measured: an attribute `<b class="negrita">x</b><img src="y" onerror=...>` rendered a real `<b>` element; the
sanitizer removed the `onerror` and nothing ran. It is not a script risk, but user text is reinterpreted as HTML.

### Diagnosis

Notes that lose their "<" characters or turn bold; render them with `textContent`.

---

## Pitfall 4: Placeholders for fields that do not exist

### Anti-pattern

```typescript
new PopupTemplate({ title: "{NOMBRE}" }); // the field is NAME
```

### Correct

```typescript
new PopupTemplate({ title: "{NAME}" }); // case does not matter ({name} works), spelling does
```

### Impact

Measured: an unknown field renders as an empty string, not as the literal `{NOMBRE}`, so the typo is easy to miss.

### Diagnosis

A blank title or gap; check the name against `layer.fields`.

---

## Pitfall 5: Heavy work in the content function on every open

### Anti-pattern

```typescript
const content = (f: { graphic: Graphic }) => heavySyncRender(f); // recomputed each open
```

### Correct

```typescript
const cache = new Map<number, HTMLElement>();
const content = (f: { graphic: Graphic }) => {
  const id = f.graphic.getObjectId() as number;
  if (!cache.has(id)) cache.set(id, heavySyncRender(f));
  return cache.get(id)!;
};
```

### Impact

Sluggish popups for complex content (not measured).

### Diagnosis

Lag when opening popups; profile and cache.
