# Extended Pitfalls: Popup Templates

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Setting popupTemplate but popups are disabled

### Anti-pattern

```typescript
layer.popupEnabled = false;
layer.popupTemplate = template; // never shows
```

### Correct

```typescript
layer.popupEnabled = true;
layer.popupTemplate = template;
```

### Impact

The popup never opens.

### Diagnosis

Clicking does nothing; check `popupEnabled` and `view.popup`.

---

## Pitfall 2: Async content not returning a promise

### Anti-pattern

```typescript
content: (f) => { fetchExtra(f).then(render); }; // returns undefined
```

### Correct

```typescript
content: async (f) => { const data = await fetchExtra(f); return render(data); };
```

### Impact

The popup body is empty because nothing was returned.

### Diagnosis

Empty popup with async data; return a promise/element.

---

## Pitfall 3: Date fields shown as epoch numbers

### Anti-pattern

```typescript
{ fieldName: "CREATED" } // shows a raw timestamp
```

### Correct

```typescript
{ fieldName: "CREATED", format: { dateFormat: "short-date" } }
```

### Impact

Users see a large number instead of a date.

### Diagnosis

Numeric date; add a `dateFormat`.

---

## Pitfall 4: Relying on attributes not requested

### Anti-pattern

```typescript
content: (f) => String(f.graphic.attributes.RARE_FIELD); // not in outFields
```

### Correct

```typescript
new PopupTemplate({ outFields: ["RARE_FIELD"], content: ... });
```

### Impact

`undefined` in custom content.

### Diagnosis

Missing values; add fields to the template/layer `outFields`.

---

## Pitfall 5: Heavy work in the content function on every open

### Anti-pattern

```typescript
content: (f) => heavySyncRender(f); // recomputed each open
```

### Correct

```typescript
// Cache by objectId, or precompute; keep the function light.
```

### Impact

Sluggish popups for complex content.

### Diagnosis

Lag when opening popups; profile and cache.
