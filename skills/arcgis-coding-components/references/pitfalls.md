# Extended Pitfalls: Coding Components

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Setting properties before the element upgrades

### Anti-pattern

```typescript
editor.script = "..."; // element not defined yet
```

### Correct

```typescript
import "@arcgis/coding-components/components/arcgis-arcade-editor";
customElements.whenDefined("arcgis-arcade-editor").then(() => { editor.script = "..."; });
```

### Impact

The property is dropped.

### Diagnosis

Editor empty; wait for definition.

---

## Pitfall 2: SQL editor without a layer

### Anti-pattern

```typescript
// arcgis-sql-expression-editor with no layer
```

### Correct

```typescript
sqlEditor.layer = featureLayer;
```

### Impact

No field autocomplete/validation.

### Diagnosis

Weak suggestions; bind a layer.

---

## Pitfall 3: Ignoring diagnostics

### Anti-pattern

```typescript
apply(editor.script); // even with errors
```

### Correct

```typescript
// Check the editor's diagnostics/validity first.
```

### Impact

Invalid expressions reach runtime.

### Diagnosis

Runtime expression errors; validate first.

---

## Pitfall 4: Theme/assets not loaded

### Anti-pattern

```typescript
// Editor renders unstyled
```

### Correct

```typescript
// Ensure component styles/assets load (via npm import or CDN).
```

### Impact

Broken editor appearance.

### Diagnosis

Unstyled editor; check assets.

---

## Pitfall 5: Letting users edit production expressions unguarded

### Anti-pattern

```typescript
// Saving arbitrary user scripts straight into shared configs
```

### Correct

```typescript
// Validate + review before persisting shared/production expressions.
```

### Impact

Bad expressions affect everyone.

### Diagnosis

Shared maps break; add review/validation.
