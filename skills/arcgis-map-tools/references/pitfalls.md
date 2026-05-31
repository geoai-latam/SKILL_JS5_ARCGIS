# Extended Pitfalls: Map Tools

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Two sketch tools fighting for input

### Anti-pattern

```html
<arcgis-sketch></arcgis-sketch>
<arcgis-editor></arcgis-editor> <!-- both grab pointer -->
```

### Correct

```html
<!-- Use one drawing tool at a time, or coordinate their active states. -->
```

### Impact

Conflicting pointer handling.

### Diagnosis

Erratic drawing; run a single active tool.

---

## Pitfall 2: Measurement units assumed

### Anti-pattern

```html
<arcgis-distance-measurement-2d></arcgis-distance-measurement-2d> <!-- assume km -->
```

### Correct

```html
<!-- Set the unit explicitly; defaults vary by locale/view. -->
```

### Impact

Readings interpreted in the wrong unit.

### Diagnosis

Surprising magnitudes; set the unit.

---

## Pitfall 3: Sketch on a layer that's read-only in UX

### Anti-pattern

```typescript
// Drawing into a layer users think is editable but isn't persisted
```

### Correct

```typescript
// Make persistence explicit (applyEdits) and reflect it in the UI.
```

### Impact

Users lose work expecting auto-save.

### Diagnosis

Complaints about lost edits; clarify persistence.

---

## Pitfall 4: Not cleaning up tool graphics

### Anti-pattern

```typescript
// Leaving measurement/sketch graphics after closing the tool
```

### Correct

```typescript
// Clear the tool when done (it manages its own graphics layer).
```

### Impact

Stale graphics clutter the map.

### Diagnosis

Leftover lines/labels; clear/destroy the tool.

---

## Pitfall 5: Snapping perceived as broken

### Anti-pattern

```typescript
// Snapping enabled but tolerance too small / no sources
```

### Correct

```typescript
// Increase tolerance and add snapping sources.
```

### Impact

Users can't snap and assume it's off.

### Diagnosis

No snap behavior; check tolerance and sources.
